import React, { ChangeEvent, useRef, useState } from 'react';
import { Account, AssetAliasGroup } from '../types';
import { Language, translate } from '../i18n';
import { UI_CLASSES } from '../constants';

interface SettingsBackupData {
  language: Language;
  normalizationEnabled: boolean;
  aliasGroups: AssetAliasGroup[];
  rebalanceTargets: Record<string, number>;
  rebalanceModeActive: boolean;
}

interface BackupContents {
  settings?: SettingsBackupData;
  accounts?: Account[];
}

interface OtherSettingsPageProps {
  language: Language;
  onLanguageChange: (language: Language) => boolean;
  backup: SettingsBackupData;
  accounts: Account[];
  onRestore: (contents: BackupContents) => boolean;
  onBack: () => void;
}

const isSettingsBackupData = (value: unknown): value is SettingsBackupData => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SettingsBackupData>;
  if (
    (candidate.language !== 'ru' && candidate.language !== 'en') ||
    typeof candidate.normalizationEnabled !== 'boolean' ||
    typeof candidate.rebalanceModeActive !== 'boolean' ||
    !Array.isArray(candidate.aliasGroups) ||
    !candidate.rebalanceTargets ||
    typeof candidate.rebalanceTargets !== 'object' ||
    Array.isArray(candidate.rebalanceTargets)
  ) {
    return false;
  }

  const groupsValid = candidate.aliasGroups.every(group =>
    Boolean(group) &&
    typeof group.canonicalName === 'string' &&
    Array.isArray(group.aliases) &&
    group.aliases.every(alias => typeof alias === 'string'),
  );
  const targetsValid = Object.values(candidate.rebalanceTargets).every(target =>
    typeof target === 'number' && Number.isFinite(target) && target >= 0 && target <= 100,
  );

  return groupsValid && targetsValid;
};

const isAccountList = (value: unknown): value is Account[] =>
  Array.isArray(value) && value.every(account =>
    Boolean(account) &&
    typeof account.id === 'string' &&
    typeof account.name === 'string' &&
    Boolean(account.name.trim()) &&
    Boolean(account.data) &&
    Number.isFinite(account.data.totalValue) &&
    account.data.totalValue >= 0 &&
    typeof account.data.currency === 'string' &&
    Boolean(account.data.currency) &&
    Array.isArray(account.data.assets) &&
    account.data.assets.every(asset =>
      Boolean(asset) &&
      typeof asset.name === 'string' &&
      Boolean(asset.name.trim()) &&
      Number.isFinite(asset.amount) &&
      asset.amount >= 0 &&
      Number.isFinite(asset.value) &&
      asset.value >= 0 &&
      asset.value <= 100 &&
      typeof asset.colorKey === 'string',
    ),
  );

const parseBackup = (value: unknown): BackupContents | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as {
    format?: unknown;
    version?: unknown;
    settings?: unknown;
    accounts?: unknown;
  } & Partial<SettingsBackupData>;

  if (candidate.format !== 'portfolio-structure-dashboard-settings') return null;
  if (candidate.version === 1) {
    return isSettingsBackupData(candidate)
      ? { settings: candidate }
      : null;
  }
  if (candidate.version !== 2) return null;

  const hasSettings = candidate.settings !== undefined;
  const hasAccounts = candidate.accounts !== undefined;
  if (!hasSettings && !hasAccounts) return null;
  if (hasSettings && !isSettingsBackupData(candidate.settings)) return null;
  if (hasAccounts && !isAccountList(candidate.accounts)) return null;

  return {
    ...(hasSettings ? { settings: candidate.settings as SettingsBackupData } : {}),
    ...(hasAccounts ? { accounts: candidate.accounts as Account[] } : {}),
  };
};

const OtherSettingsPage: React.FC<OtherSettingsPageProps> = ({
  language,
  onLanguageChange,
  backup,
  accounts,
  onRestore,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [includeSettings, setIncludeSettings] = useState(true);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(() => accounts.map(account => account.id));
  const selectedAccounts = accounts.filter(account => selectedAccountIds.includes(account.id));
  const hasBackupContent = includeSettings || selectedAccounts.length > 0;

  const toggleAccount = (accountId: string) => {
    setSelectedAccountIds(current =>
      current.includes(accountId)
        ? current.filter(id => id !== accountId)
        : [...current, accountId],
    );
  };

  const handleLanguageChange = (nextLanguage: Language) => {
    const saved = onLanguageChange(nextLanguage);
    setMessage(saved
      ? { text: translate(nextLanguage, 'Язык сохранен.', 'Language saved.'), isError: false }
      : { text: translate(language, 'Не удалось сохранить язык.', 'Could not save language.'), isError: true });
  };

  const handleExport = () => {
    try {
      const backupContent = {
        format: 'portfolio-structure-dashboard-settings',
        version: 2,
        createdAt: new Date().toISOString(),
        ...(includeSettings ? { settings: backup } : {}),
        ...(selectedAccounts.length > 0 ? { accounts: selectedAccounts } : {}),
      };
      const blob = new Blob([JSON.stringify(backupContent, null, 2)], { type: 'application/json' });
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = 'portfolio-dashboard-backup.json';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setMessage({ text: translate(language, 'Бекап скачан.', 'Backup downloaded.'), isError: false });
    } catch (error) {
      console.error('Failed to export backup:', error);
      setMessage({ text: translate(language, 'Не удалось создать бекап.', 'Could not create backup.'), isError: true });
    }
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsProcessingFile(true);
    setMessage(null);
    try {
      const contents: unknown = JSON.parse(await file.text());
      const parsedBackup = parseBackup(contents);
      if (!parsedBackup) {
        setMessage({
          text: translate(language, 'Файл не является корректным бекапом.', 'This file is not a valid backup.'),
          isError: true,
        });
        return;
      }

      const restored = onRestore(parsedBackup);
      setMessage(restored
        ? {
            text: translate(
              parsedBackup.settings?.language || language,
              `Бекап восстановлен. Добавлено счетов: ${parsedBackup.accounts?.length || 0}.`,
              `Backup restored. Accounts added: ${parsedBackup.accounts?.length || 0}.`,
            ),
            isError: false,
          }
        : { text: translate(language, 'Не удалось восстановить бекап. Хранилище недоступно.', 'Could not restore backup. Storage is unavailable.'), isError: true });
    } catch (error) {
      console.error('Failed to read backup:', error);
      setMessage({
        text: translate(language, 'Не удалось прочитать файл. Проверьте формат JSON.', 'Could not read the file. Check that it is valid JSON.'),
        isError: true,
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  return (
    <div className={`min-h-screen ${UI_CLASSES.appBg} ${UI_CLASSES.textPrimary} flex flex-col font-sans transition-colors duration-300 ease-in-out`}>
      <header className={`p-4 flex justify-between items-center ${UI_CLASSES.headerBg} shadow-md sticky top-0 z-30`}>
        <button onClick={onBack} aria-label={translate(language, 'Назад', 'Back')} className={`${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} p-2 rounded-md`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-base sm:text-lg font-semibold">{translate(language, 'Прочие настройки', 'Other settings')}</h1>
        <div className="w-11" aria-hidden="true" />
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className={`w-full max-w-md md:max-w-2xl ${UI_CLASSES.cardBg} p-4 sm:p-6 rounded-xl shadow-xl space-y-6`}>
          <section>
            <h2 className="text-lg font-semibold mb-3">{translate(language, 'Язык приложения', 'Application language')}</h2>
            <div className="flex gap-3" role="group" aria-label={translate(language, 'Выбор языка', 'Choose language')}>
              {(['ru', 'en'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={language === option}
                  onClick={() => handleLanguageChange(option)}
                  className={`min-w-20 px-5 py-2 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                    language === option
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {option === 'ru' ? 'RU' : 'ENG'}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h2 className="text-lg font-semibold mb-2">{translate(language, 'Бекап и восстановление', 'Backup and restore')}</h2>
            <p className={`text-sm leading-5 mb-4 ${UI_CLASSES.textSecondary}`}>
              {translate(language, 'Выберите настройки и счета, которые нужно сохранить. При восстановлении счета будут добавлены к существующим, без их замены.', 'Choose the settings and accounts to save. When restored, accounts are added to existing ones without replacing them.')}
            </p>
            <div className="space-y-3 mb-5">
              <label className="flex items-start gap-3 cursor-pointer text-sm font-medium leading-5">
                <input
                  type="checkbox"
                  checked={includeSettings}
                  onChange={event => setIncludeSettings(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-sky-600 cursor-pointer"
                />
                <span>{translate(language, 'Включить настройки приложения', 'Include application settings')}</span>
              </label>
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold">{translate(language, 'Счета и суммы портфеля', 'Accounts and portfolio values')}</h3>
                  {accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedAccountIds(
                        selectedAccounts.length === accounts.length ? [] : accounts.map(account => account.id),
                      )}
                      className="text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
                    >
                      {selectedAccounts.length === accounts.length
                        ? translate(language, 'Снять выбор', 'Deselect all')
                        : translate(language, 'Выбрать все', 'Select all')}
                    </button>
                  )}
                </div>
                {accounts.length === 0 ? (
                  <p className={`text-sm leading-5 ${UI_CLASSES.textSecondary}`}>{translate(language, 'Пока нет счетов для сохранения.', 'There are no accounts to save yet.')}</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                    {accounts.map(account => (
                      <label
                        key={account.id}
                        className={`flex items-center justify-between gap-3 border-l-2 p-3 cursor-pointer text-sm transition-colors ${
                          selectedAccountIds.includes(account.id)
                            ? 'border-l-sky-600 bg-sky-50 dark:border-l-sky-400 dark:bg-sky-900/30'
                            : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0 font-medium">
                          <input
                            type="checkbox"
                            checked={selectedAccountIds.includes(account.id)}
                            onChange={() => toggleAccount(account.id)}
                            className="h-5 w-5 shrink-0 accent-sky-600 cursor-pointer"
                          />
                          <span className="truncate">{account.name}</span>
                        </span>
                        <span className={`whitespace-nowrap font-normal ${UI_CLASSES.textSecondary}`}>
                          {account.data.totalValue.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')} {account.data.currency}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={handleExport} disabled={!hasBackupContent} className={`${UI_CLASSES.actionButton} rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 disabled:opacity-50`}>
                {translate(language, 'Скачать бекап', 'Download backup')}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className={`rounded-lg px-4 py-2 text-sm font-semibold border border-slate-300 dark:border-slate-600 ${UI_CLASSES.headerButtonHoverBg} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 disabled:opacity-50`}
              >
                {isProcessingFile ? translate(language, 'Загрузка…', 'Loading…') : translate(language, 'Загрузить бекап', 'Restore backup')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelected}
                className="hidden"
                aria-label={translate(language, 'Выбрать файл бекапа', 'Select backup file')}
              />
            </div>
            {message && (
              <p role={message.isError ? 'alert' : 'status'} className={`mt-4 text-sm ${message.isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {message.text}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default OtherSettingsPage;
