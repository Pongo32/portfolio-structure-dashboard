// --- ActionButton.tsx ---
// This component renders a prominent, sticky action button at the bottom of the screen.
// It's used for primary actions like toggling the rebalancing mode.

import React from 'react';
import { UI_CLASSES } from '../constants';

/**
 * Props for the ActionButton component.
 */
interface ActionButtonProps {
  text: string; // The text displayed on the button.
  onClick: () => void; // The function to call when the button is clicked.
  isActive: boolean; // A flag to indicate if the button's mode is active, used for styling.
}

const ActionButton: React.FC<ActionButtonProps> = ({ text, onClick, isActive }) => {
  // Conditionally apply active styling (e.g., a ring outline) if the button's mode is active.
  const activeClasses = isActive 
    ? `ring-2 ring-offset-2 ring-sky-400 dark:ring-offset-slate-900 ${UI_CLASSES.actionButton}`
    : UI_CLASSES.actionButton;
    
  return (
    // A footer element that sticks to the bottom of the viewport.
    <footer className={`w-full p-4 ${UI_CLASSES.appBg} mt-auto sticky bottom-0 z-20 transition-colors duration-300 ease-in-out`}>
      <button
        onClick={onClick}
        // Combine base styles with conditional active styles.
        className={`w-full max-w-md mx-auto block font-semibold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ${activeClasses}`}
        aria-label={text} // For accessibility.
        aria-pressed={isActive} // Indicates the toggle state for screen readers.
      >
        {text}
      </button>
    </footer>
  );
};

export default ActionButton;
