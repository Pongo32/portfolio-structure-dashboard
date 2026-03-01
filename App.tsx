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
import { INITIAL_ACCOUNTS, THEME_PALETTE, UI_CLASSES } from './constants';
import { Account, AccountData, Asset, AssetColorKey, RebalanceSuggestion } from './types';

// --- Type Definitions ---
type Theme = 'light' | 'dark';
type View = 'portfolio' | 'rebalanceSettings'; // Defines the possible main views of the app

// Get an array of color keys to cycle through when creating new assets
const COLOR_PALETTE_KEYS = Object.keys(THEME_PALETTE);

/**
 * The main application component.
 */
const App: React.FC = () => {
  // --- State Management ---
  const [theme, setTheme] = useState<Theme>('dark'); // Manages the current UI theme (light/dark)
  const [isCreateAccountModalOpen, setCreateAccountModalOpen] = useState(false); // Controls visibility of the create/edit account modal
  const [isAccountWizardOpen, setAccountWizardOpen] = useState(false); // Controls visibility of the account wizard modal
  
  // Load accounts from localStorage or use initial data for the first launch.
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const item = window.localStorage.getItem('portfolioAccounts');
      return item ? JSON.parse(item) : INITIAL_ACCOUNTS;
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

  // State for rebalancing, persisted in localStorage for a better user experience.
  const [rebalanceTargets, setRebalanceTargets] = useState<{ [key: string]: number }>(() => {
    try {
      const item = window.localStorage.getItem('rebalanceTargets');
      return item ? JSON.parse(item) : {};
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

  // --- Effects ---

  // Toggles the 'dark' class on the <html> element when the theme changes.
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

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
        const existing = aggregatedAssetsMap.get(asset.name);
        if (existing) {
          existing.amount += asset.amount;
        } else {
          aggregatedAssetsMap.set(asset.name, { ...asset });
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
    // Return data for a single selected account
    return accounts.find(acc => acc.id === selectedAccountId)?.data ?? null;
  }, [selectedAccountId, accounts]);

  /**
   * Extracts a list of all unique assets across all accounts.
   * This is used for the rebalance settings page.
   */
  const allUniqueAssets = useMemo<Asset[]>(() => {
    const allAssets = accounts.flatMap(acc => acc.data.assets);
    const uniqueAssetsMap = new Map<string, Asset>();
    allAssets.forEach(asset => {
        if (!uniqueAssetsMap.has(asset.name)) {
            uniqueAssetsMap.set(asset.name, asset);
        }
    });
    return Array.from(uniqueAssetsMap.values());
  }, [accounts]);

  /**
   * Calculates rebalancing suggestions based on current holdings and target allocations.
   */
  const rebalanceSuggestions = useMemo<RebalanceSuggestion[]>(() => {
    if (!isRebalanceModeActive || selectedAccountId !== 'all' || !currentAccountData || Object.keys(rebalanceTargets).length === 0) {
      return [];
    }

    const { totalValue, assets } = currentAccountData;
    if (totalValue === 0) return [];
    
    const suggestions: RebalanceSuggestion[] = [];

    assets.forEach(asset => {
        const currentAmount = asset.amount;
        const targetPercentage = rebalanceTargets[asset.name] || 0;
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
  }, [isRebalanceModeActive, selectedAccountId, currentAccountData, rebalanceTargets]);

  // --- Event Handlers ---
  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

  const handleSaveRebalanceTargets = (targets: { [key:string]: number }) => {
    try {
        setRebalanceTargets(targets);
        window.localStorage.setItem('rebalanceTargets', JSON.stringify(targets));
        setCurrentView('portfolio'); // Navigate back to portfolio view after saving
    } catch (error) {
        console.error("Failed to save rebalance targets:", error);
    }
  };

  const toggleRebalanceMode = () => {
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
        id: `${Date.now()}-${field.name}`,
        name: field.name,
        amount: amount,
        value: newTotalValue > 0 ? (amount / newTotalValue) * 100 : 0,
        color: paletteEntry.hex,
        colorKey: colorKey as AssetColorKey,
      };
    });

    const newAccount: Account = {
      id: Date.now().toString(),
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
        id: `${Date.now()}-${field.name}`,
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
        currentTargets={rebalanceTargets}
        onSave={handleSaveRebalanceTargets}
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
          onSelectAccount={setSelectedAccountId}
          onDeleteAccount={handleDeleteRequest}
          onEditAccount={handleEditRequest}
          onNavigateToSettings={() => setCurrentView('rebalanceSettings')}
        />
        <main className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col items-center">
          {currentAccountData ? (
            <PortfolioDisplay 
              data={currentAccountData} 
              isRebalanceModeActive={isRebalanceModeActive && selectedAccountId === 'all'}
              rebalanceSuggestions={rebalanceSuggestions}
            />
          ) : (
            // Displayed when no account is found or when there are no accounts
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold">Счетов не найдено</h2>
              <p className={UI_CLASSES.textSecondary}>Создайте новый счет, чтобы начать.</p>
            </div>
          )}
        </main>
        {/* The rebalance button is only shown in the 'All Accounts' view */}
        {selectedAccountId === 'all' && accounts.length > 0 && (
          <ActionButton 
            text="Ребалансировка" 
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
      />
      <AccountWizardModal
        isOpen={isAccountWizardOpen}
        onClose={() => setAccountWizardOpen(false)}
        onCreate={handleCreateAccount}
      />
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setConfirmDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        accountName={accountToDelete?.name || ''}
      />
    </>
  );
};

export default App;