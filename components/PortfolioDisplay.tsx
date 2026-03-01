// --- PortfolioDisplay.tsx ---
// This component acts as the main container for the portfolio visualization.
// It arranges the title, donut chart, asset breakdown, and rebalancing suggestions.

import React from 'react';
import DonutChartComponent from './DonutChart';
import AssetBreakdownList from './AssetBreakdownList';
import RebalanceSuggestionsList from './RebalanceSuggestionsList';
import { AccountData, RebalanceSuggestion } from '../types';
import { UI_CLASSES } from '../constants';

/**
 * Props for the PortfolioDisplay component.
 */
interface PortfolioDisplayProps {
  data: AccountData; // The portfolio data to display (either single account or aggregated)
  isRebalanceModeActive: boolean; // Flag to show/hide rebalance suggestions
  rebalanceSuggestions: RebalanceSuggestion[]; // The list of suggestions to display
}

/**
 * A component that displays the core portfolio structure.
 */
const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ data, isRebalanceModeActive, rebalanceSuggestions }) => {
  return (
    // Main card container with responsive width and styling
    <div className={`w-full max-w-md md:max-w-xl ${UI_CLASSES.cardBg} p-4 sm:p-6 rounded-xl shadow-xl flex flex-col items-center my-4 transition-colors duration-300 ease-in-out`}>
      <h1 className={`text-2xl font-semibold ${UI_CLASSES.textPrimary} mb-4`}>Структура портфеля</h1>
      
      {/* Tag-like button, currently for visual purposes */}
      <button 
        className={`px-4 py-1.5 mb-6 text-sm ${UI_CLASSES.activeDisplayTag} rounded-full transform transition-all duration-200 ease-in-out hover:shadow-md hover:scale-105`}
        aria-label="Показать детали активов"
      >
        Активы
      </button>
      
      {/* Donut chart visualization */}
      <div className="w-full mb-8">
        <DonutChartComponent data={data} />
      </div>
      
      {/* List of individual assets with amounts and percentages */}
      <AssetBreakdownList assets={data.assets} totalValue={data.totalValue} currency={data.currency} />

      {/* Conditionally render rebalancing suggestions if the mode is active */}
      {isRebalanceModeActive && (
        <RebalanceSuggestionsList suggestions={rebalanceSuggestions} currency={data.currency} />
      )}
    </div>
  );
};

export default PortfolioDisplay;
