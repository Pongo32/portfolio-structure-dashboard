// --- PortfolioDisplay.tsx ---
// This component acts as the main container for the portfolio visualization.
// It arranges the title, donut chart, asset breakdown, and rebalancing suggestions.

import React from 'react';
import DonutChartComponent from './DonutChart';
import AssetBreakdownList from './AssetBreakdownList';
import RebalanceSuggestionsList from './RebalanceSuggestionsList';
import { AccountData, RebalanceSuggestion } from '../types';
import { UI_CLASSES } from '../constants';
import { Language, translate } from '../i18n';

/**
 * Props for the PortfolioDisplay component.
 */
interface PortfolioDisplayProps {
  data: AccountData; // The portfolio data to display (either single account or aggregated)
  isRebalanceModeActive: boolean; // Flag to show/hide rebalance suggestions
  rebalanceSuggestions: RebalanceSuggestion[]; // The list of suggestions to display
  language: Language;
  rebalancePreviewData: AccountData | null;
  isShowingRebalancePreview: boolean;
  onToggleRebalancePreview: () => void;
}

/**
 * A component that displays the core portfolio structure.
 */
const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({
  data,
  isRebalanceModeActive,
  rebalanceSuggestions,
  language,
  rebalancePreviewData,
  isShowingRebalancePreview,
  onToggleRebalancePreview,
}) => {
  const displayedData = isShowingRebalancePreview && rebalancePreviewData ? rebalancePreviewData : data;
  const canTogglePreview = Boolean(rebalancePreviewData);
  const previewButtonLabel = isShowingRebalancePreview
    ? translate(language, 'Активы · После', 'Assets · After')
    : translate(language, 'Активы · До', 'Assets · Before');

  return (
    // Main card container with responsive width and styling
    <div className={`w-full max-w-md md:max-w-xl ${UI_CLASSES.cardBg} p-4 sm:p-6 rounded-xl shadow-xl flex flex-col items-center my-4 transition-colors duration-300 ease-in-out`}>
      <h1 className={`w-full text-center text-xl sm:text-2xl leading-tight font-semibold ${UI_CLASSES.textPrimary} mb-4`}>
        {translate(language, 'Структура портфеля', 'Portfolio allocation')}
      </h1>
      
      <button
        type="button"
        onClick={onToggleRebalancePreview}
        disabled={!canTogglePreview}
        className={`min-w-32 px-4 py-1.5 mb-6 text-sm font-medium rounded-full transform-gpu transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
          canTogglePreview
            ? `${UI_CLASSES.activeDisplayTag} shadow-sm hover:shadow-md hover:scale-[1.03] active:shadow-sm`
            : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-default'
        }`}
        aria-label={canTogglePreview
          ? translate(
              language,
              isShowingRebalancePreview ? 'Показать активы до ребалансировки' : 'Показать прогноз после ребалансировки',
              isShowingRebalancePreview ? 'Show assets before rebalancing' : 'Show preview after rebalancing',
            )
          : translate(language, 'Активы', 'Assets')}
        aria-pressed={canTogglePreview ? isShowingRebalancePreview : undefined}
        title={!canTogglePreview && isRebalanceModeActive
          ? translate(language, 'Настройте целевые доли на 100%, чтобы увидеть прогноз', 'Set target allocations to 100% to see a preview')
          : undefined}
      >
        <span key={canTogglePreview ? String(isShowingRebalancePreview) : 'assets'} className="preview-label-enter inline-block">
          {canTogglePreview
            ? previewButtonLabel
            : translate(language, 'Активы', 'Assets')}
        </span>
      </button>

      {isShowingRebalancePreview && rebalancePreviewData && (
        <p className={`-mt-4 mb-4 text-sm text-center ${UI_CLASSES.textSecondary}`} role="status">
          {translate(language, 'Предпросмотр после ребалансировки — суммы счета не изменены', 'Preview after rebalancing — account values are unchanged')}
        </p>
      )}
      
      {/* Donut chart visualization */}
      <div className="w-full mb-8">
        <DonutChartComponent data={displayedData} language={language} />
      </div>
      
      {/* List of individual assets with amounts and percentages */}
      <AssetBreakdownList assets={displayedData.assets} totalValue={displayedData.totalValue} currency={displayedData.currency} language={language} />

      {/* Conditionally render rebalancing suggestions if the mode is active */}
      {isRebalanceModeActive && (
        <RebalanceSuggestionsList suggestions={rebalanceSuggestions} currency={data.currency} language={language} />
      )}
    </div>
  );
};

export default PortfolioDisplay;
