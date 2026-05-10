const INTENT_GROUPS = [
  {
    intent: 'purchase',
    label: 'Purchase / buying intent',
    keywords: [
      'купить',
      'цена',
      'стоимость',
      'заказать',
      'доставка',
      'оптом',
      'магазин',
      'buy',
      'price',
      'cost',
      'delivery',
      'shop',
      'wholesale',
    ],
  },
  {
    intent: 'local',
    label: 'Local service intent',
    keywords: [
      'рядом',
      'поблизости',
      'адрес',
      'район',
      'город',
      'москва',
      'спб',
      'санкт-петербург',
      'ростов',
      'краснодар',
      'near me',
      'nearby',
      'local',
    ],
  },
  {
    intent: 'service',
    label: 'Service / lead intent',
    keywords: [
      'услуги',
      'вызвать',
      'срочно',
      'мастер',
      'специалист',
      'ремонт',
      'под ключ',
      'service',
      'repair',
      'emergency',
    ],
  },
  {
    intent: 'education',
    label: 'Education / beginner intent',
    keywords: [
      'как',
      'для начинающих',
      'обучение',
      'курс',
      'гайд',
      'инструкция',
      'что такое',
      'с нуля',
      'how',
      'beginner',
      'course',
      'guide',
      'learn',
      'tutorial',
    ],
  },
  {
    intent: 'device_use_case',
    label: 'Device / use-case intent',
    keywords: [
      'с телефона',
      'на телефоне',
      'телефон',
      'смартфон',
      'андроид',
      'android',
      'iphone',
      'ios',
      'приложение',
      'app',
      'mobile',
    ],
  },
  {
    intent: 'review',
    label: 'Review / comparison intent',
    keywords: [
      'отзывы',
      'обзор',
      'лучший',
      'топ',
      'сравнение',
      'рейтинг',
      'review',
      'best',
      'top',
      'compare',
      'rating',
    ],
  },
  {
    intent: 'problem',
    label: 'Problem / pain intent',
    keywords: [
      'ошибка',
      'проблема',
      'проблемы',
      'не работает',
      'безопасность',
      'налоги',
      'болит',
      'error',
      'problem',
      'repair',
      'security',
      'tax',
    ],
  },
  {
    intent: 'news',
    label: 'News / attention intent',
    keywords: [
      'новости',
      'сегодня',
      'прогноз',
      'курс',
      'news',
      'today',
      'forecast',
    ],
  },
];

const inferIntent = keyword => {
  const value = String(keyword || '').toLowerCase();

  const matchedGroup = INTENT_GROUPS.find(group =>
    group.keywords.some(marker => value.includes(marker.toLowerCase()))
  );

  return matchedGroup
    ? {
        intent: matchedGroup.intent,
        label: matchedGroup.label,
      }
    : {
        intent: 'general',
        label: 'General search intent',
      };
};

const getIntentBusinessScore = intent => {
  if (intent === 'purchase') return 8.5;
  if (intent === 'local') return 8;
  if (intent === 'service') return 8;
  if (intent === 'problem') return 7.5;
  if (intent === 'review') return 6.5;
  if (intent === 'device_use_case') return 6;
  if (intent === 'education') return 5.5;
  if (intent === 'news') return 4.5;

  return 4.5;
};

const getCategoryRisk = category => {
  if (category === 'crypto') return 'very high';
  if (category === 'adult') return 'high';
  if (category === 'fashion') return 'high';

  return 'medium';
};

const getRiskPenalty = risk => {
  if (risk === 'very high') return 2;
  if (risk === 'high') return 1;
  if (risk === 'medium') return 0.4;

  return 0;
};

const clampScore = value => Math.max(0, Math.min(10, Number(value.toFixed(2))));

const buildSuggestionReason = intent => {
  if (intent === 'purchase') {
    return 'Purchase intent. Good signal for ecommerce, ads or lead generation.';
  }

  if (intent === 'local') {
    return 'Local intent. Good signal for service businesses and lead generation.';
  }

  if (intent === 'service') {
    return 'Service intent. Good signal for lead generation or service business.';
  }

  if (intent === 'problem') {
    return 'Problem-driven query. Good signal for useful products or services.';
  }

  if (intent === 'review') {
    return 'Review intent. Useful for comparison pages, affiliate, content or product research.';
  }

  if (intent === 'device_use_case') {
    return 'Device/use-case intent. Useful for guides, apps, onboarding or product workflows.';
  }

  if (intent === 'education') {
    return 'Educational intent. Useful for content, guides, courses or beginner products.';
  }

  if (intent === 'news') {
    return 'Attention-driven query. Good for content, but weaker commercial signal.';
  }

  return 'General search intent. Needs sharper validation before product decisions.';
};

const scoreSuggestion = ({ suggestion, category }) => {
  const { intent, label } = inferIntent(suggestion.keyword);

  const businessScore = getIntentBusinessScore(intent);
  const positionScore = Math.max(1, 11 - suggestion.position);
  const risk = getCategoryRisk(category);
  const riskPenalty = getRiskPenalty(risk);

  const clickabilityScore = clampScore(positionScore * 0.75 + businessScore * 0.25);
  const opportunityScore = clampScore(
    clickabilityScore * 0.45 + businessScore * 0.45 - riskPenalty
  );

  return {
    keyword: suggestion.keyword,
    position: suggestion.position,
    sourceQuery: suggestion.sourceQuery,
    intent,
    intentLabel: label,
    clickabilityScore,
    businessScore,
    opportunityScore,
    risk,
    reason: buildSuggestionReason(intent),
  };
};

const summarizeCluster = items => {
  if (!items.length) {
    return {
      count: 0,
      averageClickability: 0,
      averageBusiness: 0,
      averageOpportunity: 0,
      topKeyword: null,
    };
  }

  const sum = items.reduce(
    (acc, item) => ({
      clickability: acc.clickability + item.clickabilityScore,
      business: acc.business + item.businessScore,
      opportunity: acc.opportunity + item.opportunityScore,
    }),
    {
      clickability: 0,
      business: 0,
      opportunity: 0,
    }
  );

  return {
    count: items.length,
    averageClickability: Number((sum.clickability / items.length).toFixed(2)),
    averageBusiness: Number((sum.business / items.length).toFixed(2)),
    averageOpportunity: Number((sum.opportunity / items.length).toFixed(2)),
    topKeyword: items[0]?.keyword || null,
  };
};

const buildClusters = scoredSuggestions => {
  const groups = scoredSuggestions.reduce((acc, item) => {
    if (!acc[item.intent]) {
      acc[item.intent] = {
        intent: item.intent,
        label: item.intentLabel,
        items: [],
      };
    }

    acc[item.intent].items.push(item);

    return acc;
  }, {});

  return Object.values(groups)
    .map(group => {
      const sortedItems = [...group.items].sort(
        (a, b) => b.opportunityScore - a.opportunityScore
      );

      return {
        intent: group.intent,
        label: group.label,
        summary: summarizeCluster(sortedItems),
        items: sortedItems,
      };
    })
    .sort(
      (a, b) =>
        b.summary.averageOpportunity - a.summary.averageOpportunity
    );
};

module.exports = {
  scoreSuggestion,
  buildClusters,
};