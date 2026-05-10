const { getYandexSuggestions } = require('./yandexSuggest.provider');

const getSuggestions = async ({ query }) => {
  const provider = process.env.TOPIC_SUGGEST_PROVIDER || 'yandex';

  if (provider === 'yandex') {
    return await getYandexSuggestions({ query });
  }

  return {
    source: {
      provider,
      type: 'autocomplete',
      exactVolume: false,
      status: 'not_configured',
    },
    query,
    suggestions: [],
    warning: `Unsupported suggest provider: ${provider}`,
  };
};

module.exports = {
  getSuggestions,
};