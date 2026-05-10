const BAD_KEYWORDS = [
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

const LOW_VALUE_MARKERS = [
  'codes',
  'code',
  'читы',
  'cheats',
  'game',
  'игра',
  'roblox',
  'wordwall',
  'spotlight',
  'browser plug-in',
  'browser plugin',
  'plug-in',
  'plugin',
  'перевод',
  'translate',
  'скачать',
  'download',
  'форум',
  'forum',
];

const TOURISM_NOISE_MARKERS = [
  'resort',
  'spa',
  'hotel',
  'отель',
  'тур',
  'турция',
  'египет',
];

const STRONG_COMMERCIAL_MARKERS = [
  'купить',
  'цена',
  'стоимость',
  'заказать',
  'доставка',
  'оптом',
  'магазин',
  'москва',
  'спб',
  'buy',
  'price',
  'cost',
  'delivery',
  'shop',
  'wholesale',
];

const STRONG_SERVICE_MARKERS = [
  'ремонт',
  'услуги',
  'вызвать',
  'срочно',
  'рядом',
  'repair',
  'service',
  'near me',
  'emergency',
];

const RESEARCH_MARKERS = [
  'отзывы',
  'обзор',
  'сравнение',
  'лучший',
  'рейтинг',
  'review',
  'best',
  'compare',
  'rating',
];

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .trim();

const hasAnyMarker = (keyword, markers) => {
  const value = normalize(keyword);

  return markers.some(marker => value.includes(marker));
};

const isDomainLike = keyword => {
  return hasAnyMarker(keyword, DOMAIN_MARKERS);
};

const containsBadKeyword = keyword => {
  return hasAnyMarker(keyword, BAD_KEYWORDS);
};

const containsLowValueMarker = keyword => {
  return hasAnyMarker(keyword, LOW_VALUE_MARKERS);
};

const containsTourismNoise = keyword => {
  return hasAnyMarker(keyword, TOURISM_NOISE_MARKERS);
};

const containsStrongCommercialMarker = keyword => {
  return hasAnyMarker(keyword, STRONG_COMMERCIAL_MARKERS);
};

const containsStrongServiceMarker = keyword => {
  return hasAnyMarker(keyword, STRONG_SERVICE_MARKERS);
};

const containsResearchMarker = keyword => {
  return hasAnyMarker(keyword, RESEARCH_MARKERS);
};

const isWeakGenericIntent = item => {
  return item.intent === 'general' && !containsStrongCommercialMarker(item.keyword);
};

const isClearlyUseful = item => {
  return (
    containsStrongCommercialMarker(item.keyword) ||
    containsStrongServiceMarker(item.keyword) ||
    containsResearchMarker(item.keyword) ||
    item.intent === 'purchase' ||
    item.intent === 'problem' ||
    item.intent === 'local'
  );
};

const calculateQualityScore = item => {
  let score = 10;

  if (containsBadKeyword(item.keyword)) {
    score -= 6;
  }

  if (containsLowValueMarker(item.keyword)) {
    score -= 4;
  }

  if (containsTourismNoise(item.keyword)) {
    score -= 3;
  }

  if (isDomainLike(item.keyword)) {
    score -= 2.5;
  }

  if (item.keyword.length < 3) {
    score -= 3;
  }

  if (isWeakGenericIntent(item)) {
    score -= 2.5;
  }

  if (containsStrongCommercialMarker(item.keyword)) {
    score += 2;
  }

  if (containsStrongServiceMarker(item.keyword)) {
    score += 2;
  }

  if (containsResearchMarker(item.keyword)) {
    score += 1;
  }

  if (
    item.intent === 'purchase' ||
    item.intent === 'problem' ||
    item.intent === 'local'
  ) {
    score += 1.5;
  }

  if (typeof item.relevanceScore === 'number') {
    score = score * 0.6 + item.relevanceScore * 0.4;
  }

  return Math.max(0, Math.min(10, Number(score.toFixed(2))));
};

const getQualityReason = item => {
  if (containsBadKeyword(item.keyword)) {
    return 'Rejected: bad keyword marker.';
  }

  if (containsLowValueMarker(item.keyword)) {
    return 'Rejected: low-value/game/plugin/translation marker.';
  }

  if (containsTourismNoise(item.keyword)) {
    return 'Rejected: tourism/hotel/resort noise.';
  }

  if (isDomainLike(item.keyword)) {
    return 'Rejected: domain-like keyword.';
  }

  if (!isClearlyUseful(item) && item.intent === 'general') {
    return 'Rejected: generic intent without commercial, service or research signal.';
  }

  return 'Accepted: useful commercial, service, research or problem signal.';
};

const isUsefulSuggestion = item => {
  const qualityScore = calculateQualityScore(item);

  if (qualityScore < 5) {
    return false;
  }

  if (containsBadKeyword(item.keyword)) {
    return false;
  }

  if (containsLowValueMarker(item.keyword) && !containsStrongCommercialMarker(item.keyword)) {
    return false;
  }

  if (containsTourismNoise(item.keyword) && !containsStrongCommercialMarker(item.keyword)) {
    return false;
  }

  if (item.intent === 'general' && !isClearlyUseful(item)) {
    return false;
  }

  return true;
};

const applyQuality = suggestions => {
  return suggestions
    .map(item => ({
      ...item,
      qualityScore: calculateQualityScore(item),
      qualityReason: getQualityReason(item),
      isUseful: isUsefulSuggestion(item),
    }))
    .filter(item => item.isUseful);
};

module.exports = {
  applyQuality,
  calculateQualityScore,
};