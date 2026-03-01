// --- CreateAccountModal.tsx ---
// This component provides a modal form for both creating a new account and editing an existing one.
// It features dynamically adding and removing asset fields.

import React, { useState, useEffect, useRef } from 'react';
import { UI_CLASSES } from '../constants';
import { Account } from '../types';

// --- Icons ---
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.324.214m9.236-1.112A48.061 48.061 0 0012 4.5c-2.291 0-4.502.202-6.707.572m6.707-.572c-2.205 0-4.32.188-6.387.525" />
  </svg>
);

// --- Component ---
// Defines the structure for a single dynamic field in the form.
interface Field {
  id: number; // Unique ID for React's key prop
  name: string;
  amount: string;
}

/**
 * Props for the CreateAccountModal component.
 */
interface CreateAccountModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  onCreate: (data: { accountName: string; fields: { name: string; amount: string }[] }) => void; // Callback for creating an account
  onUpdate: (data: { accountId: string; accountName: string; fields: { name: string; amount: string }[] }) => void; // Callback for updating an account
  accountToEdit?: Account | null; // The account data to pre-fill the form for editing
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, onCreate, onUpdate, accountToEdit }) => {
  // --- State ---
  const [accountName, setAccountName] = useState('');
  const [fields, setFields] = useState<Field[]>([{ id: Date.now(), name: '', amount: '' }]);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null); // Ref to focus the first input when the modal opens
  const prevFieldsLength = useRef(1); // To track when a new field is added

  // --- Derived State ---
  const isEditMode = !!accountToEdit; // Determines if the modal is in "edit" or "create" mode
  const isFormValid = accountName.trim() !== '' && fields.every(f => f.name.trim() !== '' && f.amount.trim() !== '' && !isNaN(parseFloat(f.amount)) && parseFloat(f.amount) >= 0);

  // --- Handlers ---
  const handleAddField = () => setFields([...fields, { id: Date.now(), name: '', amount: '' }]);
  const handleRemoveField = (id: number) => setFields(fields.filter(field => field.id !== id));
  const handleFieldChange = (id: number, key: 'name' | 'amount', value: string) => {
    setFields(fields.map(field => field.id === id ? { ...field, [key]: value } : field));
  };
  
  const resetForm = () => {
    setAccountName('');
    setFields([{ id: Date.now(), name: '', amount: '' }]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const fieldsToSubmit = fields.map(({ name, amount }) => ({ name, amount }));

    if (isEditMode) {
      onUpdate({ accountId: accountToEdit.id, accountName, fields: fieldsToSubmit });
    } else {
      onCreate({ accountName, fields: fieldsToSubmit });
    }
  };
  
  // --- Effects ---
  // Pre-fills the form when opening in edit mode, or resets it for create mode.
  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) { // Edit mode
        setAccountName(accountToEdit.name);
        setFields(accountToEdit.data.assets.map((asset, index) => ({
          id: Date.now() + index,
          name: asset.name,
          amount: asset.amount.toString(),
        })));
        prevFieldsLength.current = accountToEdit.data.assets.length;
      } else { // Create mode
        resetForm();
        prevFieldsLength.current = 1;
      }
      // Focus the first input for better accessibility
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, accountToEdit]);

  // Focuses the name input of a newly added field.
  useEffect(() => {
    if (!isOpen) return;
    if (fields.length > prevFieldsLength.current) {
        const lastField = fields[fields.length - 1];
        const inputToFocus = document.getElementById(`field-name-${lastField.id}`);
        inputToFocus?.focus();
    }
    prevFieldsLength.current = fields.length;
  }, [fields, isOpen]);

  // Adds an event listener to close the modal on 'Escape' key press.
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null; // Don't render anything if the modal is closed

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out`}
      aria-hidden={!isOpen}
    >
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true"></div>
      <div
        ref={modalRef}
        className={`relative w-full max-w-lg ${UI_CLASSES.cardBg} rounded-xl shadow-2xl p-6 transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-account-title"
      >
        <header className="flex items-start justify-between mb-4">
          <h2 id="create-account-title" className={`text-xl font-semibold ${UI_CLASSES.textPrimary}`}>{isEditMode ? 'Редактировать счет' : 'Создать новый счет'}</h2>
          <button onClick={onClose} aria-label="Закрыть модальное окно" className={`p-1 rounded-full ${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} transition-colors`}>
            <CloseIcon />
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountName" className={`block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300`}>Название счета</label>
            <input
              ref={firstInputRef}
              id="accountName"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Например, мой брокерский счет"
              className={`w-full px-2.5 py-1.5 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
              required
            />
          </div>

          {/* Container for dynamic asset fields */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 -mr-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-end sm:space-x-2 space-y-2 sm:space-y-0">
                {/* Asset Name Field */}
                <div className="flex-grow">
                  <label htmlFor={`field-name-${field.id}`} className={`block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300`}>Название {index + 1}</label>
                  <input
                    id={`field-name-${field.id}`}
                    type="text"
                    value={field.name}
                    onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                    placeholder="Акция, облигация..."
                    className={`w-full px-2.5 py-1.5 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                    required
                  />
                </div>
                {/* Asset Amount Field */}
                <div className="w-full sm:w-1/3">
                   <label htmlFor={`field-amount-${field.id}`} className={`block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300`}>Сумма</label>
                  <input
                    id={`field-amount-${field.id}`}
                    type="number"
                    value={field.amount}
                    onChange={(e) => handleFieldChange(field.id, 'amount', e.target.value)}
                    placeholder="1000"
                    className={`w-full px-2.5 py-1.5 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                    required
                    min="0"
                    step="any"
                  />
                </div>
                {/* Remove Field Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveField(field.id)}
                  aria-label="Удалить поле"
                  className={`p-2 h-[38px] text-red-500 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors ${fields.length > 1 ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={fields.length <= 1}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Field Button */}
          <button
            type="button"
            onClick={handleAddField}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-sky-500 dark:hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800`}
          >
            <PlusIcon className="w-5 h-5 mr-1" />
            Добавить поле
          </button>
          
          {/* Modal Footer with Actions */}
          <footer className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className={`px-4 py-2 text-sm font-semibold ${UI_CLASSES.textPrimary} bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors`}>
              Отмена
            </button>
            <button type="submit" disabled={!isFormValid} className={`px-6 py-2 text-sm font-semibold text-white ${UI_CLASSES.actionButton} rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}>
              {isEditMode ? 'Сохранить изменения' : 'Создать'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
