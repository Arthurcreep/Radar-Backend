const TRANSLATION_MAP = {
  water: ['water', 'вода', 'воды', 'водный'],
  cement: ['cement', 'цемент', 'цемента', 'цементный', 'м500', 'м400'],
  dress: ['dress', 'платье', 'платья', 'платьев'],
  crypto: ['crypto', 'крипта', 'криптовалюта', 'крипто', 'bitcoin', 'btc', 'биткоин'],
  oil: ['oil', 'нефть', 'нефтяной', 'масло'],
  plumbing: ['plumbing', 'plumber', 'сантехник', 'сантехника', 'трубы'],
};

const GLOBAL_NOISE_MARKERS = [
  'wordwall',
  'spotlight',
  'casino',
  'казино',
  'зеркало',
  'torrent',
  'торрент',
  'скачать бесплатно',
  'apk',
  'mod apk',
];

const DOMAIN_MARKERS = [
  '.ru',
  '.com',
  '.net',
  '.io',
  '.org',
  '.xyz',
];

const COMMERCIAL_MARKERS = [
  'купить',
  'цена',
  'стоимость',
  'заказать',
  'доставка',
  'оптом',
  'магазин',
  'москва',
  'спб',
  'рядом',
  'ремонт',
  'услуги',
  'buy',
  'price',
  'cost',
  'shop',
  'delivery',
  'near me',
  'repair',
  'service',
];

const PROBLEM_MARKERS = [
  'как',
  'почему',
  'ошибка',
  'проблема',
  'безопасность',
  'отзывы',
  'обзор',
  'сравнение',
  'лучший',
  'рейтинг',
  'how',
  'why',
  'problem',
  'error',
  'review',
  'best',
  'compare',
];

/**
 * These prefixes often create merged brand/noise entities:
 * waterfox, cryptopro, cryptotab, dressing, dresser, etc.
 *
 * Do NOT include oil here:
 * oil price, oil цена, oil price chart are valid market-data queries.
 */
const MERGED_BRAND_PREFIXES = [
  'crypto',
  'water',
  'dress',
];

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[ё]/g, 'е')
    .replace(/\s+/g, ' ');

const escapeRegExp = value =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasAnyMarker = (value, markers) =>
  markers.some(marker => value.includes(marker.toLowerCase()));

const getTopicAliases = topic => {
  const normalizedTopic = normalize(topic);

  return TRANSLATION_MAP[normalizedTopic] || [normalizedTopic];
};

const getAllAliases = ({ topic, normalizedTopic }) => {
  const aliases = [
    ...getTopicAliases(topic),
    ...getTopicAliases(normalizedTopic),
  ]
    .map(normalize)
    .filter(Boolean);

  return [...new Set(aliases)];
};

const containsAliasWithWordBoundary = ({ keyword, topic, normalizedTopic }) => {
  const value = normalize(keyword);
  const aliases = getAllAliases({ topic, normalizedTopic });

  return aliases.some(alias => {
    if (!alias) return false;

    const pattern = new RegExp(
      `(^|[^a-zа-я0-9])${escapeRegExp(alias)}([^a-zа-я0-9]|$)`,
      'i'
    );

    return pattern.test(value);
  });
};

const containsAliasAsMergedPrefix = ({ keyword, topic, normalizedTopic }) => {
  const rawValue = normalize(keyword);
  const compactValue = rawValue.replace(/\s+/g, '');
  const aliases = getAllAliases({ topic, normalizedTopic });

  return aliases.some(alias => {
    const cleanAlias = normalize(alias).replace(/\s+/g, '');

    if (!MERGED_BRAND_PREFIXES.includes(cleanAlias)) {
      return false;
    }

    if (!compactValue.startsWith(cleanAlias)) {
      return false;
    }

    /**
     * If the keyword starts with a clean alias followed by a separator,
     * it is a normal phrase:
     * "crypto wallet", "water price", "dress купить".
     */
    const afterAlias = rawValue.slice(cleanAlias.length);

    if (
      afterAlias.startsWith(' ') ||
      afterAlias.startsWith('-') ||
      afterAlias.startsWith('_')
    ) {
      return false;
    }

    /**
     * If extra part is long enough and glued to the alias,
     * it is likely a brand/entity/noise:
     * waterfox, cryptopro, cryptotab, dressing.
     */
    return compactValue.length > cleanAlias.length + 2;
  });
};

const isDomainLike = keyword => {
  const value = normalize(keyword);

  return hasAnyMarker(value, DOMAIN_MARKERS);
};

const isGlobalNoise = keyword => {
  const value = normalize(keyword);

  return hasAnyMarker(value, GLOBAL_NOISE_MARKERS);
};

const isCommercial = keyword => {
  const value = normalize(keyword);

  return hasAnyMarker(value, COMMERCIAL_MARKERS);
};

const isProblemOrResearch = keyword => {
  const value = normalize(keyword);

  return hasAnyMarker(value, PROBLEM_MARKERS);
};

const isSingleGenericTopic = ({ keyword, topic, normalizedTopic }) => {
  const value = normalize(keyword);
  const aliases = getAllAliases({ topic, normalizedTopic });

  return aliases.some(alias => value === alias);
};

const calculateRelevanceScore = ({ keyword, topic, normalizedTopic, category }) => {
  let score = 0;

  const hasBoundaryAlias = containsAliasWithWordBoundary({
    keyword,
    topic,
    normalizedTopic,
  });

  const hasMergedBrandPrefix = containsAliasAsMergedPrefix({
    keyword,
    topic,
    normalizedTopic,
  });

  if (hasBoundaryAlias) {
    score += 6;
  }

  if (hasMergedBrandPrefix) {
    score -= 4;
  }

  if (isSingleGenericTopic({ keyword, topic, normalizedTopic })) {
    score -= 2;
  }

  if (isCommercial(keyword)) {
    score += 2.5;
  }

  if (isProblemOrResearch(keyword)) {
    score += 1.5;
  }

  if (category === 'crypto' && normalize(keyword).includes('casino')) {
    score -= 6;
  }

  if (isDomainLike(keyword)) {
    score -= 3;
  }

  if (isGlobalNoise(keyword)) {
    score -= 6;
  }

  return Math.max(0, Math.min(10, Number(score.toFixed(2))));
};

const explainRelevance = ({ keyword, topic, normalizedTopic, category }) => {
  if (isGlobalNoise(keyword)) {
    return 'Removed: global noise marker.';
  }

  if (category === 'crypto' && normalize(keyword).includes('casino')) {
    return 'Removed: casino-related result is not relevant to crypto market research.';
  }

  if (containsAliasAsMergedPrefix({ keyword, topic, normalizedTopic })) {
    return 'Removed: likely merged brand or unrelated entity, not a clean topic phrase.';
  }

  if (
    !containsAliasWithWordBoundary({
      keyword,
      topic,
      normalizedTopic,
    })
  ) {
    return 'Removed: suggestion does not contain the topic as a standalone word or known synonym.';
  }

  if (isSingleGenericTopic({ keyword, topic, normalizedTopic })) {
    return 'Weak: only the raw topic without useful modifier.';
  }

  if (isCommercial(keyword)) {
    return 'Relevant: contains topic and commercial intent.';
  }

  if (isProblemOrResearch(keyword)) {
    return 'Relevant: contains topic and research/problem intent.';
  }

  return 'Relevant: contains topic or known synonym.';
};

const applyRelevance = ({ items, topic, normalizedTopic, category }) => {
  const accepted = [];
  const rejected = [];

  items.forEach(item => {
    const relevanceScore = calculateRelevanceScore({
      keyword: item.keyword,
      topic,
      normalizedTopic,
      category,
    });

    const relevanceReason = explainRelevance({
      keyword: item.keyword,
      topic,
      normalizedTopic,
      category,
    });

    const withRelevance = {
      ...item,
      relevanceScore,
      relevanceReason,
    };

    const hasBoundaryAlias = containsAliasWithWordBoundary({
      keyword: item.keyword,
      topic,
      normalizedTopic,
    });

    const isMergedBrand = containsAliasAsMergedPrefix({
      keyword: item.keyword,
      topic,
      normalizedTopic,
    });

    const isRelevant =
      relevanceScore >= 5 &&
      hasBoundaryAlias &&
      !isMergedBrand &&
      !isGlobalNoise(item.keyword);

    if (isRelevant) {
      accepted.push({
        ...withRelevance,
        isRelevant: true,
      });
    } else {
      rejected.push({
        ...withRelevance,
        isRelevant: false,
      });
    }
  });

  return {
    accepted,
    rejected,
  };
};

module.exports = {
  applyRelevance,
  calculateRelevanceScore,
};