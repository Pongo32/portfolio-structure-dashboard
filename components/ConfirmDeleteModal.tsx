// --- ConfirmDeleteModal.tsx ---
// This component displays a simple confirmation dialog to prevent accidental deletion of an account.

import React from 'react';
import { UI_CLASSES } from '../constants';

/**
 * Props for the ConfirmDeleteModal component.
 */
interface ConfirmDeleteModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to call when closing the modal (e.g., clicking "Cancel")
  onConfirm: () => void; // Function to call when confirming the deletion
  accountName: string; // The name of the account to be deleted, for display in the message
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, accountName }) => {
  // To avoid rendering the modal in the DOM when it's not visible, we return null.
  if (!isOpen) return null;

  return (
    // The main modal container with an overlay.
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      // Accessibility attributes for a dialog
      aria-hidden={!isOpen}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      {/* Semi-transparent background overlay */}
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true"></div>
      
      {/* The modal panel itself */}
      <div
        className={`relative w-full max-w-sm ${UI_CLASSES.cardBg} rounded-xl shadow-2xl p-6 transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <h2 id="confirm-delete-title" className={`text-lg font-semibold ${UI_CLASSES.textPrimary} mb-2`}>
          Подтвердите удаление
        </h2>
        <p className={`${UI_CLASSES.textSecondary} mb-6 text-sm`}>
          Вы уверены, что хотите удалить счет "{accountName}"? Это действие необратимо.
        </p>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-semibold ${UI_CLASSES.textPrimary} bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors`}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
