const { getSuggestions } = require('./providers/suggest.provider');

const COMMON_MODIFIERS = [
  '',
  'купить',
  'цена',
  'стоимость',
  'отзывы',
  'обзор',
  'как выбрать',
  'лучший',
];

const CATEGORY_MODIFIERS = {
  crypto: [
    '',
    'для начинающих',
    'кошелек',
    'биржа',
    'налоги',
    'безопасность',
    'обучение',
    'новости',
    'арбитраж',
  ],

  construction_materials: [
    '',
    'купить',
    'цена',
    'доставка',
    'оптом',
    'м500',
    'для фундамента',
    'расход',
    'мешок 50 кг',
  ],

  fashion: [
    '',
    'купить',
    'цена',
    'отзывы',
    'на свадьбу',
    'вечернее',
    'летнее',
    'большого размера',
    'на выпускной',
  ],

  adult: [
    '',
    'купить',
    'цена',
    'отзывы',
    'доставка',
    'как выбрать',
    'для начинающих',
  ],

  local_services: [
    '',
    'рядом',
    'цена',
    'стоимость',
    'вызвать',
    'срочно',
    'ремонт',
    'услуги',
    'отзывы',
  ],

  energy: [
    '',
    'цена',
    'прогноз',
    'новости',
    'курс',
    'фьючерсы',
    'стоимость',
  ],

  consumer_utility: [
    '',
    'купить',
    'цена',
    'доставка',
    'отзывы',
    'качество',
    'фильтр',
    'рядом',
  ],

  education_tools: [
    '',
    'купить',
    'цена',
    'для школы',
    'как пользоваться',
    'набор',
    'отзывы',
  ],

  general: COMMON_MODIFIERS,
};

const buildQueries = ({ topic, category }) => {
  const modifiers = CATEGORY_MODIFIERS[category] || CATEGORY_MODIFIERS.general;

  return modifiers
    .map(modifier => {
      if (!modifier) return topic;

      return `${topic} ${modifier}`;
    })
    .map(query => query.trim())
    .filter(Boolean);
};

const normalizeKeyword = keyword =>
  String(keyword || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const dedupeSuggestions = suggestions => {
  const seen = new Set();

  return suggestions.filter(item => {
    const key = normalizeKeyword(item.keyword);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getDeepSuggestions = async ({ topic, category }) => {
  const queries = buildQueries({ topic, category });
  const allSuggestions = [];
  const providerResults = [];

  for (const query of queries) {
    const result = await getSuggestions({ query });

    providerResults.push({
      query,
      source: result.source,
      warning: result.warning,
      suggestionsCount: result.suggestions.length,
    });

    result.suggestions.forEach(suggestion => {
      allSuggestions.push({
        ...suggestion,
        sourceQuery: query,
      });
    });
  }

  const dedupedSuggestions = dedupeSuggestions(allSuggestions);

  const successfulQueries = providerResults.filter(
    item => item.source.status === 'ok'
  );

  const failedQueries = providerResults.filter(
    item => item.source.status !== 'ok'
  );

  return {
    source: {
      provider: 'yandex_suggest',
      type: 'autocomplete_deep',
      exactVolume: false,
      status: successfulQueries.length ? 'ok' : 'empty',
    },
    queries,
    providerResults,
    suggestions: dedupedSuggestions.map((suggestion, index) => ({
      ...suggestion,
      position: index + 1,
    })),
    warning: failedQueries.length
      ? `${failedQueries.length}/${providerResults.length} suggest queries returned empty or failed.`
      : null,
  };
};

module.exports = {
  getDeepSuggestions,
};