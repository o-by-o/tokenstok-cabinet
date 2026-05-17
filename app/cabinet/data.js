// data.js — mock content for the cabinet. Russian, friendly tone, no jargon.

export const TS_MODELS = [
  { id:'gpt-5',             name:'GPT-5',              glyph:'G5', vendor:'OpenAI',     kind:'text',  price:'4,12',  unit:'₽ / 1k вх',   hot:true,  tag:'самая умная' },
  { id:'claude-sonnet-4.5', name:'Claude Sonnet 4.5',  glyph:'CL', vendor:'Anthropic',  kind:'text',  price:'2,88',  unit:'₽ / 1k вх',   hot:false, tag:'код' },
  { id:'claude-haiku-4.5',  name:'Claude Haiku 4.5',   glyph:'CH', vendor:'Anthropic',  kind:'text',  price:'0,38',  unit:'₽ / 1k вх',   hot:false, tag:'быстрая' },
  { id:'gemini-2.5-pro',    name:'Gemini 2.5 Pro',     glyph:'G·', vendor:'Google',     kind:'text',  price:'1,82',  unit:'₽ / 1k вх',   hot:false, tag:'мульти' },
  { id:'deepseek-r1',       name:'DeepSeek R1',        glyph:'DS', vendor:'DeepSeek',   kind:'text',  price:'0,52',  unit:'₽ / 1k вх',   hot:false, tag:'дёшево' },
  { id:'llama-4-405b',      name:'Llama 4 405B',       glyph:'L4', vendor:'Meta',       kind:'text',  price:'1,12',  unit:'₽ / 1k вх',   hot:false, tag:'опен-сорс' },
  { id:'mistral-large-3',   name:'Mistral Large 3',    glyph:'M3', vendor:'Mistral',    kind:'text',  price:'0,98',  unit:'₽ / 1k вх',   hot:false, tag:'европа' },
  { id:'dalle-4',           name:'DALL·E 4',           glyph:'D4', vendor:'OpenAI',     kind:'image', price:'3,40',  unit:'₽ / шт',      hot:true,  tag:'точный промпт' },
  { id:'midjourney-v7',     name:'Midjourney v7',      glyph:'MJ', vendor:'Midjourney', kind:'image', price:'5,20',  unit:'₽ / шт',      hot:false, tag:'арт' },
  { id:'flux-pro',          name:'Flux Pro 1.1',       glyph:'FX', vendor:'BFL',        kind:'image', price:'2,10',  unit:'₽ / шт',      hot:false, tag:'фото' },
  { id:'sora-2',            name:'Sora 2',             glyph:'S2', vendor:'OpenAI',     kind:'video', price:'48,00', unit:'₽ / 5 сек',   hot:true,  tag:'кино' },
  { id:'veo-3',             name:'Veo 3',              glyph:'V3', vendor:'Google',     kind:'video', price:'36,00', unit:'₽ / 5 сек',   hot:false, tag:'реалистично' },
  { id:'elevenlabs-v3',     name:'ElevenLabs v3',      glyph:'11', vendor:'Eleven',     kind:'voice', price:'6,20',  unit:'₽ / 1k симв', hot:false, tag:'озвучка' },
];

export const TS_RECENT_MODELS = ['claude-sonnet-4.5','gpt-5','dalle-4','claude-haiku-4.5','sora-2','deepseek-r1'];

export const TS_PROMPTS = {
  haiku: {
    q: 'Хокку про дедлайн?',
    a: 'Тикают громче,\nчернила сохнут раньше\nсомнений. Поехали.',
    model: 'claude-sonnet-4.5', glyph:'CL',
    cost: 0.0086, tokens: 47, latency: 312,
  },
  market: {
    q: 'Чем claude отличается от gpt?',
    a: 'Sonnet 4.5 сильнее в коде и держит длинные сессии.\nGPT-5 шире по знаниям и быстрее в рассуждениях. Под код — claude, под общие вопросы — gpt.',
    model: 'claude-sonnet-4.5', glyph:'CL',
    cost: 0.0142, tokens: 84, latency: 281,
  },
  cheapest: {
    q: 'Самая дешёвая модель для классификации?',
    a: 'claude-haiku-4.5 — 0,38 ₽ за 1k входных.\nДля 100k запросов выйдет ~38 ₽ в день. Качество — почти как у sonnet.',
    model: 'claude-haiku-4.5', glyph:'CH',
    cost: 0.0042, tokens: 71, latency: 198,
  },
  recipe: {
    q: 'Рецепт киндзмараули за 30 секунд?',
    a: 'Саперави, прохладное брожение, остановка дрожжей холодом.\nОстаточный сахар 3–5%. Подавать к жаренному мясу, не к десерту.',
    model: 'gpt-5', glyph:'G5',
    cost: 0.0124, tokens: 95, latency: 322,
  },
};

export const TS_HISTORY = [
  { id:'h1', title:'Промт для лендинга',       when:'сейчас',    pinned:true,  preview:'давай попробуем поп-тон…',  model:'claude-sonnet-4.5' },
  { id:'h2', title:'Сравнить sonnet и gpt-5',   when:'2 ч назад', pinned:true,  preview:'нужно для отчёта, в табли…', model:'gpt-5' },
  { id:'h3', title:'Скетч обложки альбома',     when:'вчера',     pinned:false, preview:'midjourney v7, моно, плён…', model:'midjourney-v7' },
  { id:'h4', title:'Перевести договор на en',   when:'2 дня',     pinned:false, preview:'построчно, юридический ст…', model:'gpt-5' },
  { id:'h5', title:'Видео для сторис',          when:'3 дня',     pinned:false, preview:'sora 2, 5 сек, dog runs in…', model:'sora-2' },
  { id:'h6', title:'Скрипт миграции postgres',  when:'неделя',    pinned:false, preview:'alembic + zero-downtime…',   model:'claude-sonnet-4.5' },
  { id:'h7', title:'Расшифровка совещания',     when:'неделя',    pinned:false, preview:'2 спикера, 47 минут, рус…',  model:'gpt-5' },
];

export const TS_AGENTS = [
  { id:'editor',  name:'Редактор',       glyph:'Р',  desc:'Сжимает текст, убирает воду, держит твой голос.',           model:'claude-sonnet-4.5' },
  { id:'coder',   name:'Программист',    glyph:'</>',desc:'Пишет код, читает стектрейсы, чинит баги.',                  model:'claude-sonnet-4.5' },
  { id:'lawyer',  name:'Юрист',          glyph:'§',  desc:'Договоры, оферты, претензии. Объясняет простым языком.',     model:'gpt-5' },
  { id:'planner', name:'Планировщик',    glyph:'☰',  desc:'Из «надо всё» делает план по шагам с дедлайнами.',           model:'gpt-5' },
  { id:'cook',    name:'Повар',          glyph:'⌘',  desc:'Подбирает рецепт по тому, что лежит в холодильнике.',        model:'claude-haiku-4.5' },
  { id:'trip',    name:'Путешественник', glyph:'➜',  desc:'Маршрут на N дней, бюджет, локальные места.',                model:'gpt-5' },
];

export const TS_PROMPTS_LIB = [
  { id:'sum',  title:'Краткий пересказ',           tag:'текст',    uses:142, preview:'Сожми текст ниже до 5 пунктов…' },
  { id:'eml',  title:'Письмо клиенту',             tag:'текст',    uses:89,  preview:'Напиши деловое письмо, тон…' },
  { id:'code', title:'Рефакторинг функции',        tag:'код',      uses:67,  preview:'Перепиши функцию ниже без…' },
  { id:'icn',  title:'Иконки в SVG, одной линией', tag:'картинка', uses:54,  preview:'Нарисуй иконку «дом» одной…' },
  { id:'ttl',  title:'10 заголовков на выбор',     tag:'текст',    uses:38,  preview:'Сгенерируй 10 вариантов заг…' },
  { id:'rec',  title:'Рецепт по продуктам',        tag:'жизнь',    uses:22,  preview:'У меня есть [список]. Что мо…' },
];
