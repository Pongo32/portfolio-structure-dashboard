# 📊 Portfolio Structure Dashboard

Современное веб-приложение для управления инвестиционным портфелем с поддержкой несколько счетов, визуализацией активов и функциями балансировки портфеля.

## 🎯 Особенности

- 📱 **Кроссплатформенность** - Работает в браузере и как Android приложение
- 💼 **Управление счетами** - Создание и управление несколькими инвестиционными счетами
- 📈 **Визуализация** - Интерактивные диаграммы (круговая, список активов с суммами)
- 🎨 **Темная тема** - Встроенная поддержка светлой и темной тем
- ⚖️ **Балансировка портфеля** - Предложения по оптимизации структуры активов
- 📲 **Offline-first** - Полная функциональность без интернета
- 🚀 **Быстрая загрузка** - Локальная сборка без CDN, оптимизированный bundle

## 📋 Требования

- Node.js v16 или выше
- npm или yarn
- Для Android: Java JDK 11+, Android SDK

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

```bash
# Копируем пример конфигурации
cp .env.example .env

# Заполняем необходимые переменные (если требуются API ключи)
```

### 3. Разработка

```bash
npm run dev
```

Или на Windows:
```bash
start-local.bat
```

Приложение откроется в браузере по адресу `http://localhost:5173`

## 📦 Доступные скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера с hot reload |
| `npm run build` | Сборка для продакшн |
| `npm run preview` | Предпросмотр собранного приложения |
| `npm run android` | Открыть Android Studio с проектом |
| `npm run sync` | Синхронизировать изменения с Capacitor |
| `npm run build-android` | Собрать и синхронизировать для Android |

## 🏗️ Структура проекта

```
portfolio-structure-dashboard/
├── components/              # React компоненты
│   ├── Header.tsx          # Шапка приложения с выбором счета
│   ├── PortfolioDisplay.tsx # Основной контейнер портфеля
│   ├── DonutChart.tsx       # Круговая диаграмма активов
│   ├── AssetBreakdownList.tsx # Список активов с суммами
│   ├── AccountWizardModal.tsx # Модальное окно создания счета
│   ├── RebalanceSettings.tsx # Настройки балансировки
│   └── ...другие компоненты
├── android/                 # Capacitor Android проект
│   └── app/                 # Основное Android приложение
├── types.ts                 # TypeScript типы и интерфейсы
├── constants.ts             # Константы приложения
├── index.tsx                # Точка входа React
├── App.tsx                  # Главный компонент приложения
├── vite.config.ts           # Конфигурация Vite
├── tailwind.config.js       # Конфигурация TailwindCSS
├── tsconfig.json            # Конфигурация TypeScript
└── package.json             # Зависимости и скрипты
```

## 🎨 Стек технологий

- **Frontend Framework:** React 19 с TypeScript
- **Сборщик:** Vite 6
- **Стили:** TailwindCSS 3
- **Графики:** Recharts 3
- **Мобильность:** Capacitor 7 (Android)
- **Сборка CSS:** PostCSS + Autoprefixer
- **Языки:** TypeScript, JSX/TSX, CSS

## 🔧 Конфигурация

### Переменные окружения (.env)

```env
# Добавьте необходимые переменные окружения здесь
# Пример:
VITE_API_URL=http://localhost:3000
```

### TailwindCSS

Конфигурация находится в `tailwind.config.js` с поддержкой:
- Светлой и темной темы
- Пользовательских цветов и шрифтов
- Адаптивного дизайна

### TypeScript

Строгая типизация с `target: ES2020` и `strict: true`

## 📱 Сборка для Android

### Предварительные требования

- Java JDK 11+
- Android SDK (API 24+)
- Gradle 8.7.3+

### Инструкции

1. Подготовьте веб-приложение:
```bash
npm run build
```

2. Синхронизируйте с Capacitor:
```bash
npm run sync
```

3. Откройте Android Studio:
```bash
npm run android
```

4. Соберите APK:
   - Выберите Build → Build Bundle(s)/APK(s) → Build APK(s)
   - Или используйте команду `./gradlew assembleDebug`

Подробнее: смотрите [ANDROID_BUILD.md](./ANDROID_BUILD.md)

## 💡 Разработка

### Добавление нового компонента

1. Создайте файл в `components/`
2. Используйте типы из `types.ts`
3. Применяйте стили из `constants.ts` (UI_CLASSES, THEME_PALETTE)

### Пример компонента

```tsx
import React from 'react';
import { UI_CLASSES } from '../constants';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className={UI_CLASSES.card}>
      <h2 className={UI_CLASSES.heading}>{title}</h2>
    </div>
  );
};

export default MyComponent;
```

## 🎨 Использование стилей

Проект использует TailwindCSS с предопределенными классами в `constants.ts`:

```tsx
import { UI_CLASSES, THEME_PALETTE } from '../constants';

<button className={`${UI_CLASSES.button} ${UI_CLASSES.buttonPrimary}`}>
  Действие
</button>
```

## 📊 Управление портфелем

### Функции

- **Создание счета** - Добавьте новый инвестиционный счет с названием и начальной суммой
- **Добавление активов** - Укажите название, процент или сумму в портфеле
- **Просмотр структуры** - Визуализация активов в виде диаграммы и таблицы
- **Балансировка** - Получайте рекомендации по оптимизации портфеля
- **Управление удалением** - Удаляйте счета с подтверждением

### Типы данных

```typescript
interface Account {
  id: string;
  name: string;
  totalValue: number;
  currency: string;
  assets: Asset[];
}

interface Asset {
  id: string;
  name: string;
  value: number;      // Процент от портфеля
  color: string;      // Hex цвет
  colorKey: string;   // Ключ для темы
}
```

## 🐛 Отладка

### Chrome DevTools

1. Откройте DevTools (F12)
2. Используйте React DevTools расширение
3. Проверьте Network и Console вкладки

### Логирование

Добавьте логирование в компоненты:

```tsx
console.log('Portfolio data:', portfolioData);
```

## 📝 Лицензия

ISC

## 👤 Автор

Portfolio Structure Dashboard

## 📚 Дополнительные ресурсы

- [React документация](https://react.dev)
- [Vite документация](https://vitejs.dev)
- [TailwindCSS документация](https://tailwindcss.com)
- [Capacitor документация](https://capacitorjs.com)
- [Recharts документация](https://recharts.org)

## 🤝 Поддержка

Для вопросов и проблем используйте инструменты разработки браузера или обратитесь к документации проекта.

---

**Версия:** 0.0.0
**Статус:** В разработке
**Последнее обновление:** 2026-03-01
