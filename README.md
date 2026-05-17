# tokenstok-cabinet

Мобильный кабинет **ТокенСток** — маркетплейс 218 нейросетей с оплатой по факту. Next.js 16 + React 19, mobile-first, адаптируется до десктопа.

**Связанный репо:** [`o-by-o/maket4ik`](https://github.com/o-by-o/maket4ik) — снимок исходного design canvas (Figma-style preview с 18 артбордами).

## Запуск локально

```bash
npm install
npm run dev               # webpack (стабильно по памяти)
npm run dev:turbo         # Turbopack (быстрее, может течь память на длинных сессиях)
# открой http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```

Все маршруты prerender как статика — будет работать на любом hosting'е, который поддерживает Next.js (Vercel, Netlify, Cloudflare Pages, Render).

## Deploy на Vercel

Самый быстрый путь:

1. Зайди на [vercel.com/new](https://vercel.com/new)
2. Импортируй `o-by-o/tokenstok-cabinet`
3. Settings — оставь дефолты (Next.js auto-detect)
4. Deploy

Деплой займёт ~30 секунд. Получишь URL вида `tokenstok-cabinet-xxx.vercel.app`.

Через CLI:
```bash
npm install -g vercel
vercel              # один раз залогинься
vercel --prod       # выкатить продакшен
```

## Что реализовано

Все 15 артбордов из исходного дизайна — как настоящие интерактивные экраны.

| Раздел | Маршрут / Точка входа |
|---|---|
| 01 · Пустой чат | `/chat` (без сообщений) |
| 02 · Стриминг | `/chat` после `Enter` в композере |
| 03 · Picker моделей | bottom-sheet по тапу пилюли модели |
| 04 · Long-press | touch+hold / right-click на ответе |
| 05 · Voice input | bottom-sheet по тапу на 🎙 |
| 06–08 · Картинка | inline в чате по промту «нарисуй / обложка / иконка» |
| 09 · Видео | inline в чате по промту «5 секунд видео» |
| 10 · Sidebar | persistent (desktop) / drawer (mobile) |
| 11 · Кошелёк | `/wallet` |
| 12 · Лимит | inline LimitCard при balance < 0.5 ₽ |
| 13 · Эксперты | `/agents` |
| 14 · Сравнение | `/compare` |
| 15 · Промпт-библиотека | `/library` |
| + Настройки | `/settings` (theme / accent / density / stream effect / cost toggle) |

## Адаптив

| Ширина | Layout |
|---|---|
| `< 768` | full-width main + overlay drawer + bottom tab bar + iOS status bar simulation |
| `768–1023` | full-width main, overlay drawer (sidebar пока не показывается) |
| `1024–1439` | sidebar (280px) + main |
| `≥ 1440` | sidebar + main + правый рейл (320px) с моделью / последними промтами / расходом |

## Темы

| | |
|---|---|
| Light | warm paper background, ink-on-paper text — дефолт |
| Dark | tea-brown background, cream text |

Переключается в `/settings → Внешний вид → Тема`. Сохраняется в `localStorage`.

## Стек

- **Next.js 16.2.6** (webpack по умолчанию для стабильности; Turbopack как opt-in)
- **React 19**
- **`next/font/google`** — Manrope + JetBrains Mono
- **Только react/next зависимости** — никаких UI-библиотек, состояния, анимаций
- **State** — Context + useReducer, persist в `localStorage` (`tokenstok:v1`), seed детерминированный (`SEED_NOW=2026-05-12`) для отсутствия SSR/client divergence
- **Streaming** — мок (`lib/streaming.js` подбирает ответ из `data.js` по ключевым словам). API ещё не подключён.

## Структура

```
app/
  layout.js               # html shell + шрифты + Providers + TSStyles
  globals.css             # reset, базовый шрифт
  page.js                 # redirect → /chat
  providers.js            # client wrapper для AppProvider

  (shell)/                # route group — общий шелл (sidebar | main | rail)
    layout.js
    chat/page.js
    wallet/page.js        # 11 · Кошелёк
    agents/page.js        # 13 · Эксперты
    compare/page.js       # 14 · Сравнение
    library/page.js       # 15 · Библиотека
    settings/page.js      # настройки

  components/
    shell/                # AppShell, Sidebar, MobileDrawer, RightRail, BottomTabBar
    chat/                 # ChatView, ChatHeader, MessageList, MessageBubble, Composer,
                          # EmptyChat, LimitCard, ImageGenCard, VideoGenCard
    sheets/               # Sheet, ModelPickerSheet, LongPressMenu, VoiceInputSheet
    features/             # AgentsView, LibraryView, CompareView
    wallet/, settings/    # WalletView, SettingsView

  lib/
    store.js              # AppProvider + reducer + localStorage persist + детерминированный seed
    streaming.js          # mockComplete + useStreamingMessage хук + detectIntent (text/image/video)
    hooks.js              # useBreakpoint, useLongPress, useAutosizeTextarea, useEscape, useClickOutside
    utils.js              # cn, uid, fmtRub, relTime (с SSR-safe `now` параметром), timeOfDay

  cabinet/                # унаследовано из дизайн-снимка (maket4ik)
    foundation.js         # темы (TS_THEMES), акценты (TS_ACCENTS), иконки (TSIcon), .ts-* CSS
    data.js               # моки моделей, истории чатов, агентов, шаблонов
    streams.js            # legacy looping-эффекты (для preview в /settings)
```

## Что осталось

- Реальный API (Anthropic / OpenAI) вместо моков в `lib/streaming.js`
- Полноценный onboarding flow (login + balance setup)
- File upload в композер
- Web search toggle в composer
- Edge-swipe для drawer на iOS
- Реальный voice через whisper-1 API вместо Web Speech
- Загрузка изображения как input (для vision-моделей)

## Лицензия

MIT
