// --- RebalanceSuggestionsList.tsx ---
// This component displays a list of recommended actions (Increase/Decrease)
// to bring the portfolio back to its target allocation.

import React from 'react';
import { RebalanceSuggestion } from '../types';
import { UI_CLASSES } from '../constants';

// --- Icons ---
// Icon to indicate an asset's allocation should be increased.
const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625l-6.25 3.75" />
    </svg>
);
// Icon to indicate an asset's allocation should be decreased.
const TrendingDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-3.75.625m3.75-.625l-6.25-3.75" />
    </svg>
);

/**
 * Props for the RebalanceSuggestionsList component.
 */
interface RebalanceSuggestionsListProps {
    suggestions: RebalanceSuggestion[];
    currency: string;
}

const RebalanceSuggestionsList: React.FC<RebalanceSuggestionsListProps> = ({ suggestions, currency }) => {
    // If there are no suggestions, display a message indicating the portfolio is balanced.
    if (suggestions.length === 0) {
        return (
            <div className="w-full mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                <p className={`${UI_CLASSES.textSecondary} text-sm`}>Портфель сбалансирован. Нет рекомендаций.</p>
            </div>
        );
    }

    // Otherwise, display the list of suggestions.
    return (
        <div className="w-full mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className={`text-md font-semibold mb-4 text-center ${UI_CLASSES.textSecondary}`}>Рекомендации по ребалансировке</h3>
            <div className="space-y-2">
                {suggestions.map((s) => {
                    // Determine styling based on whether the action is 'Increase' or 'Decrease'.
                    const isIncrease = s.action === 'Increase';
                    const bgColor = isIncrease ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40';
                    const textColor = isIncrease ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-400';
                    const iconColor = isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                    return (
                        // A single suggestion item with responsive layout.
                        <div key={s.name} className={`flex flex-col items-start sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg ${bgColor} transition-colors space-y-1 sm:space-y-0`}>
                            {/* Left side: Icon and Asset Name */}
                            <div className="flex items-center space-x-3">
                                {isIncrease ? <TrendingUpIcon className={`w-5 h-5 ${iconColor}`} /> : <TrendingDownIcon className={`w-5 h-5 ${iconColor}`} />}
                                <span className={`${UI_CLASSES.textPrimary} font-medium text-sm`}>{s.name}</span>
                            </div>
                            {/* Right side: Action and Amount */}
                            <div className={`font-semibold text-sm ${textColor} w-full sm:w-auto text-left sm:text-right`}>
                                <span>{isIncrease ? 'Увеличить на' : 'Уменьшить на'} </span>
                                <span>{s.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RebalanceSuggestionsList;
