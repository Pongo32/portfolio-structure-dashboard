import React, { useEffect, useMemo, useState } from 'react';
import { UI_CLASSES } from '../constants';
import { AssetAliasGroup } from '../types';
import { Language, translate } from '../i18n';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || 'w-6 h-6'}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

interface SettingsPageProps {
  onBack: () => void;
  language: Language;
  normalizationEnabled: boolean;
  onNormalizationEnabledChange: (enabled: boolean) => void;
  aliasGroups: AssetAliasGroup[];
  onSaveAliasGroups: (groups: AssetAliasGroup[]) => boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  language,
  normalizationEnabled,
  onNormalizationEnabledChange,
  aliasGroups,
  onSaveAliasGroups,
}) => {
  const [draftGroups, setDraftGroups] = useState<AssetAliasGroup[]>(aliasGroups);
  const [isSaved, setIsSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setDraftGroups(aliasGroups);
  }, [aliasGroups]);

  const hasDuplicateNames = useMemo(() => {
    const namesInOtherGroups = new Set<string>();

    return draftGroups.some(group => {
      const canonical = group.canonicalName.trim().toLocaleLowerCase('ru-RU');
      if (!canonical) return false;

      const aliasesInGroup = new Set<string>();
      for (const alias of group.aliases) {
        const normalizedAlias = alias.trim().toLocaleLowerCase('ru-RU');
        if (!normalizedAlias || normalizedAlias === canonical) continue;
        if (aliasesInGroup.has(normalizedAlias) || namesInOtherGroups.has(normalizedAlias)) return true;
        aliasesInGroup.add(normalizedAlias);
      }

      if (namesInOtherGroups.has(canonical) || aliasesInGroup.has(canonical)) return true;
      namesInOtherGroups.add(canonical);
      aliasesInGroup.forEach(alias => namesInOtherGroups.add(alias));
      return false;
    });
  }, [draftGroups]);

  const hasIncompleteGroup = draftGroups.some(group => !group.canonicalName.trim());

  const updateGroup = (index: number, updated: AssetAliasGroup) => {
    setDraftGroups(groups => groups.map((group, groupIndex) => groupIndex === index ? updated : group));
    setIsSaved(false);
    setSaveFailed(false);
  };

  const handleSave = () => {
    if (hasDuplicateNames || hasIncompleteGroup) return;
    const saved = onSaveAliasGroups(draftGroups.map(group => ({
      canonicalName: group.canonicalName.trim(),
      aliases: group.aliases
        .map(alias => alias.trim())
        .filter(alias => alias && alias.toLocaleLowerCase('ru-RU') !== group.canonicalName.trim().toLocaleLowerCase('ru-RU')),
    })));
    setIsSaved(saved);
    setSaveFailed(!saved);
  };

  return (
    <div className={`min-h-screen ${UI_CLASSES.appBg} ${UI_CLASSES.textPrimary} flex flex-col font-sans transition-colors duration-300 ease-in-out`}>
      <header className={`p-4 flex justify-between items-center ${UI_CLASSES.headerBg} shadow-md sticky top-0 z-30`}>
        <button onClick={onBack} aria-label={translate(language, 'Вернуться назад', 'Go back')} className={`${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} p-2 rounded-md`}>
          <ArrowLeftIcon />
        </button>
        <h1 className="text-base sm:text-lg font-semibold">{translate(language, 'Группы названий и синонимы', 'Name groups and aliases')}</h1>
        <div className="w-11" aria-hidden="true" />
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <section className={`w-full max-w-md md:max-w-2xl ${UI_CLASSES.cardBg} p-4 sm:p-6 rounded-xl shadow-xl`}>
          <h2 className="text-lg font-semibold mb-3">{translate(language, 'Названия активов', 'Asset names')}</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={normalizationEnabled}
              onChange={event => onNormalizationEnabledChange(event.target.checked)}
              className="mt-1 h-4 w-4 accent-sky-500"
            />
            <span>
              <span className="block font-medium">{translate(language, 'Объединять названия без учета регистра и синонимов', 'Merge names regardless of case and aliases')}</span>
              <span className={`block text-sm mt-1 ${UI_CLASSES.textSecondary}`}>
                {translate(language, 'Например, «ФОНДЫ» и «фонды» будут показаны как «Фонды». Добавьте синонимы для разных слов, например «Акций» → «Акции».', 'For example, “FUNDS” and “funds” are shown as “Funds”. Add aliases for different words, such as “Share” → “Shares”.')}
              </span>
            </span>
          </label>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold">{translate(language, 'Группы названий и синонимов', 'Name and alias groups')}</h3>
              <button
                type="button"
                onClick={() => {
                  setDraftGroups(groups => [...groups, { canonicalName: '', aliases: [] }]);
                  setIsSaved(false);
                  setSaveFailed(false);
                }}
                className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
              >
                {translate(language, 'Добавить группу', 'Add group')}
              </button>
            </div>
            <p className={`text-sm mb-4 ${UI_CLASSES.textSecondary}`}>
              {translate(language, 'Укажите, как актив должен называться в портфеле, и варианты написания через запятую. Изменения применяются при включенном переключателе.', 'Set the display name for an asset and enter alternate names separated by commas. Changes apply when the toggle is enabled.')}
            </p>

            <div className="space-y-4">
              {draftGroups.map((group, index) => (
                <div key={index} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3">
                  <div>
                    <label htmlFor={`canonical-name-${index}`} className={`block text-sm mb-1 ${UI_CLASSES.textSecondary}`}>{translate(language, 'Показывать как', 'Display as')}</label>
                    <input
                      id={`canonical-name-${index}`}
                      value={group.canonicalName}
                      onChange={event => updateGroup(index, { ...group, canonicalName: event.target.value })}
                      placeholder={translate(language, 'Например, Фонды', 'e.g. Funds')}
                      className={`w-full px-3 py-2 ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`aliases-${index}`} className={`block text-sm mb-1 ${UI_CLASSES.textSecondary}`}>{translate(language, 'Другие варианты написания', 'Other spellings')}</label>
                    <textarea
                      id={`aliases-${index}`}
                      rows={3}
                      value={group.aliases.join(', ')}
                      onChange={event => updateGroup(index, {
                        ...group,
                        aliases: event.target.value.split(',').map(alias => alias.trim()),
                      })}
                      placeholder={translate(language, 'Например, Акций, RUB', 'e.g. Shares, RUB')}
                      className={`w-full px-3 py-2 ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-sky-500`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftGroups(groups => groups.filter((_, groupIndex) => groupIndex !== index));
                      setIsSaved(false);
                      setSaveFailed(false);
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    {translate(language, 'Удалить группу', 'Remove group')}
                  </button>
                </div>
              ))}
            </div>
            {hasDuplicateNames && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {translate(language, 'Одно и то же название не может входить в несколько групп или повторяться в группе.', 'A name cannot appear in multiple groups or more than once in a group.')}
              </p>
            )}
            {hasIncompleteGroup && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {translate(language, 'Укажите название для показа в каждой группе.', 'Enter a display name for every group.')}
              </p>
            )}
            {saveFailed && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {translate(language, 'Не удалось сохранить группы. Проверьте доступность локального хранилища и повторите попытку.', 'Could not save groups. Check local storage and try again.')}
              </p>
            )}
            <div className="mt-5 flex items-center justify-end gap-3">
              {isSaved && <span role="status" className="text-sm text-green-600 dark:text-green-400">Сохранено</span>}
              <button
                type="button"
                onClick={handleSave}
                disabled={hasDuplicateNames || hasIncompleteGroup}
                className={`${UI_CLASSES.actionButton} rounded-lg px-4 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {translate(language, 'Сохранить группы', 'Save groups')}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
