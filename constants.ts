// --- constants.ts ---
// This file defines constants used throughout the application, such as color palettes, UI styles, and initial data.

import { Account, AccountData, AssetColorKey } from './types';

/**
 * Defines the application's color palette.
 * Each color has a hex code for charts and a Tailwind CSS class for UI elements.
 */
export const THEME_PALETTE: { [key in AssetColorKey]: { hex: string; twClass: string; twTextClass: string } } = {
  sky: { hex: '#0ea5e9', twClass: 'bg-sky-500', twTextClass: 'text-sky-500' }, // Blue
  purple: { hex: '#9333ea', twClass: 'bg-purple-600', twTextClass: 'text-purple-600' }, // Purple
  green: { hex: '#22c55e', twClass: 'bg-green-500', twTextClass: 'text-green-500' }, // Green
  orange: { hex: '#f97316', twClass: 'bg-orange-500', twTextClass: 'text-orange-500' }, // Orange
  red: { hex: '#ef4444', twClass: 'bg-red-500', twTextClass: 'text-red-500' }, // Red
  yellow: { hex: '#eab308', twClass: 'bg-yellow-500', twTextClass: 'text-yellow-500' }, // Yellow
  pink: { hex: '#ec4899', twClass: 'bg-pink-500', twTextClass: 'text-pink-500' }, // Pink
};

/**
 * A centralized object for common Tailwind CSS classes.
 * This promotes consistency and makes it easier to update styles across the app.
 */
export const UI_CLASSES = {
  // General Text
  textPrimary: 'text-slate-800 dark:text-white',
  textSecondary: 'text-slate-600 dark:text-gray-400',

  // Backgrounds
  appBg: 'bg-slate-100 dark:bg-slate-900',
  headerBg: 'bg-white dark:bg-slate-900', // Header component adds its own shadow
  cardBg: 'bg-white dark:bg-slate-800', 
  
  progressTrack: 'bg-slate-200 dark:bg-slate-700',

  // Header specific interactive elements
  headerButtonIconColor: 'text-slate-600 dark:text-gray-300', 
  headerButtonHoverBg: 'hover:bg-slate-200 dark:hover:bg-slate-700',
  
  headerDropdownButton: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-slate-700',

  // "Активы" Tag in PortfolioDisplay
  activeDisplayTag: `${THEME_PALETTE.sky.twClass} text-white hover:opacity-90 dark:hover:opacity-80`,

  // Main Action Button (Rebalance) - Ensuring text is white and hover effects are consistent
  actionButton: `${THEME_PALETTE.sky.twClass} hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white`,
};

/**
 * Configuration for predefined portfolio asset types.
 * This could be used for presets or quick-add features in the future.
 */
export const PORTFOLIO_ASSET_CONFIG: { [key: string]: { name: string; colorKey: AssetColorKey } } = {
  funds: { name: 'Фонды', colorKey: 'sky' },
  bonds: { name: 'Облигации', colorKey: 'purple' },
  stocks: { name: 'Акции', colorKey: 'green' },
};

// The total value for the initial demo data.
const totalValue = 199133.66;

/**
 * The initial data for a single demo account.
 * This is used to populate the app when it first loads.
 */
export const INITIAL_ACCOUNT_DATA: AccountData = {
  totalValue: totalValue,
  currency: '₽',
  assetCount: 3,
  assets: [
    { 
      id: 'funds', 
      name: PORTFOLIO_ASSET_CONFIG.funds.name, 
      amount: totalValue * 0.9792,
      value: 97.92, 
      color: THEME_PALETTE[PORTFOLIO_ASSET_CONFIG.funds.colorKey].hex, 
      colorKey: PORTFOLIO_ASSET_CONFIG.funds.colorKey 
    },
    { 
      id: 'bonds', 
      name: PORTFOLIO_ASSET_CONFIG.bonds.name, 
      amount: totalValue * 0.0186,
      value: 1.86, 
      color: THEME_PALETTE[PORTFOLIO_ASSET_CONFIG.bonds.colorKey].hex, 
      colorKey: PORTFOLIO_ASSET_CONFIG.bonds.colorKey 
    },
    { 
      id: 'stocks', 
      name: PORTFOLIO_ASSET_CONFIG.stocks.name, 
      amount: totalValue * 0.0022,
      value: 0.22, 
      color: THEME_PALETTE[PORTFOLIO_ASSET_CONFIG.stocks.colorKey].hex, 
      colorKey: PORTFOLIO_ASSET_CONFIG.stocks.colorKey 
    }
  ],
};

/**
 * The list of accounts to display when the application first starts.
 * Contains one demo account by default.
 */
export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'default-1',
    name: 'Мой портфель',
    data: INITIAL_ACCOUNT_DATA,
  }
];
