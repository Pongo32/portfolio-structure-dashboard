# AGENTS.md

This repository is a React + TypeScript + Vite portfolio dashboard for tracking investment accounts and asset allocation. It also packages as an Android app via Capacitor. Keep changes aligned with the current app structure and prefer incremental updates over architectural rewrites.

## Quick start

- Install dependencies: `npm install`
- Start the app: `npm run dev`
- Build for production: `npm run build`
- Preview the production build: `npm run preview`
- Open the Android project: `npm run android`
- Sync web app with Capacitor: `npm run sync`
- Build Android bundle after a production build: `npm run build-android`

On Windows, the project also includes `start-local.bat` for the local dev flow. See [README.md](README.md) for the product overview and setup details.

## Architecture and conventions

- Application entry: `index.tsx` and `App.tsx`
- Shared TypeScript contracts: `types.ts`
- Shared UI tokens, palette, and class names: `constants.ts`
- Asset-name aliases and normalization helpers: `assetNames.ts`
- Russian/English strings and language persistence: `i18n.ts`
- Reusable React views live in `components/`
- Android packaging and native build notes live in `android/` and [ANDROID_BUILD.md](ANDROID_BUILD.md)

## Product behavior to preserve

- `App.tsx` owns the portfolio, account, settings, and view state. Keep existing persisted localStorage keys and data formats compatible; normalize and validate imported or stored data at the boundaries.
- Asset-name groups map aliases to a canonical display name only when name normalization is enabled. Keep aliases unique across groups, preserve user-defined groups, and update the alias-group version when changing the built-in presets.
- Rebalance preview is derived display data: toggling it must not modify account balances or saved assets.
- Account backups may include settings and only the accounts selected by the user. Preserve support for existing backup formats when changing import/export behavior.
- Keep all user-facing changes working in both Russian and English, and in light and dark themes.

## Working rules

- Reuse the existing UI primitives and styling tokens in `constants.ts` instead of introducing ad hoc classes.
- Keep new data structures aligned with the interfaces in `types.ts` when adding accounts, assets, or portfolio calculations.
- Prefer small, focused component changes in `components/` over large refactors.
- Treat [README.md](README.md) and [ANDROID_BUILD.md](ANDROID_BUILD.md) as the source of truth for setup, product behavior, and Android packaging.
- Ignore generated directories such as `node_modules`, `dist`, and native build artifacts unless the task explicitly targets them.
- Do not change localStorage or backup schemas without a compatibility path for existing user data.
- Do not run Android sync/build commands for web-only changes; Capacitor sync updates generated native project assets.

## Validation

- Run `npm run build` for TypeScript/Vite validation after application code changes.
- Run `git diff --check` to catch whitespace errors.
- No dedicated test script is currently defined in `package.json`; do not claim automated tests passed unless a test runner is added and run.
- For Android work, follow [ANDROID_BUILD.md](ANDROID_BUILD.md) and verify the generated APK exists after Gradle succeeds.

## Typical edit paths

- UI changes: `App.tsx`, `components/`
- Portfolio/account model changes: `types.ts`, `constants.ts`, and the corresponding render logic
- Alias normalization and built-in spellings: `assetNames.ts`
- Language strings: `i18n.ts`
- Build or Android release work: `android/`, [ANDROID_BUILD.md](ANDROID_BUILD.md), and related capacitor config files

## Do not do

- Do not rewrite the app to a different framework or state-management pattern.
- Do not duplicate styling rules or data contracts when a shared definition already exists.
- Do not change the build/deploy flow without checking the existing Vite + Capacitor setup in [README.md](README.md).
