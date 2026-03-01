// --- Header.tsx ---
// This component renders the main application header, which includes navigation,
// account selection, theme toggling, and access to settings.

import React, { useState, useEffect, useRef } from 'react';
import { UI_CLASSES } from '../constants';
import { Account } from '../types';

type Theme = 'light' | 'dark';

/**
 * Props for the Header component.
 * It receives state and handler functions from the parent App component.
 */
interface HeaderProps {
  currentTheme: Theme;
  toggleTheme: () => void;
  onOpenCreateAccountModal: () => void;
  onOpenAccountWizard: () => void;
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onDeleteAccount: (id: string) => void;
  onEditAccount: (id: string) => void;
  onNavigateToSettings: () => void;
}

// --- Reusable SVG Icon Components ---
// These are stateless functional components for rendering SVG icons.

const BurgerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-7 h-7"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
  </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-7 h-7"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-5 0a5 5 0 1010 0 5 5 0 10-10 0 M12 1V3 M12 21V23 M4.22 4.22L5.64 5.64 M18.36 18.36L19.78 19.78 M1 12H3 M21 12H23 M4.22 19.78L5.64 18.36 M18.36 5.64L19.78 4.22" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-7 h-7"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21c3.73 0 7.01-1.739 9.002-4.498z" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-4 h-4"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-7 h-7"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5 mr-3"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5 mr-3"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5 mr-3"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.324.214m9.236-1.112A48.061 48.061 0 0012 4.5c-2.291 0-4.502.202-6.707.572m6.707-.572c-2.205 0-4.32.188-6.387.525" />
  </svg>
);

const ListBulletIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5 mr-3"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "w-5 h-5 mr-3"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const Cog6ToothIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.424.35.534.954.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// --- Sidebar Component ---

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSettings: () => void;
}

/**
 * A slide-out sidebar menu for navigation and additional actions.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigateToSettings }) => {
  // Effect to handle 'Escape' key press and body scroll lock
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = ''; // Restore scrolling
      };
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full ${UI_CLASSES.cardBg} ${UI_CLASSES.textPrimary} w-4/5 max-w-sm md:w-1/2 md:max-w-md shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex flex-col h-full">
          <header className={`p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700`}>
            <h2 id="sidebar-title" className="text-lg font-semibold">Меню</h2>
            <button 
              aria-label="Закрыть меню" 
              onClick={onClose}
              className={`${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} p-2 rounded-md transition-colors`}
            >
              <CloseIcon />
            </button>
          </header>
          <nav className="flex-grow p-4 space-y-2">
            <button onClick={onNavigateToSettings} className={`w-full flex items-center px-3 py-2 text-left rounded-md ${UI_CLASSES.headerButtonHoverBg} hover:translate-x-1 transform transition-all duration-200 ease-in-out`}>
              <Cog6ToothIcon className={`w-5 h-5 mr-3 ${UI_CLASSES.textSecondary}`} />
              Настройки ребалансировки
            </button>
          </nav>
          <footer className={`p-4 mt-auto border-t border-slate-200 dark:border-slate-700`}>
            <p className={`${UI_CLASSES.textSecondary} text-xs`}>Версия 1.0.0</p>
          </footer>
        </div>
      </div>
    </>
  );
};

// --- Main Header Component ---

const Header: React.FC<HeaderProps> = ({ currentTheme, toggleTheme, onOpenCreateAccountModal, onOpenAccountWizard, accounts, selectedAccountId, onSelectAccount, onDeleteAccount, onEditAccount, onNavigateToSettings }) => {
  // State for controlling UI elements within the header
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null); // Ref for detecting clicks outside the dropdown

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isAccountDropdownOpen) setIsAccountDropdownOpen(false); // Close dropdown if sidebar opens
  };

  // Combines navigation and closing the sidebar
  const handleNavigateToSettings = () => {
    toggleSidebar();
    onNavigateToSettings();
  };

  const toggleAccountDropdown = () => setIsAccountDropdownOpen(prev => !prev);
  const closeAccountDropdown = () => setIsAccountDropdownOpen(false);

  // Handles selecting an account from the dropdown
  const handleSelect = (id: string) => {
    onSelectAccount(id);
    closeAccountDropdown();
  };
  
  // Handles actions from the dropdown menu (Create, Edit, Delete, Wizard)
  const handleAction = (action: 'Create' | 'Edit' | 'Delete' | 'Wizard') => {
    closeAccountDropdown();
    if (action === 'Create') {
      onOpenCreateAccountModal();
    } else if (action === 'Wizard') {
      onOpenAccountWizard();
    } else if (action === 'Delete') {
      if (selectedAccountId !== 'all') { // Cannot delete 'All Accounts'
        onDeleteAccount(selectedAccountId);
      }
    } else if (action === 'Edit') {
      if (selectedAccountId !== 'all') { // Cannot edit 'All Accounts'
        onEditAccount(selectedAccountId);
      }
    }
  }

  // Effect to close the account dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        closeAccountDropdown();
      }
    };
    if (isAccountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountDropdownOpen]);
  
  // Determine the name to display on the account selection button
  const selectedAccountName = selectedAccountId === 'all' 
    ? 'Все счета' 
    : accounts.find(acc => acc.id === selectedAccountId)?.name || 'Выберите счет';
    
  // Disable edit/delete actions if 'All Accounts' is selected
  const isActionDisabled = selectedAccountId === 'all';

  return (
    <>
      <header className={`p-4 flex items-center ${UI_CLASSES.headerBg} shadow-md sticky top-0 z-30 transition-colors duration-300 ease-in-out`}>
        {/* Burger Menu Button */}
        <button 
          aria-label="Открыть меню" 
          onClick={toggleSidebar}
          className={`${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} p-2 rounded-md transition-colors`}
        >
          <BurgerIcon />
        </button>
        
        {/* Account Selection Dropdown - Centered */}
        <div className="relative flex-1 flex justify-center" ref={accountDropdownRef}>
          <button
            id="account-button"
            onClick={toggleAccountDropdown}
            className={`flex items-center justify-center px-3 py-2 sm:px-4 ${UI_CLASSES.headerDropdownButton} rounded-lg transition-colors text-sm font-medium`}
            aria-haspopup="true"
            aria-expanded={isAccountDropdownOpen}
            aria-controls="account-dropdown-menu"
          >
            {selectedAccountName}
            <ChevronDownIcon className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isAccountDropdownOpen && (
            <div
              id="account-dropdown-menu"
              className={`absolute mt-2 w-64 origin-top-center left-1/2 transform -translate-x-1/2 ${UI_CLASSES.cardBg} rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40 py-1 transition-all ease-in-out duration-100 ${isAccountDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="account-button"
            >
              <button
                onClick={() => handleSelect('all')}
                className={`w-full text-left flex items-center px-4 py-2 text-sm ${UI_CLASSES.textPrimary} ${UI_CLASSES.headerButtonHoverBg} transition-colors`}
                role="menuitem"
              >
                <ListBulletIcon className={`w-5 h-5 mr-3 ${UI_CLASSES.textSecondary}`} />
                Все счета
              </button>
              {/* List all available accounts */}
              {accounts.map(account => (
                 <button
                  key={account.id}
                  onClick={() => handleSelect(account.id)}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm ${UI_CLASSES.textPrimary} ${UI_CLASSES.headerButtonHoverBg} transition-colors`}
                  role="menuitem"
                >
                  <span className="w-5 mr-3" /> {/* Spacer for alignment */}
                  {account.name}
                </button>
              ))}
              <hr className={`my-1 border-slate-200 dark:border-slate-600`} />
              {/* Action buttons */}
              <button
                onClick={() => handleAction('Wizard')}
                className={`w-full text-left flex items-center px-4 py-2 text-sm ${UI_CLASSES.textPrimary} ${UI_CLASSES.headerButtonHoverBg} transition-colors`}
                role="menuitem"
              >
                <SparklesIcon className={`w-5 h-5 mr-3 ${UI_CLASSES.textSecondary}`} />
                Мастер создания счетов
              </button>
              <button
                onClick={() => handleAction('Create')}
                className={`w-full text-left flex items-center px-4 py-2 text-sm ${UI_CLASSES.textPrimary} ${UI_CLASSES.headerButtonHoverBg} transition-colors`}
                role="menuitem"
              >
                <PlusIcon className={`w-5 h-5 mr-3 ${UI_CLASSES.textSecondary}`} />
                Создать счет
              </button>
              <button
                onClick={() => handleAction('Edit')}
                disabled={isActionDisabled}
                className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : `${UI_CLASSES.textPrimary} ${UI_CLASSES.headerButtonHoverBg}`}`}
                role="menuitem"
              >
                <PencilIcon className={`w-5 h-5 mr-3 ${UI_CLASSES.textSecondary}`} />
                Редактировать счет
              </button>
              <button
                onClick={() => handleAction('Delete')}
                disabled={isActionDisabled}
                className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${isActionDisabled ? 'opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-500' : 'text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50'}`}
                role="menuitem"
              >
                <TrashIcon className="w-5 h-5 mr-3" />
                Удалить счет
              </button>
            </div>
          )}
        </div>
        
        {/* Theme Toggle Button */}
        <button 
          aria-label="Переключить тему" 
          onClick={toggleTheme}
          className={`${UI_CLASSES.headerButtonIconColor} ${UI_CLASSES.headerButtonHoverBg} p-2 rounded-md transition-colors`}
        >
          {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>
      {/* Sidebar component is rendered here but visibility is controlled by state */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigateToSettings={handleNavigateToSettings} />
    </>
  );
};

export default Header;