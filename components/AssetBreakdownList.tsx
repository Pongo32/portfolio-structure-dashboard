// --- AssetBreakdownList.tsx ---
// This file contains components to display a detailed list of assets,
// each with its name, percentage, and a visual progress bar.

import React from 'react';
import { Asset } from '../types';
import { THEME_PALETTE, UI_CLASSES } from '../constants';

/**
 * Props for the AssetBreakdownList component.
 */
interface AssetBreakdownListProps {
  assets: Asset[];
  totalValue: number; // Total portfolio value for calculating absolute amounts
  currency: string; // Currency symbol (e.g., '₽')
}

/**
 * Formats a number with thousand separators using the Russian locale.
 * @param value The number to format
 * @param decimals Number of decimal places (default: 0)
 */
const formatCurrency = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('ru-RU', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

/**
 * A single item in the asset breakdown list.
 * It displays the asset's name, amount, percentage, and a colored progress bar.
 * @param asset The asset data to display.
 * @param totalValue Total portfolio value for calculating absolute amounts
 * @param currency Currency symbol
 */
const AssetBreakdownItem: React.FC<{ asset: Asset; totalValue: number; currency: string }> = ({ asset, totalValue, currency }) => {
  // Get the Tailwind CSS background color class from the palette using the asset's colorKey.
  const progressBarColorClass = THEME_PALETTE[asset.colorKey].twClass;
  
  // Calculate absolute amount
  const absoluteAmount = (totalValue * asset.value) / 100;
  
  return (
    // The list item container, with hover effects for better UX.
    <div className="p-2 -mx-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors duration-150 ease-in-out mb-1 last:mb-0 group" role="listitem">
      <div className="flex justify-between items-start sm:items-center mb-1 gap-2">
        <div className="flex items-center min-w-0 flex-shrink">
          {/* Color swatch */}
          <span 
            className={`w-3 h-3 rounded-sm mr-2 flex-shrink-0`} 
            style={{ backgroundColor: asset.color /* Use hex color directly for the swatch */ }}
            aria-hidden="true"
          ></span>
          {/* Asset name */}
          <span className={`${UI_CLASSES.textPrimary} text-sm truncate`}>{asset.name}</span>
        </div>
        {/* Asset amount and percentage - responsive layout */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center text-right flex-shrink-0">
          <span className={`${UI_CLASSES.textPrimary} text-sm font-medium whitespace-nowrap`}>
            {formatCurrency(absoluteAmount)} {currency}
          </span>
          <span className={`${UI_CLASSES.textSecondary} text-sm sm:ml-1 whitespace-nowrap`}>
            ({asset.value.toFixed(2)}%)
          </span>
        </div>
      </div>
      {/* Progress bar container */}
      <div className={`w-full h-2 ${UI_CLASSES.progressTrack} rounded-full overflow-hidden transition-colors duration-300 ease-in-out`} role="progressbar" aria-valuenow={asset.value} aria-valuemin={0} aria-valuemax={100} aria-label={`${asset.name} progress`}>
        {/* The actual progress bar, with its width set dynamically based on the asset's value. */}
        <div 
          className={`h-full rounded-full ${progressBarColorClass} transition-[width] duration-500 ease-in-out`} 
          style={{ width: `${asset.value}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * A component that renders a list of all assets in the portfolio.
 * It sorts the assets by their value in descending order before rendering.
 * @param assets An array of asset objects
 * @param totalValue Total portfolio value
 * @param currency Currency symbol
 */
const AssetBreakdownList: React.FC<AssetBreakdownListProps> = ({ assets, totalValue, currency }) => {
  return (
    <div className="w-full" role="list">
      {/* Sort assets to show the largest holdings first */}
      {assets.sort((a, b) => b.value - a.value).map(asset => (
        <AssetBreakdownItem key={asset.id} asset={asset} totalValue={totalValue} currency={currency} />
      ))}
    </div>
  );
};

export default AssetBreakdownList;
