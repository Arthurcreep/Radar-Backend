const CATEGORY_RULES = [
  {
    category: 'crypto',
    topicType: 'finance_attention',
    monetizationType: 'content_product_finance',
    restrictions: [],
    keywords: [
      'crypto',
      'крипта',
      'крипто',
      'bitcoin',
      'биткоин',
      'btc',
      'ethereum',
      'эфир',
      'web3',
      'defi',
      'blockchain',
      'wallet',
      'кошелек',
      'кошелёк',
    ],
  },
  {
    category: 'adult',
    topicType: 'restricted_ecommerce',
    monetizationType: 'adult_ecommerce',
    restrictions: ['adult', 'ads_risk', 'payment_risk', 'platform_risk'],
    keywords: [
      'страпон',
      'strapon',
      'sex toy',
      'секс игрушка',
      'adult toy',
      'vibrator',
      'вибратор',
      'dildo',
      'дилдо',
    ],
  },
  {
    category: 'construction_materials',
    topicType: 'commodity_b2b',
    monetizationType: 'b2b_commerce',
    restrictions: [],
    keywords: [
      'цемент',
      'cement',
      'бетон',
      'concrete',
      'стекло',
      'glass',
      'кирпич',
      'brick',
      'арматура',
      'rebar',
      'стройматериалы',
      'construction materials',
    ],
  },
  {
    category: 'fashion',
    topicType: 'consumer_ecommerce',
    monetizationType: 'ecommerce',
    restrictions: [],
    keywords: [
      'платье',
      'dress',
      'одежда',
      'clothes',
      'fashion',
      'обувь',
      'shoes',
      'сумка',
      'bag',
      'юбка',
      'skirt',
    ],
  },
  {
    category: 'local_services',
    topicType: 'service_business',
    monetizationType: 'local_leads',
    restrictions: [],
    keywords: [
      'plumbing',
      'plumber',
      'сантехник',
      'сантехника',
      'ремонт труб',
      'roofing',
      'roofer',
      'electrician',
      'электрик',
      'hvac',
      'cleaning',
      'уборка',
      'moving',
      'переезд',
      'pest control',
      'landscaping',
    ],
  },
  {
    category: 'energy',
    topicType: 'commodity',
    monetizationType: 'b2b_market_data',
    restrictions: [],
    keywords: [
      'нефть',
      'oil',
      'газ',
      'gas',
      'energy',
      'энергия',
      'diesel',
      'бензин',
    ],
  },
  {
    category: 'consumer_utility',
    topicType: 'utility',
    monetizationType: 'consumer_or_local',
    restrictions: [],
    keywords: [
      'вода',
      'water',
      'filter',
      'фильтр',
      'bottle',
      'бутылка',
      'delivery',
      'доставка воды',
    ],
  },
  {
    category: 'education_tools',
    topicType: 'education_product',
    monetizationType: 'ecommerce_or_education',
    restrictions: [],
    keywords: [
      'циркуль',
      'compass',
      'линейка',
      'ruler',
      'школа',
      'school',
      'learning',
      'обучение',
      'курс',
      'course',
    ],
  },
];

const NORMALIZATION_MAP = {
  крипта: 'crypto',
  крипто: 'crypto',
  биткоин: 'bitcoin',
  кошелек: 'wallet',
  кошелёк: 'wallet',
  цемент: 'cement',
  бетон: 'concrete',
  стекло: 'glass',
  платье: 'dress',
  страпон: 'strapon',
  нефть: 'oil',
  вода: 'water',
  циркуль: 'compass',
  сантехник: 'plumber',
  сантехника: 'plumbing',
};

const normalizeTopic = topic => {
  const value = String(topic || '').trim().toLowerCase();

  return NORMALIZATION_MAP[value] || value;
};

const findMatchingRule = topic => {
  const value = String(topic || '').trim().toLowerCase();

  return CATEGORY_RULES.find(rule =>
    rule.keywords.some(keyword => value.includes(keyword.toLowerCase()))
  );
};

const classifyTopic = topic => {
  const original = String(topic || '').trim();
  const normalized = normalizeTopic(original);
  const rule = findMatchingRule(original) || findMatchingRule(normalized);

  if (!rule) {
    return {
      original,
      normalized,
      category: 'general',
      topicType: 'unknown',
      monetizationType: 'unknown',
      restrictions: [],
    };
  }

  return {
    original,
    normalized,
    category: rule.category,
    topicType: rule.topicType,
    monetizationType: rule.monetizationType,
    restrictions: rule.restrictions,
  };
};

module.exports = {
  classifyTopic,
};