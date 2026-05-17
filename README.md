# tokenstok-cabinet

Мобильный кабинет **ТокенСток** — маркетплейс 218 нейросетей с оплатой по факту. Next.js 16 + React 19, mobile-first, адаптируется до десктопа (sidebar + чат + правый рейл).

## Что внутри (milestones M1–M5)

- **AppShell** — отзывчивая 3-колоночная раскладка. Мобилка ≤768 = только main + overlay-drawer для сайдбара. Десктоп ≥1024 = sidebar + main. Wide ≥1440 = + правый рейл (текущая модель, последние промты, расход).
- **Чат** — реальный input с autosize textarea, отправка по Enter (Shift+Enter — перенос), стриминговый мок ответа из `lib/streaming.js` с поддержкой 4 эффектов (token / pop / blur / phosphor).
- **История** — sidebar с поиском, закреплёнными и недавними. Клик → переключает чат, "+ новый чат" → создаёт пустой и фокусит композер.
- **Picker моделей** — bottom-sheet на мобилке, центрированный модал на десктопе. Свайп-вниз для закрытия. Табы по типу (текст/картинки/видео/голос), карточки моделей с ценой. Кнопка «смотреть все 218» расширяет каталог филлером.
- **Long-press menu** — touch-and-hold (мобилка) / right-click (десктоп) по сообщению ассистента. 6 действий: Copy (реальный clipboard), Regenerate (ре-ран mockEngine), Edit (prompt → regenerate), Quote / Pin / Translate.

И страницы-заглушки `/agents`, `/library`, `/compare` (будут собраны в M6–M9), плюс рабочие `/wallet` и `/settings`.

## Запуск

```bash
npm install
PORT=3417 npm run dev
# http://localhost:3417
```

## Стек

- Next.js 16.2.6 (Turbopack) + React 19
- `next/font/google` — Manrope + JetBrains Mono
- Никаких runtime-зависимостей сверх react/next
- Состояние — Context + useReducer, persist в `localStorage` (`tokenstok:v1`)
- Стриминговые ответы — мок (`lib/streaming.js`), реальный API будет в следующей итерации

## Структура

```
app/
  layout.js               # html shell + шрифты + Providers + TSStyles
  globals.css             # reset, базовый шрифт, prefers-reduced-motion
  page.js                 # redirect → /chat
  providers.js            # client wrapper для AppProvider

  (shell)/                # route group — общий шелл для chat/wallet/...
    layout.js
    chat/page.js          # ChatView
    wallet/page.js        # WalletView (balance, topup, today chart, breakdown)
    agents/page.js        # StubView (M9)
    compare/page.js       # StubView (M9)
    library/page.js       # StubView (M9)
    settings/page.js      # SettingsView (тема/акцент/плотность/effect/cost)

  components/
    shell/{AppShell, Sidebar, MobileDrawer, RightRail}.jsx
    chat/{ChatView, ChatHeader, MessageList, MessageBubble, Composer, EmptyChat}.jsx
    sheets/{Sheet, ModelPickerSheet, LongPressMenu}.jsx
    wallet/WalletView.jsx
    settings/SettingsView.jsx
    stub/StubView.jsx

  lib/
    store.js              # AppProvider + reducer + localStorage persist + seed
    streaming.js          # mockComplete + useStreamingMessage хук
    hooks.js              # useBreakpoint, useLongPress, useAutosizeTextarea, useEscape, useClickOutside
    utils.js              # cn, uid, fmtRub, relTime, timeOfDay

  cabinet/                # унаследовано из дизайн-снимка (maket4ik)
    foundation.js         # темы (TS_THEMES), акценты (TS_ACCENTS), иконки (TSIcon), CSS
    data.js               # моки моделей, истории, агентов, шаблонов
    streams.js            # legacy looping-эффекты (оставлены для preview в /settings)
```

## Адаптив

- `<768` мобилка: full-width main, overlay-drawer, bottom-sheet
- `768–1023` планшет: sidebar полноценный + main, без рейла
- `1024–1439` десктоп: sidebar + main
- `≥1440` wide: sidebar + main + правый рейл

## Что дальше (M6–M10)

- M6 — генерация картинки и видео инлайн в чате (3 фазы → готово)
- M7 — voice input sheet (Web Speech API + fallback)
- M8 — limit error card + продвинутый wallet
- M9 — agents, library, compare как живые экраны
- M10 — keyboard shortcuts, accessibility pass, edge-swipe для drawer

## Связанные репо

- **`o-by-o/maket4ik`** — оригинальный design canvas с 18 артбордами (Figma-style preview).
