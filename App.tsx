// --- App.tsx ---
// This is the root component of the application. It manages the global state,
// handles routing between views, and orchestrates all major user interactions.

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PortfolioDisplay from './components/PortfolioDisplay';
import ActionButton from './components/ActionButton';
import CreateAccountModal from './components/CreateAccountModal';
import AccountWizardModal from './components/AccountWizardModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import RebalanceSettings from './components/RebalanceSettings';
import SettingsPage from './components/SettingsPage';
import OtherSettingsPage from './components/OtherSettingsPage';
import { INITIAL_ACCOUNTS, THEME_PALETTE, UI_CLASSES } from './constants';
import { DEFAULT_ASSET_ALIAS_GROUPS, mergeDefaultAssetAliasGroups, normalizeAssetName, normalizeAssetTargets, sanitizeAssetAliasGroups } from './assetNames';
import { Account, AccountData, Asset, AssetAliasGroup, AssetColorKey, RebalanceSuggestion } from './types';
import { getSavedLanguage, Language, translate } from './i18n';

// --- Type Definitions ---
type Theme = 'light' | 'dark';
type View = 'portfolio' | 'rebalanceSettings' | 'settings' | 'otherSettings'; // Defines the possible main views of the app
const ASSET_ALIAS_GROUPS_VERSION = '2';

const createEntityId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeAsset = (asset: Partial<Asset>, fallbackColorKey: AssetColorKey = 'sky'): Asset => {
  const name = typeof asset.name === 'string' && asset.name.trim() ? asset.name.trim() : 'Новый актив';
  const amount = Number.isFinite(Number(asset.amount)) ? Number(asset.amount) : 0;
  const colorKey = asset.colorKey && THEME_PALETTE[asset.colorKey as AssetColorKey] ? asset.colorKey as AssetColorKey : fallbackColorKey;
  const color = THEME_PALETTE[colorKey].hex;

  return {
    id: typeof asset.id === 'string' && asset.id ? asset.id : createEntityId('asset'),
    name,
    amount,
    value: Number.isFinite(Number(asset.value)) ? Number(asset.value) : 0,
    color,
    colorKey,
  };
};

const normalizeAccounts = (value: unknown): Account[] => {
  if (!Array.isArray(value)) {
    return INITIAL_ACCOUNTS;
  }

  const normalized = value
    .map((account) => {
      if (!account || typeof account !== 'object') {
        return null;
      }

      const candidate = account as Partial<Account> & { data?: Partial<AccountData> };
      const name = typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.trim() : 'Новый счет';
      const rawAssets = Array.isArray(candidate.data?.assets) ? candidate.data.assets : [];
      const normalizedAssets = rawAssets.map((asset) => normalizeAsset(asset as Partial<Asset>));
      const totalValue = Number.isFinite(Number(candidate.data?.totalValue)) ? Number(candidate.data?.totalValue) : normalizedAssets.reduce((sum, asset) => sum + asset.amount, 0);

      return {
        id: typeof candidate.id === 'string' && candidate.id ? candidate.id : createEntityId('account'),
        name,
        data: {
          totalValue,
          currency: typeof candidate.data?.currency === 'string' && candidate.data.currency ? candidate.data.currency : '₽',
          assetCount: normalizedAssets.length,
          assets: normalizedAssets,
        },
      } satisfies Account;
    })
    .filter((account): account is Account => account !== null);

  return normalized.length > 0 ? normalized : INITIAL_ACCOUNTS;
};

const normalizeTargets = (value: unknown): { [key: string]: number } => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>((acc, [key, entryValue]) => {
    const numericValue = Number(entryValue);
    if (Number.isFinite(numericValue)) {
      acc[key] = numericValue;
    }
    return acc;
  }, {});
};

// Get an array of color keys to cycle through when creating new assets
const COLOR_PALETTE_KEYS = Object.keys(THEME_PALETTE);

/**
 * The main application component.
 */
const App: React.FC = () => {
  // --- State Management ---
  const [theme, setTheme] = useState<Theme>('dark'); // Manages the current UI theme (light/dark)
  const [language, setLanguage] = useState<Language>(getSavedLanguage);
  const [isCreateAccountModalOpen, setCreateAccountModalOpen] = useState(false); // Controls visibility of the create/edit account modal
  const [isAccountWizardOpen, setAccountWizardOpen] = useState(false); // Controls visibility of the account wizard modal
  
  // Load accounts from localStorage or use initial data for the first launch.
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const item = window.localStorage.getItem('portfolioAccounts');
      if (!item) {
        return INITIAL_ACCOUNTS;
      }

      const parsed = JSON.parse(item);
      return normalizeAccounts(parsed);
    } catch (error) {
      console.error("Failed to load accounts from localStorage", error);
      return INITIAL_ACCOUNTS;
    }
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>('all'); // ID of the currently selected account, or 'all'
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false); // Controls visibility of the delete confirmation modal
  const [accountToDeleteId, setAccountToDeleteId] = useState<string | null>(null); // Stores the ID of the account pending deletion
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null); // Stores the account object for editing
  
  const [currentView, setCurrentView] = useState<View>('portfolio'); // Controls which main view is displayed
  const [isRebalancePreviewActive, setRebalancePreviewActive] = useState(false);

  // State for rebalancing, persisted in localStorage for a better user experience.
  const [rebalanceTargets, setRebalanceTargets] = useState<{ [key: string]: number }>(() => {
    try {
      const item = window.localStorage.getItem('rebalanceTargets');
      if (!item) {
        return {};
      }

      return normalizeTargets(JSON.parse(item));
    } catch (error) {
      console.error("Failed to load rebalance targets from localStorage", error);
      return {};
    }
  });

  const [isRebalanceModeActive, setIsRebalanceModeActive] = useState<boolean>(() => {
    try {
      const item = window.localStorage.getItem('isRebalanceModeActive');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.error("Failed to load rebalance mode from localStorage", error);
      return false;
    }
  });

  const [isAssetNameNormalizationEnabled, setAssetNameNormalizationEnabled] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('isAssetNameNormalizationEnabled') === 'true';
    } catch (error) {
      console.error('Failed to load asset name normalization setting:', error);
      return false;
    }
  });

  const [assetAliasGroups, setAssetAliasGroups] = useState<AssetAliasGroup[]>(() => {
    try {
      const item = window.localStorage.getItem('assetAliasGroups');
      if (!item) {
        window.localStorage.setItem('assetAliasGroupsVersion', ASSET_ALIAS_GROUPS_VERSION);
        return DEFAULT_ASSET_ALIAS_GROUPS;
      }

      const savedGroups = sanitizeAssetAliasGroups(JSON.parse(item));
      if (window.localStorage.getItem('assetAliasGroupsVersion') === ASSET_ALIAS_GROUPS_VERSION) {
        return savedGroups;
      }

      const updatedGroups = mergeDefaultAssetAliasGroups(savedGroups);
      try {
        window.localStorage.setItem('assetAliasGroups', JSON.stringify(updatedGroups));
        window.localStorage.setItem('assetAliasGroupsVersion', ASSET_ALIAS_GROUPS_VERSION);
      } catch (error) {
        console.error('Failed to update default asset alias groups:', error);
      }
      return updatedGroups;
    } catch (error) {
      console.error('Failed to load asset alias groups:', error);
      return DEFAULT_ASSET_ALIAS_GROUPS;
    }
  });

  // --- Effects ---

  // Toggles the 'dark' class on the <html> element when the theme changes.
  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, language]);

  useEffect(() => {
    try {
      window.localStorage.setItem('appLanguage', language);
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  }, [language]);

  // Persist accounts to localStorage whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem('portfolioAccounts', JSON.stringify(accounts));
    } catch (error) {
      console.error("Failed to save accounts to localStorage", error);
    }
  }, [accounts]);
  
  // --- Memoized Calculations ---
  // These use `useMemo` to avoid expensive recalculations on every render.

  /**
   * Calculates the data to be displayed in the portfolio view.
   * If 'all' accounts are selected, it aggregates data from all accounts.
   * Otherwise, it returns the data for the single selected account.
   */
  const currentAccountData = useMemo<AccountData | null>(() => {
    if (selectedAccountId === 'all') {
      // Handle case with no accounts
      if (accounts.length === 0) {
        return { totalValue: 0, currency: '₽', assetCount: 0, assets: [] };
      }
      
      // Aggregate data from all accounts
      const allAssets = accounts.flatMap(acc => acc.data.assets);
      const totalValue = accounts.reduce((sum, acc) => sum + acc.data.totalValue, 0);

      const aggregatedAssetsMap = new Map<string, { name: string; amount: number; color: string; colorKey: AssetColorKey; }>();

      allAssets.forEach(asset => {
        const { key, displayName } = normalizeAssetName(asset.name, isAssetNameNormalizationEnabled, assetAliasGroups);
        const existing = aggregatedAssetsMap.get(key);
        if (existing) {
          existing.amount += asset.amount;
        } else {
          aggregatedAssetsMap.set(key, { ...asset, name: displayName });
        }
      });
      
      const aggregatedAssets: Asset[] = Array.from(aggregatedAssetsMap.values()).map(aggAsset => ({
        id: aggAsset.name,
        name: aggAsset.name,
        amount: aggAsset.amount,
        value: totalValue > 0 ? (aggAsset.amount / totalValue) * 100 : 0,
        color: aggAsset.color,
        colorKey: aggAsset.colorKey,
      }));

      return { totalValue, currency: '₽', assetCount: aggregatedAssets.length, assets: aggregatedAssets };
    }
    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    if (!selectedAccount) return null;
    if (!isAssetNameNormalizationEnabled) return selectedAccount.data;

    const groupedAssets = new Map<string, Asset>();
    selectedAccount.data.assets.forEach(asset => {
      const { key, displayName } = normalizeAssetName(asset.name, isAssetNameNormalizationEnabled, assetAliasGroups);
      const existing = groupedAssets.get(key);
      if (existing) {
        existing.amount += asset.amount;
      } else {
        groupedAssets.set(key, { ...asset, name: displayName });
      }
    });
    const assets = Array.from(groupedAssets.values()).map(asset => ({
      ...asset,
      value: selectedAccount.data.totalValue > 0 ? (asset.amount / selectedAccount.data.totalValue) * 100 : 0,
    }));

    return { ...selectedAccount.data, assetCount: assets.length, assets };
  }, [selectedAccountId, accounts, isAssetNameNormalizationEnabled, assetAliasGroups]);

  /**
   * Extracts a list of all unique assets across all accounts.
   * This is used for the rebalance settings page.
   */
  const allUniqueAssets = useMemo<Asset[]>(() => {
    const allAssets = accounts.flatMap(acc => acc.data.assets);
    const uniqueAssetsMap = new Map<string, Asset>();
    allAssets.forEach(asset => {
        const { key, displayName } = normalizeAssetName(asset.name, isAssetNameNormalizationEnabled, assetAliasGroups);
        const existing = uniqueAssetsMap.get(key);
        if (existing) {
          existing.amount += asset.amount;
        } else {
            uniqueAssetsMap.set(key, { ...asset, name: displayName });
        }
    });
    return Array.from(uniqueAssetsMap.values());
  }, [accounts, isAssetNameNormalizationEnabled, assetAliasGroups]);

  const normalizedRebalanceTargets = useMemo(
    () => normalizeAssetTargets(rebalanceTargets, isAssetNameNormalizationEnabled, assetAliasGroups),
    [rebalanceTargets, isAssetNameNormalizationEnabled, assetAliasGroups],
  );

  const rebalanceTargetsForSettings = useMemo(
    () => Object.fromEntries(allUniqueAssets.map(asset => {
      const { key } = normalizeAssetName(asset.name, isAssetNameNormalizationEnabled, assetAliasGroups);
      return [asset.name, normalizedRebalanceTargets[key] || 0];
    })),
    [allUniqueAssets, normalizedRebalanceTargets, isAssetNameNormalizationEnabled, assetAliasGroups],
  );

  /**
   * Calculates rebalancing suggestions based on current holdings and target allocations.
   */
  const rebalanceSuggestions = useMemo<RebalanceSuggestion[]>(() => {
    if (!isRebalanceModeActive || selectedAccountId !== 'all' || !currentAccountData || Object.keys(normalizedRebalanceTargets).length === 0) {
      return [];
    }

    const { totalValue, assets } = currentAccountData;
    if (totalValue === 0) return [];
    
    const suggestions: RebalanceSuggestion[] = [];

    assets.forEach(asset => {
        const currentAmount = asset.amount;
        const { key } = normalizeAssetName(asset.name, isAssetNameNormalizationEnabled, assetAliasGroups);
        const targetPercentage = normalizedRebalanceTargets[key] || 0;
        const targetAmount = totalValue * (targetPercentage / 100);
        const deviation = currentAmount - targetAmount;

        // Only suggest action if deviation is meaningful
        if (Math.abs(deviation) >= 0.01) {
            if (deviation > 0) { // Current is higher than target -> Decrease
                suggestions.push({ name: asset.name, action: 'Decrease', amount: deviation });
            } else { // Current is lower than target -> Increase
                suggestions.push({ name: asset.name, action: 'Increase', amount: Math.abs(deviation) });
            }
        }
    });
    // Sort suggestions by the largest amount to prioritize biggest changes
    return suggestions.sort((a, b) => b.amount - a.amount);
  }, [isRebalanceModeActive, selectedAccountId, currentAccountData, normalizedRebalanceTargets, isAssetNameNormalizationEnabled, assetAliasGroups]);

  const rebalancePreviewData = useMemo<AccountData | null>(() => {
    if (!isRebalanceModeActive || selectedAccountId !== 'all' || !currentAccountData || currentAccountData.totalValue <= 0) {
      return null;
    }

    const targetAllocations = currentAccountData.assets.map(asset => {
      const { key } = normalizeAssetName(asset.name, isAssetNameNormalizationEnabled, assetAliasGroups);
      return { asset, targetPercentage: normalizedRebalanceTargets[key] || 0 };
    });
    const targetTotal = targetAllocations.reduce((total, entry) => total + entry.targetPercentage, 0);

    if (Math.abs(targetTotal - 100) > 0.01) {
      return null;
    }

    const assets = targetAllocations
      .filter(entry => entry.targetPercentage > 0)
      .map(({ asset, targetPercentage }) => ({
        ...asset,
        amount: currentAccountData.totalValue * (targetPercentage / 100),
        value: targetPercentage,
      }));

    return { ...currentAccountData, assetCount: assets.length, assets };
  }, [isRebalanceModeActive, selectedAccountId, currentAccountData, normalizedRebalanceTargets, isAssetNameNormalizationEnabled, assetAliasGroups]);

  // --- Event Handlers ---
  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

  const handleToggleAssetNameNormalization = (enabled: boolean) => {
    try {
      window.localStorage.setItem('isAssetNameNormalizationEnabled', String(enabled));
      setAssetNameNormalizationEnabled(enabled);
    } catch (error) {
      console.error('Failed to save asset name normalization setting:', error);
    }
  };

  const handleSaveAssetAliasGroups = (groups: AssetAliasGroup[]): boolean => {
    try {
      window.localStorage.setItem('assetAliasGroups', JSON.stringify(groups));
      window.localStorage.setItem('assetAliasGroupsVersion', ASSET_ALIAS_GROUPS_VERSION);
      setAssetAliasGroups(groups);
      return true;
    } catch (error) {
      console.error('Failed to save asset alias groups:', error);
      return false;
    }
  };

  const handleSetLanguage = (nextLanguage: Language) => {
    try {
      window.localStorage.setItem('appLanguage', nextLanguage);
      setLanguage(nextLanguage);
      return true;
    } catch (error) {
      console.error('Failed to save language setting:', error);
      return false;
    }
  };

  const handleRestoreSettings = (contents: {
    settings?: {
      language: Language;
      normalizationEnabled: boolean;
      aliasGroups: AssetAliasGroup[];
      rebalanceTargets: Record<string, number>;
      rebalanceModeActive: boolean;
    };
    accounts?: Account[];
  }): boolean => {
    const settingsToRestore = contents.settings
      ? {
          appLanguage: contents.settings.language,
          isAssetNameNormalizationEnabled: String(contents.settings.normalizationEnabled),
          assetAliasGroups: JSON.stringify(contents.settings.aliasGroups),
          assetAliasGroupsVersion: ASSET_ALIAS_GROUPS_VERSION,
          rebalanceTargets: JSON.stringify(contents.settings.rebalanceTargets),
          isRebalanceModeActive: JSON.stringify(contents.settings.rebalanceModeActive),
        }
      : {};
    const restoredAccounts = contents.accounts
      ? contents.accounts.length === 0
        ? []
        : normalizeAccounts(contents.accounts).map(account => ({
            ...account,
            id: createEntityId('account'),
            data: {
              ...account.data,
              assets: account.data.assets.map(asset => ({ ...asset, id: createEntityId('asset') })),
            },
          }))
      : [];
    const nextAccounts = contents.accounts ? [...accounts, ...restoredAccounts] : accounts;
    const storageUpdates = {
      ...settingsToRestore,
      ...(contents.accounts ? { portfolioAccounts: JSON.stringify(nextAccounts) } : {}),
    };
    const previousSettings = Object.keys(storageUpdates).reduce<Record<string, string | null>>((previous, key) => {
      previous[key] = window.localStorage.getItem(key);
      return previous;
    }, {});

    try {
      Object.entries(storageUpdates).forEach(([key, value]) => window.localStorage.setItem(key, value));
      if (contents.settings) {
        setLanguage(contents.settings.language);
        setAssetNameNormalizationEnabled(contents.settings.normalizationEnabled);
        setAssetAliasGroups(contents.settings.aliasGroups);
        setRebalanceTargets(contents.settings.rebalanceTargets);
        setIsRebalanceModeActive(contents.settings.rebalanceModeActive);
      }
      if (contents.accounts) {
        setAccounts(nextAccounts);
      }
      return true;
    } catch (error) {
      Object.entries(previousSettings).forEach(([key, value]) => {
        try {
          if (value === null) window.localStorage.removeItem(key);
          else window.localStorage.setItem(key, value);
        } catch (restoreError) {
          console.error(`Failed to roll back setting ${key}:`, restoreError);
        }
      });
      console.error('Failed to restore settings backup:', error);
      return false;
    }
  };

  const handleSaveRebalanceTargets = (targets: { [key:string]: number }) => {
    try {
        setRebalanceTargets(targets);
        setRebalancePreviewActive(false);
        window.localStorage.setItem('rebalanceTargets', JSON.stringify(targets));
        setCurrentView('portfolio'); // Navigate back to portfolio view after saving
    } catch (error) {
        console.error("Failed to save rebalance targets:", error);
    }
  };

  const toggleRebalanceMode = () => {
    setRebalancePreviewActive(false);
    setIsRebalanceModeActive(prev => {
        const newState = !prev;
        try {
          window.localStorage.setItem('isRebalanceModeActive', JSON.stringify(newState));
        } catch (error) {
          console.error("Failed to save rebalance mode:", error);
        }
        return newState;
    });
  };
  
  const handleCreateAccount = (data: { accountName: string; fields: { name: string; amount: string }[] }) => {
    const newTotalValue = data.fields.reduce((sum, field) => sum + parseFloat(field.amount || '0'), 0);

    const newAssets: Asset[] = data.fields.map((field, index) => {
      const colorKey = COLOR_PALETTE_KEYS[index % COLOR_PALETTE_KEYS.length];
      const paletteEntry = THEME_PALETTE[colorKey as keyof typeof THEME_PALETTE];
      const amount = parseFloat(field.amount);
      return {
        id: createEntityId('asset'),
        name: field.name,
        amount: amount,
        value: newTotalValue > 0 ? (amount / newTotalValue) * 100 : 0,
        color: paletteEntry.hex,
        colorKey: colorKey as AssetColorKey,
      };
    });

    const newAccount: Account = {
      id: createEntityId('account'),
      name: data.accountName,
      data: { totalValue: newTotalValue, currency: '₽', assetCount: newAssets.length, assets: newAssets },
    };

    setAccounts(prev => [...prev, newAccount]);
    setSelectedAccountId(newAccount.id); // Automatically select the new account
    setCreateAccountModalOpen(false);
  };

  const handleEditRequest = (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (account) {
      setAccountToEdit(account);
      setCreateAccountModalOpen(true);
    }
  };

  const handleUpdateAccount = (data: { accountId: string; accountName: string; fields: { name: string; amount: string }[] }) => {
    const newTotalValue = data.fields.reduce((sum, field) => sum + parseFloat(field.amount || '0'), 0);

    const newAssets: Asset[] = data.fields.map((field, index) => {
      const colorKey = COLOR_PALETTE_KEYS[index % COLOR_PALETTE_KEYS.length];
      const paletteEntry = THEME_PALETTE[colorKey as keyof typeof THEME_PALETTE];
      const amount = parseFloat(field.amount);
      return {
        id: createEntityId('asset'),
        name: field.name,
        amount: amount,
        value: newTotalValue > 0 ? (amount / newTotalValue) * 100 : 0,
        color: paletteEntry.hex,
        colorKey: colorKey as AssetColorKey,
      };
    });

    const updatedAccount: Account = {
      id: data.accountId,
      name: data.accountName,
      data: { totalValue: newTotalValue, currency: '₽', assetCount: newAssets.length, assets: newAssets },
    };

    setAccounts(prev => prev.map(acc => (acc.id === data.accountId ? updatedAccount : acc)));
    setCreateAccountModalOpen(false);
    setAccountToEdit(null); // Clear the account being edited
  };
  
  const handleDeleteRequest = (id: string) => {
    if (id === 'all') return;
    setAccountToDeleteId(id);
    setConfirmDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!accountToDeleteId) return;
    setAccounts(prev => prev.filter(acc => acc.id !== accountToDeleteId));
    // If the deleted account was selected, switch back to 'All Accounts' view
    if (selectedAccountId === accountToDeleteId) {
      setSelectedAccountId('all');
    }
    setConfirmDeleteModalOpen(false);
    setAccountToDeleteId(null);
  };
  
  const accountToDelete = accounts.find(acc => acc.id === accountToDeleteId);
  
  const handleModalClose = () => {
    setCreateAccountModalOpen(false);
    setAccountToEdit(null); // Ensure edit state is cleared on close
  };

  // --- Conditional Rendering ---
  // Renders the RebalanceSettings view if currentView is 'rebalanceSettings'.
  if (currentView === 'rebalanceSettings') {
    return (
      <RebalanceSettings
        allAssets={allUniqueAssets}
        currentTargets={rebalanceTargetsForSettings}
        onSave={handleSaveRebalanceTargets}
        onBack={() => setCurrentView('portfolio')}
        language={language}
      />
    );
  }

  if (currentView === 'settings') {
    return (
      <SettingsPage
        onBack={() => setCurrentView('portfolio')}
        language={language}
        normalizationEnabled={isAssetNameNormalizationEnabled}
        onNormalizationEnabledChange={handleToggleAssetNameNormalization}
        aliasGroups={assetAliasGroups}
        onSaveAliasGroups={handleSaveAssetAliasGroups}
      />
    );
  }

  if (currentView === 'otherSettings') {
    return (
      <OtherSettingsPage
        language={language}
        onLanguageChange={handleSetLanguage}
        backup={{
          language,
          normalizationEnabled: isAssetNameNormalizationEnabled,
          aliasGroups: assetAliasGroups,
          rebalanceTargets,
          rebalanceModeActive: isRebalanceModeActive,
        }}
        accounts={accounts}
        onRestore={handleRestoreSettings}
        onBack={() => setCurrentView('portfolio')}
      />
    );
  }

  // Default render: The main portfolio dashboard.
  return (
    <>
      <div className={`min-h-screen ${UI_CLASSES.appBg} ${UI_CLASSES.textPrimary} flex flex-col font-sans transition-colors duration-300 ease-in-out`}>
        <Header 
          currentTheme={theme} 
          toggleTheme={toggleTheme} 
          onOpenCreateAccountModal={() => setCreateAccountModalOpen(true)}
          onOpenAccountWizard={() => setAccountWizardOpen(true)}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={(id) => {
            setSelectedAccountId(id);
            setRebalancePreviewActive(false);
          }}
          onDeleteAccount={handleDeleteRequest}
          onEditAccount={handleEditRequest}
          onNavigateToSettings={() => setCurrentView('rebalanceSettings')}
          onNavigateToGeneralSettings={() => setCurrentView('settings')}
          onNavigateToOtherSettings={() => setCurrentView('otherSettings')}
          language={language}
        />
        <main className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col items-center">
          {currentAccountData ? (
            <PortfolioDisplay 
              data={currentAccountData} 
              isRebalanceModeActive={isRebalanceModeActive && selectedAccountId === 'all'}
              rebalanceSuggestions={rebalanceSuggestions}
              language={language}
              rebalancePreviewData={rebalancePreviewData}
              isShowingRebalancePreview={isRebalancePreviewActive}
              onToggleRebalancePreview={() => setRebalancePreviewActive(active => !active)}
            />
          ) : (
            // Displayed when no account is found or when there are no accounts
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold">{translate(language, 'Счетов не найдено', 'No accounts found')}</h2>
              <p className={UI_CLASSES.textSecondary}>{translate(language, 'Создайте новый счет, чтобы начать.', 'Create a new account to get started.')}</p>
            </div>
          )}
        </main>
        {/* The rebalance button is only shown in the 'All Accounts' view */}
        {selectedAccountId === 'all' && accounts.length > 0 && (
          <ActionButton 
            text={translate(language, 'Ребалансировка', 'Rebalance')}
            onClick={toggleRebalanceMode}
            isActive={isRebalanceModeActive}
          />
        )}
      </div>
      
      {/* Modals are rendered here but controlled by state */}
      <CreateAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={handleModalClose}
        onCreate={handleCreateAccount}
        onUpdate={handleUpdateAccount}
        accountToEdit={accountToEdit}
        language={language}
      />
      <AccountWizardModal
        isOpen={isAccountWizardOpen}
        onClose={() => setAccountWizardOpen(false)}
        onCreate={handleCreateAccount}
        language={language}
      />
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setConfirmDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        accountName={accountToDelete?.name || ''}
        language={language}
      />
    </>
  );
};

export default App;