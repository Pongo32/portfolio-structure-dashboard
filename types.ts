// --- types.ts ---
// This file contains all the core TypeScript type definitions used throughout the application.

/**
 * Defines the keys for the color palette used for assets.
 * This ensures type safety when assigning colors.
 */
export type AssetColorKey = 'sky' | 'purple' | 'green' | 'orange' | 'red' | 'yellow' | 'pink';

/**
 * Represents a single asset within a portfolio account.
 */
export interface Asset {
  id: string; // A unique identifier for the asset instance
  name: string; // The display name of the asset (e.g., "Акции")
  amount: number; // The actual monetary value of the asset
  value: number; // The percentage of this asset relative to the total portfolio value
  color: string; // The hex color code used for charts
  colorKey: AssetColorKey; // The key to look up Tailwind CSS color classes
}

/**
 * Represents the data for a single investment account, or the aggregated data for all accounts.
 */
export interface AccountData {
  totalValue: number; // The total monetary value of all assets in the account
  currency: string; // The currency symbol (e.g., "₽")
  assetCount: number; // The number of unique assets
  assets: Asset[]; // An array of the assets within the account
}

/**
 * Represents a user-created investment account.
 */
export interface Account {
  id: string; // A unique identifier for the account
  name: string; // The user-defined name for the account (e.g., "Мой портфель")
  data: AccountData; // The financial data associated with this account
}

/**
 * Represents a single rebalancing suggestion.
 */
export interface RebalanceSuggestion {
  name: string; // The name of the asset to rebalance
  action: 'Increase' | 'Decrease'; // The action to take (buy or sell)
  amount: number; // The monetary amount to buy or sell
}
