const DEFAULT_TIMEOUT_MS = Number(process.env.TOPIC_SUGGEST_TIMEOUT_MS || 10000);

const buildYandexSuggestUrl = ({ query, language = 'ru' }) => {
  const url = new URL('https://suggest.yandex.ru/suggest-ff.cgi');

  url.searchParams.set('part', query);
  url.searchParams.set('uil', language);
  url.searchParams.set('v', '4');

  return url.toString();
};

const normalizeYandexResponse = payload => {
  if (!Array.isArray(payload)) {
    return [];
  }

  const suggestions = payload[1];

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          keyword: item,
          position: index + 1,
        };
      }

      if (Array.isArray(item) && typeof item[0] === 'string') {
        return {
          keyword: item[0],
          position: index + 1,
        };
      }

      return null;
    })
    .filter(Boolean);
};

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json,text/plain,*/*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });

    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const requestYandexSuggestions = async ({ query, language, timeoutMs }) => {
  const url = buildYandexSuggestUrl({
    query,
    language,
  });

  const response = await fetchWithTimeout(url, timeoutMs);

  if (!response.ok) {
    return {
      ok: false,
      suggestions: [],
      warning: `Yandex Suggest failed with status ${response.status}.`,
    };
  }

  const text = await response.text();

  let payload;

  try {
    payload = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      suggestions: [],
      warning: 'Yandex Suggest returned non-JSON response.',
    };
  }

  return {
    ok: true,
    suggestions: normalizeYandexResponse(payload),
    warning: null,
  };
};

const getYandexSuggestions = async ({
  query,
  language = process.env.TOPIC_SUGGEST_LANGUAGE || 'ru',
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) => {
  const cleanQuery = String(query || '').trim();

  if (!cleanQuery) {
    return {
      source: {
        provider: 'yandex_suggest',
        type: 'autocomplete',
        exactVolume: false,
        status: 'skipped',
      },
      query: cleanQuery,
      suggestions: [],
      warning: 'Query is empty.',
    };
  }

  try {
    const firstAttempt = await requestYandexSuggestions({
      query: cleanQuery,
      language,
      timeoutMs,
    });

    if (firstAttempt.ok && firstAttempt.suggestions.length) {
      return {
        source: {
          provider: 'yandex_suggest',
          type: 'autocomplete',
          exactVolume: false,
          status: 'ok',
        },
        query: cleanQuery,
        suggestions: firstAttempt.suggestions,
        warning: null,
      };
    }

    const secondAttempt = await requestYandexSuggestions({
      query: cleanQuery,
      language,
      timeoutMs,
    });

    if (secondAttempt.ok && secondAttempt.suggestions.length) {
      return {
        source: {
          provider: 'yandex_suggest',
          type: 'autocomplete',
          exactVolume: false,
          status: 'ok',
        },
        query: cleanQuery,
        suggestions: secondAttempt.suggestions,
        warning: null,
      };
    }

    return {
      source: {
        provider: 'yandex_suggest',
        type: 'autocomplete',
        exactVolume: false,
        status: 'empty',
      },
      query: cleanQuery,
      suggestions: [],
      warning:
        secondAttempt.warning ||
        firstAttempt.warning ||
        'Yandex Suggest returned no suggestions.',
    };
  } catch (error) {
    return {
      source: {
        provider: 'yandex_suggest',
        type: 'autocomplete',
        exactVolume: false,
        status: 'failed',
      },
      query: cleanQuery,
      suggestions: [],
      warning:
        error.name === 'AbortError'
          ? 'Yandex Suggest request timed out.'
          : `Yandex Suggest request failed: ${error.message}`,
    };
  }
};

module.exports = {
  getYandexSuggestions,
};