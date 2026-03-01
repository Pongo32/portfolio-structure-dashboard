# Создание APK из веб-приложения

## Требования

1. **Node.js и npm** - установлены
2. **Android Studio** - скачайте с [официального сайта](https://developer.android.com/studio)
3. **Java Development Kit (JDK)** - версия 8 или выше

## Пошаговые инструкции

### 1. Подготовка проекта (уже выполнено)

```bash
# Уже установлены зависимости Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Создан файл capacitor.config.json
# Добавлена платформа Android
npx cap add android
```

### 2. Сборка веб-приложения и синхронизация

```bash
# Собрать приложение
npm run build

# Синхронизировать с Android
npx cap sync

# Или выполнить обе команды сразу
npm run build-android
```

### 3. Создание APK

#### Способ 1: Через Android Studio (Рекомендуется)

1. Откройте Android Studio:
   ```bash
   npm run android
   # или
   npx cap open android
   ```

2. Дождитесь завершения синхронизации Gradle

3. В Android Studio:
   - Перейдите в меню **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Дождитесь завершения сборки
   - APK будет создан в папке `android/app/build/outputs/apk/debug/`

#### Способ 2: Через командную строку

```bash
# Перейти в папку Android
cd android

# Собрать debug APK
./gradlew assembleDebug

# Собрать release APK (нужен keystore)
./gradlew assembleRelease
```

### 4. Полезные команды

```bash
# Пересобрать и синхронизировать
npm run build-android

# Открыть Android Studio
npm run android

# Только синхронизировать изменения
npm run sync
```

## Устранение проблем

### JavaScript ошибки в старых WebView

Если видите ошибки типа "Unexpected token ?", это означает, что WebView не поддерживает современный JavaScript. Проект уже настроен для совместимости с ES2015.

### Конфигурация для совместимости

В `vite.config.ts` добавлена конфигурация:
```typescript
build: {
  target: 'es2015',
  minify: 'terser',
  rollupOptions: {
    output: {
      format: 'es'
    }
  }
}
```

### Местоположение APK файлов

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## Подпись APK для релиза

Для публикации в Google Play нужно создать keystore:

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
```

Затем добавить в `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/my-release-key.jks')
            storePassword 'password'
            keyAlias 'my-alias'
            keyPassword 'password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Тестирование

APK можно установить на Android устройство для тестирования:

```bash
# Установить через ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Или просто скопировать APK файл на устройство и установить через файловый менеджер.
