const getClusterByIntent = (topic, intent) => {
  return (topic.topClusters || []).find(cluster => cluster.intent === intent);
};

const hasIntent = (topic, intent) => {
  return Boolean(getClusterByIntent(topic, intent));
};

const getCleanRatio = topic => {
  const raw = topic.rawSuggestionsCount || 0;
  const clean = topic.suggestionsCount || 0;

  if (!raw) return 0;

  return Number((clean / raw).toFixed(2));
};

const getNoiseRatio = topic => {
  const raw = topic.rawSuggestionsCount || 0;
  const rejected = topic.rejectedAsNoiseCount || 0;

  if (!raw) return 0;

  return Number((rejected / raw).toFixed(2));
};

const getMainOpportunity = topic => {
  if (topic.source?.status !== 'ok') {
    return 'Нет надежных данных для вывода. Сначала нужен рабочий источник подсказок.';
  }

  if (topic.decision === 'restricted') {
    return 'Тема может быть кликабельной, но требует отдельной стратегии из-за ограничений рекламы, платежей и площадок.';
  }

  if (hasIntent(topic, 'purchase')) {
    const cluster = getClusterByIntent(topic, 'purchase');

    return `Есть коммерческий спрос. Главный угол: "${cluster.topKeyword}".`;
  }

  if (hasIntent(topic, 'local')) {
    const cluster = getClusterByIntent(topic, 'local');

    return `Есть локальный спрос. Главный угол: "${cluster.topKeyword}".`;
  }

  if (hasIntent(topic, 'service')) {
    const cluster = getClusterByIntent(topic, 'service');

    return `Есть сервисный спрос. Главный угол: "${cluster.topKeyword}".`;
  }

  if (hasIntent(topic, 'problem')) {
    const cluster = getClusterByIntent(topic, 'problem');

    return `Есть проблемный спрос. Главный угол: "${cluster.topKeyword}".`;
  }

  if (hasIntent(topic, 'review')) {
    const cluster = getClusterByIntent(topic, 'review');

    return `Есть спрос на сравнение и отзывы. Главный угол: "${cluster.topKeyword}".`;
  }

  if (hasIntent(topic, 'device_use_case')) {
    const cluster = getClusterByIntent(topic, 'device_use_case');

    return `Есть сценарий использования через устройство/приложение. Главный угол: "${cluster.topKeyword}".`;
  }

  if (hasIntent(topic, 'education')) {
    const cluster = getClusterByIntent(topic, 'education');

    return `Есть обучающий интерес. Главный угол: "${cluster.topKeyword}".`;
  }

  if (topic.suggestionsCount > 0) {
    return 'Есть поисковые связки, но коммерческий или проблемный угол пока выражен слабо.';
  }

  return 'Чистых поисковых связок почти нет. Тему нужно переформулировать или проверять через другой источник.';
};

const getMainRisk = topic => {
  const cleanRatio = getCleanRatio(topic);
  const noiseRatio = getNoiseRatio(topic);

  if (topic.restrictions?.includes('adult')) {
    return 'Adult-ниша: высокий риск ограничений по рекламе, платежам, платформам и модерации.';
  }

  if (topic.risk === 'very high') {
    return 'Очень высокий риск: тема может быть хайповой, шумной, конкурентной или сложной для доверия.';
  }

  if (noiseRatio >= 0.5) {
    return 'Много мусора в подсказках. Тема может быть слишком широкой или забитой нерелевантными сущностями.';
  }

  if (cleanRatio <= 0.25) {
    return 'Мало чистых связок после фильтрации. Нужно искать более узкую формулировку.';
  }

  if (topic.competitionScore >= 8) {
    return 'Высокая конкуренция. Нужен узкий сегмент, иначе тема будет слишком дорогой для входа.';
  }

  if (topic.suggestionsCount < 5) {
    return 'Мало чистых связок. Сигнал есть, но он пока слабый.';
  }

  return 'Главный риск — не перепутать поисковый интерес с реальной готовностью платить.';
};

const getRecommendedNextStep = topic => {
  if (topic.source?.status !== 'ok') {
    return 'Проверь тему через другой источник или переформулируй запрос.';
  }

  if (topic.decision === 'restricted') {
    return 'Раскрыть тему отдельно и проверить ограничения по рекламе, платежам и площадкам.';
  }

  if (topic.risk === 'very high') {
    return 'Не строить сразу. Сначала искать узкие безопасные углы: обучение, налоги, безопасность, отзывы, сравнение.';
  }

  if (hasIntent(topic, 'purchase')) {
    return 'Раскрыть purchase-кластер и проверить связки “купить”, “цена”, “доставка”, “оптом”.';
  }

  if (hasIntent(topic, 'local')) {
    return 'Раскрыть локальные связки: район, город, “рядом”, “срочно”, “вызвать”, “ремонт”.';
  }

  if (hasIntent(topic, 'service')) {
    return 'Раскрыть сервисные связки: “услуги”, “ремонт”, “вызвать”, “срочно”, “под ключ”.';
  }

  if (hasIntent(topic, 'problem')) {
    return 'Раскрыть проблемные связки и понять, можно ли сделать сервис, калькулятор, лидогенерацию или контент.';
  }

  if (hasIntent(topic, 'review')) {
    return 'Проверить сравнения, отзывы и конкурентов. Это может подойти для affiliate, SEO или обзоров.';
  }

  if (hasIntent(topic, 'device_use_case')) {
    return 'Проверить сценарии по устройствам: телефон, приложение, Android, iPhone, мобильный workflow.';
  }

  if (hasIntent(topic, 'education')) {
    return 'Проверить обучающие связки: гайды, курсы, инструкции, “для начинающих”.';
  }

  return 'Сузить тему и повторить анализ с более конкретной формулировкой.';
};

const buildInsightSummary = topic => {
  const cleanRatio = getCleanRatio(topic);
  const noiseRatio = getNoiseRatio(topic);

  if (topic.source?.status !== 'ok') {
    return 'Данных от провайдера нет. Вывод по теме пока ненадежный.';
  }

  if (topic.decision === 'restricted') {
    return 'Тема относится к ограниченной нише. Ее можно анализировать, но нужно учитывать риски рекламы, платежей и площадок.';
  }

  if (topic.risk === 'very high' && topic.suggestionsCount <= 5) {
    return 'Тема выглядит шумной и рискованной: чистых связок мало, а риск высокий.';
  }

  if (topic.risk === 'very high') {
    return 'Тема привлекает внимание, но риск высокий. Нужна узкая и безопасная связка, иначе легко утонуть в шуме и конкуренции.';
  }

  if (hasIntent(topic, 'purchase') && topic.businessScore >= 7) {
    return 'Есть выраженный коммерческий сигнал. Тему стоит копать через покупательские связки.';
  }

  if (hasIntent(topic, 'local')) {
    return 'Есть локальный спрос. Тема может подходить под услуги, лидогенерацию или локальное SEO.';
  }

  if (hasIntent(topic, 'service')) {
    return 'Есть сервисный спрос. Тему можно проверять как услугу, лидогенерацию или нишевый сервис.';
  }

  if (hasIntent(topic, 'problem')) {
    return 'Есть проблемный спрос. Тему можно проверять через боль, решение и сервисный угол.';
  }

  if (noiseRatio >= 0.5) {
    return 'Тема дает много нерелевантного шума. Нужна более точная формулировка или другой источник данных.';
  }

  if (cleanRatio >= 0.6 && topic.suggestionsCount >= 10) {
    return 'Тема дает достаточно чистых поисковых связок. Можно раскрывать кластеры глубже.';
  }

  return 'Сигнал есть, но тема требует дополнительного уточнения перед продуктовым выводом.';
};

const buildTopicInsight = topic => {
  return {
    insightSummary: buildInsightSummary(topic),
    mainOpportunity: getMainOpportunity(topic),
    mainRisk: getMainRisk(topic),
    recommendedNextStep: getRecommendedNextStep(topic),
    diagnostics: {
      cleanRatio: getCleanRatio(topic),
      noiseRatio: getNoiseRatio(topic),
      hasPurchaseIntent: hasIntent(topic, 'purchase'),
      hasLocalIntent: hasIntent(topic, 'local'),
      hasServiceIntent: hasIntent(topic, 'service'),
      hasProblemIntent: hasIntent(topic, 'problem'),
      hasReviewIntent: hasIntent(topic, 'review'),
      hasDeviceUseCaseIntent: hasIntent(topic, 'device_use_case'),
      hasEducationIntent: hasIntent(topic, 'education'),
    },
  };
};

module.exports = {
  buildTopicInsight,
};