// --- RebalanceSettings.tsx ---
// This component provides a dedicated page for users to define their target
// asset allocations for rebalancing purposes.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UI_CLASSES } from '../constants';
import { Asset } from '../types';

// --- Icon ---
const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

/**
 * Props for the RebalanceSettings component.
 */
interface RebalanceSettingsProps {
  allAssets: Asset[]; // A list of all unique assets across all accounts
  currentTargets: { [key: string]: number }; // The currently saved target percentages
  onSave: (targets: { [key: string]: number }) => void; // Callback to save the new targets
  onBack: () => void; // Callback to navigate back to the portfolio view
}

const RebalanceSettings: React.FC<RebalanceSettingsProps> = ({ allAssets, currentTargets, onSave, onBack }) => {
    // Memoize the list of unique assets to avoid re-computation.
    const uniqueAssets = useMemo(() => {
        const seen = new Set<string>();
        return allAssets.filter(asset => {
            const duplicate = seen.has(asset.name);
            seen.add(asset.name);
            return !duplicate;
        });
    }, [allAssets]);

    // State to hold the input values as strings to allow for partial input (e.g., "5.").
    const [targets, setTargets] = useState<{ [key: string]: string }>({});

    // Effect to initialize the form with current target values when the component mounts.
    useEffect(() => {
        const initialTargets: { [key: string]: string } = {};
        uniqueAssets.forEach(asset => {
            initialTargets[asset.name] = (currentTargets[asset.name] || 0).toString();
        });
        setTargets(initialTargets);
    }, [uniqueAssets, currentTargets]);

    // A callback to handle input changes with validation.
    const handleInputChange = useCallback((assetName: string, value: string) => {
        // Regex to allow numbers between 0-100, including decimals.
        if (/^(\d{1,2}(\.\d*)?|100(\.0*)?)$/.test(value) || value === '') {
             setTargets(prev => ({ ...prev, [assetName]: value }));
        }
    }, []);

    // Memoized calculation for the sum of all current target inputs.
    const total = useMemo(() => {
        return Object.values(targets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    }, [targets]);
    
    // Disable the save button if the total is not exactly 100.
    const isSaveDisabled = Math.abs(total - 100) > 0.001;

    // Handler for the save button.
    const handleSave = () => {
        if (isSaveDisabled) return;
        const finalTargets: { [key: string]: number } = {};
        // Convert string inputs to numbers before saving.
        Object.entries(targets).forEach(([name, value]) => {
            finalTargets[name] = parseFloat(value) || 0;
        });
        onSave(finalTargets);
    };

    return (
        <div className={`min-h-screen ${UI_CLASSES.appBg} ${UI_CLASSES.textPrimary} flex flex-col font-sans transition-colors duration-300 ease-in-out`}>
            {/* Header for the settings page */}
            <header className={`p-4 flex justify-between items-center ${UI_CLASSES.headerBg} shadow-md sticky top-0 z-30`}>
                <button onClick={onBack} aria-label="Вернуться назад" className={`${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} p-2 rounded-md`}>
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-lg font-semibold">Настройки ребалансировки</h1>
                <div className="w-11" aria-hidden="true"></div> {/* Spacer to center the title */}
            </header>

            {/* Main content area */}
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
                <div className={`w-full max-w-md md:max-w-2xl ${UI_CLASSES.cardBg} p-4 sm:p-6 rounded-xl shadow-xl`}>
                    <p className={`${UI_CLASSES.textSecondary} mb-6 text-sm`}>
                        Укажите целевые доли для каждого актива. Общая сумма должна быть равна 100%.
                    </p>
                    <div className="space-y-4">
                        {/* Map over unique assets to create an input field for each */}
                        {uniqueAssets.sort((a,b) => a.name.localeCompare(b.name)).map(asset => (
                            <div key={asset.id} className="flex items-center justify-between">
                                <label htmlFor={`target-${asset.id}`} className="font-medium">{asset.name}</label>
                                <div className="relative w-28">
                                    <input
                                        id={`target-${asset.id}`}
                                        type="text"
                                        inputMode="decimal" // Hint for mobile keyboards
                                        value={targets[asset.name] || ''}
                                        onChange={(e) => handleInputChange(asset.name, e.target.value)}
                                        placeholder="0"
                                        className={`w-full pr-7 text-right ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors py-1 px-2`}
                                    />
                                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 ${UI_CLASSES.textSecondary}`}>%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total percentage display */}
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center font-semibold">
                        <span className={`${UI_CLASSES.textSecondary} mr-4`}>Итого:</span>
                        <span className={isSaveDisabled ? 'text-red-500' : 'text-green-500'}>
                            {total.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}%
                        </span>
                    </div>
                </div>
            </main>
            
            {/* Sticky footer with the Save button */}
            <footer className={`w-full p-4 ${UI_CLASSES.appBg} mt-auto sticky bottom-0 z-20`}>
                <button
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    className={`w-full max-w-md md:max-w-2xl mx-auto block ${UI_CLASSES.actionButton} font-semibold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0`}
                >
                    Сохранить
                </button>
            </footer>
        </div>
    );
};

export default RebalanceSettings;
