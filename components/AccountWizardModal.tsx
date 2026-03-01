// --- AccountWizardModal.tsx ---
// Мастер создания счетов - пошаговый инструмент для планирования портфеля
// на основе целевого процентного распределения активов

import React, { useState, useEffect, useRef } from 'react';
import { UI_CLASSES } from '../constants';

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

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

// --- Types ---
interface AssetField {
  id: number;
  name: string;
  percentage: string;
  amount: string;
}

interface AccountWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { accountName: string; fields: { name: string; amount: string }[] }) => void;
}

const AccountWizardModal: React.FC<AccountWizardModalProps> = ({ isOpen, onClose, onCreate }) => {
  // --- State ---
  const [step, setStep] = useState<1 | 2>(1);
  const [accountName, setAccountName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [assets, setAssets] = useState<AssetField[]>([{ id: Date.now(), name: '', percentage: '', amount: '' }]);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);

  // --- Calculations ---
  const totalAmountNum = parseFloat(totalAmount) || 0;
  const totalPercentage = assets.reduce((sum, asset) => {
    const percentage = parseFloat(asset.percentage) || 0;
    return sum + percentage;
  }, 0);

  const isStep1Valid = accountName.trim() !== '' && totalAmountNum > 0;
  const isStep2Valid = totalPercentage === 100 && assets.every(a => a.name.trim() !== '' && parseFloat(a.percentage) > 0);
  
  const percentageStatus = totalPercentage > 100 ? 'over' : totalPercentage === 100 ? 'complete' : 'under';

  // --- Handlers ---
  const handleAddAsset = () => setAssets([...assets, { id: Date.now(), name: '', percentage: '', amount: '' }]);
  
  const handleRemoveAsset = (id: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter(asset => asset.id !== id));
    }
  };
  
  const handleAssetChange = (id: number, field: 'name' | 'percentage' | 'amount', value: string) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    
    if (field === 'percentage') {
      // Сценарий А: Пользователь вводит процент → пересчитываем сумму
      const perc = parseFloat(value) || 0;
      const calculatedAmount = totalAmountNum > 0 ? Math.round((totalAmountNum * perc) / 100).toString() : '0';
      setAssets(assets.map(asset => 
        asset.id === id ? { ...asset, percentage: value, amount: calculatedAmount } : asset
      ));
    } else if (field === 'amount') {
      // Сценарий Б: Пользователь вводит сумму → пересчитываем процент
      const amt = parseFloat(value) || 0;
      const calculatedPercentage = totalAmountNum > 0 ? ((amt / totalAmountNum) * 100).toFixed(2) : '0';
      setAssets(assets.map(asset => 
        asset.id === id ? { ...asset, amount: value, percentage: calculatedPercentage } : asset
      ));
    } else {
      // Для поля name просто обновляем значение
      setAssets(assets.map(asset => asset.id === id ? { ...asset, [field]: value } : asset));
    }
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const calculateAmount = (percentage: string): string => {
    const perc = parseFloat(percentage) || 0;
    if (totalAmountNum === 0) return '0';
    return ((totalAmountNum * perc) / 100).toFixed(2);
  };

  const handleNext = () => {
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid) return;

    const fieldsToSubmit = assets.map(asset => ({
      name: asset.name,
      amount: calculateAmount(asset.percentage),
    }));

    onCreate({ accountName, fields: fieldsToSubmit });
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setAccountName('');
    setTotalAmount('');
    setAssets([{ id: Date.now(), name: '', percentage: '', amount: '' }]);
  };

  // --- Effects ---
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      aria-hidden={!isOpen}
    >
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true"></div>
      <div
        ref={modalRef}
        className={`relative w-full max-w-2xl ${UI_CLASSES.cardBg} rounded-xl shadow-2xl p-6 transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        {/* Header */}
        <header className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-sky-500" />
            <h2 id="wizard-title" className={`text-xl font-semibold ${UI_CLASSES.textPrimary}`}>
              Мастер создания счетов
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть мастер"
            className={`p-1 rounded-full ${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} transition-colors`}
          >
            <CloseIcon />
          </button>
        </header>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step === 1 ? 'text-sky-500' : UI_CLASSES.textSecondary}`}>
              Шаг 1: Общая сумма
            </span>
            <span className={`text-sm font-medium ${step === 2 ? 'text-sky-500' : UI_CLASSES.textSecondary}`}>
              Шаг 2: Распределение активов
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Account Name and Total Amount */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label htmlFor="accountName" className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300">
                  Название счета
                </label>
                <input
                  ref={firstInputRef}
                  id="accountName"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Например, Инвестиционный портфель"
                  className={`w-full px-3 py-2 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                  required
                />
              </div>

              <div>
                <label htmlFor="totalAmount" className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300">
                  Общая сумма вашего портфеля (₽)
                </label>
                <input
                  id="totalAmount"
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="150000"
                  className={`w-full px-3 py-2 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                  required
                  min="0"
                  step="any"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Эта сумма будет принята за 100%
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Asset Distribution */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Total Summary */}
              <div className={`p-3 rounded-lg ${UI_CLASSES.cardBg} border ${percentageStatus === 'over' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : percentageStatus === 'complete' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 dark:border-slate-600'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Общая сумма:</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {totalAmountNum.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Распределено:</span>
                  <span className={`text-lg font-bold ${percentageStatus === 'over' ? 'text-red-600 dark:text-red-400' : percentageStatus === 'complete' ? 'text-green-600 dark:text-green-400' : 'text-sky-600 dark:text-sky-400'}`}>
                    {totalPercentage.toFixed(1)} из 100%
                  </span>
                </div>
                {percentageStatus === 'over' && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠️ Превышение! Сумма процентов не должна быть больше 100%
                  </p>
                )}
                {percentageStatus === 'under' && totalPercentage > 0 && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    💡 Осталось распределить: {(100 - totalPercentage).toFixed(1)}%
                  </p>
                )}
              </div>

              {/* Asset Fields */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 -mr-2">
                {assets.map((asset, index) => {
                  const amountNum = parseFloat(asset.amount) || 0;
                  const isAmountOverBudget = amountNum > totalAmountNum;
                  return (
                    <div key={asset.id} className="flex flex-col sm:flex-row sm:items-end gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex-grow space-y-2">
                        <div>
                          <label htmlFor={`asset-name-${asset.id}`} className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300">
                            Актив {index + 1}
                          </label>
                          <input
                            id={`asset-name-${asset.id}`}
                            type="text"
                            value={asset.name}
                            onChange={(e) => handleAssetChange(asset.id, 'name', e.target.value)}
                            placeholder="Фонд на акции США"
                            className={`w-full px-2.5 py-1.5 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label htmlFor={`asset-percentage-${asset.id}`} className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300">
                              Доля (%)
                            </label>
                            <input
                              id={`asset-percentage-${asset.id}`}
                              type="number"
                              value={asset.percentage}
                              onChange={(e) => handleAssetChange(asset.id, 'percentage', e.target.value)}
                              placeholder="40"
                              className={`w-full px-2.5 py-1.5 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                              required
                              min="0"
                              max="100"
                              step="any"
                            />
                          </div>
                          <div className="flex-1">
                            <label htmlFor={`asset-amount-${asset.id}`} className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-300">
                              Сумма (₽)
                            </label>
                            <input
                              id={`asset-amount-${asset.id}`}
                              type="number"
                              value={asset.amount}
                              onChange={(e) => handleAssetChange(asset.id, 'amount', e.target.value)}
                              placeholder="30000"
                              className={`w-full px-2.5 py-1.5 text-sm ${UI_CLASSES.cardBg} text-slate-900 dark:text-white border ${isAmountOverBudget ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-slate-500'} rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors hover:border-slate-400 dark:hover:border-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                              required
                              min="0"
                              step="any"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        aria-label="Удалить актив"
                        className={`p-2 h-[38px] text-red-500 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors ${assets.length > 1 ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
                        disabled={assets.length <= 1}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Asset Button */}
              <button
                type="button"
                onClick={handleAddAsset}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-sky-500 dark:hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800`}
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Добавить актив
              </button>
            </div>
          )}

          {/* Footer Buttons */}
          <footer className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 text-sm font-semibold ${UI_CLASSES.textPrimary} bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors`}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className={`px-6 py-2 text-sm font-semibold text-white ${UI_CLASSES.actionButton} rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                  Далее →
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className={`px-4 py-2 text-sm font-semibold ${UI_CLASSES.textPrimary} bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors`}
                >
                  ← Назад
                </button>
                <button
                  type="submit"
                  disabled={!isStep2Valid}
                  className={`px-6 py-2 text-sm font-semibold text-white ${UI_CLASSES.actionButton} rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                  Создать счет
                </button>
              </>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AccountWizardModal;
