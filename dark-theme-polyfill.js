// Полифилл для поддержки темной темы в старых WebView
(function() {
  'use strict';

  // Проверяем поддержку prefers-color-scheme
  function supportsColorScheme() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined;
    } catch (e) {
      return false;
    }
  }

  // Функция для принудительного применения темной темы
  function applyDarkTheme() {
    const darkStyles = `
      body {
        background-color: #1a1a1a !important;
        color: #ffffff !important;
      }
      .bg-white {
        background-color: #2d2d2d !important;
      }
      .text-gray-900 {
        color: #ffffff !important;
      }
      .text-gray-600 {
        color: #a0a0a0 !important;
      }
      .border-gray-200 {
        border-color: #444444 !important;
      }
      .shadow-lg {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
      }
      .shadow-sm {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3) !important;
      }
      /* Фиксы для карточек */
      .card, .bg-gray-50 {
        background-color: #2d2d2d !important;
        border-color: #444444 !important;
      }
      /* Фиксы для кнопок */
      .btn-primary, .bg-blue-500 {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
      }
      .btn-primary:hover, .bg-blue-600 {
        background-color: #2563eb !important;
        border-color: #2563eb !important;
      }
      /* Фиксы для инпутов */
      input, textarea, select {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
        color: #ffffff !important;
      }
      input:focus, textarea:focus, select:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
      /* Фиксы для диаграмм */
      .recharts-wrapper {
        background-color: transparent !important;
      }
      .recharts-cartesian-grid-horizontal line,
      .recharts-cartesian-grid-vertical line {
        stroke: #444444 !important;
      }
      .recharts-text {
        fill: #ffffff !important;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.innerHTML = darkStyles;
    styleElement.id = 'dark-theme-polyfill';
    document.head.appendChild(styleElement);
  }

  // Функция для удаления темной темы
  function removeDarkTheme() {
    const existingStyle = document.getElementById('dark-theme-polyfill');
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  // Функция для определения темы системы
  function detectDarkMode() {
    // Проверяем время (простая эвристика)
    const hour = new Date().getHours();
    const isDarkTime = hour < 6 || hour >= 22;
    
    // Проверяем настройки браузера (если доступно)
    let prefersDark = false;
    if (supportsColorScheme()) {
      prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Проверяем localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      prefersDark = true;
    } else if (savedTheme === 'light') {
      prefersDark = false;
    }
    
    return prefersDark || isDarkTime;
  }

  // Функция для переключения темы
  function toggleTheme() {
    const isDark = detectDarkMode();
    if (isDark) {
      applyDarkTheme();
      localStorage.setItem('theme', 'dark');
    } else {
      removeDarkTheme();
      localStorage.setItem('theme', 'light');
    }
  }

  // Инициализация при загрузке
  function init() {
    // Применяем тему сразу
    if (detectDarkMode()) {
      applyDarkTheme();
    }

    // Слушаем изменения темы (если поддерживается)
    if (supportsColorScheme()) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', toggleTheme);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(toggleTheme);
      }
    }

    // Добавляем кнопку переключения темы
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '🌙';
    toggleButton.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 18px;
      cursor: pointer;
    `;
    toggleButton.onclick = function() {
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme === 'dark') {
        removeDarkTheme();
        localStorage.setItem('theme', 'light');
        toggleButton.innerHTML = '🌙';
      } else {
        applyDarkTheme();
        localStorage.setItem('theme', 'dark');
        toggleButton.innerHTML = '☀️';
      }
    };
    
    // Добавляем кнопку после загрузки DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(toggleButton);
      });
    } else {
      document.body.appendChild(toggleButton);
    }
  }

  // Запускаем инициализацию
  init();

  // Экспортируем функции для использования в приложении
  window.darkThemePolyfill = {
    toggle: toggleTheme,
    apply: applyDarkTheme,
    remove: removeDarkTheme,
    detect: detectDarkMode
  };
})();
