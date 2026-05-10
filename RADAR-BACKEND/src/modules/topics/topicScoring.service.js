const CATEGORY_BASELINES = {
  crypto: {
    clickability: 8.5,
    business: 5.5,
    competition: 8.5,
    risk: 'very high',
  },

  adult: {
    clickability: 8,
    business: 6,
    competition: 6,
    risk: 'high',
  },

  construction_materials: {
    clickability: 5.5,
    business: 8,
    competition: 5.5,
    risk: 'medium',
  },

  fashion: {
    clickability: 8,
    business: 6.5,
    competition: 8,
    risk: 'high',
  },

  local_services: {
    clickability: 6.5,
    business: 8,
    competition: 6,
    risk: 'medium',
  },

  energy: {
    clickability: 6.5,
    business: 7,
    competition: 7,
    risk: 'high',
  },

  consumer_utility: {
    clickability: 6,
    business: 6,
    competition: 5,
    risk: 'medium',
  },

  education_tools: {
    clickability: 4.5,
    business: 5,
    competition: 4.5,
    risk: 'low',
  },

  general: {
    clickability: 3,
    business: 3,
    competition: 4,
    risk: 'medium',
  },
};

const clampScore = value => {
  return Math.max(0, Math.min(10, Number(value.toFixed(2))));
};

const getRiskPenalty = risk => {
  if (risk === 'very high') return 2.5;
  if (risk === 'high') return 1.5;
  if (risk === 'medium') return 0.7;

  return 0.2;
};

const getDecision = topic => {
  if (topic.restrictions.includes('adult')) {
    return 'restricted';
  }

  if (topic.risk === 'very high' && topic.clickabilityScore >= 7) {
    return 'caution';
  }

  if (topic.opportunityScore >= 6.5) {
    return 'top opportunity';
  }

  if (topic.opportunityScore >= 4.5) {
    return 'investigate';
  }

  return 'low signal';
};

const buildReason = topic => {
  if (topic.category === 'crypto') {
    return 'High attention topic, but trust, regulation and competition risks are significant.';
  }

  if (topic.category === 'adult') {
    return 'Clickable topic, but adult restrictions create platform, ads and payment risk.';
  }

  if (topic.category === 'construction_materials') {
    return 'Less hype-driven, but commercially strong with B2B and purchase intent.';
  }

  if (topic.category === 'fashion') {
    return 'High consumer clickability, but competition is usually strong.';
  }

  if (topic.category === 'local_services') {
    return 'Strong local commercial intent. Validate city, urgency and competitor density.';
  }

  if (topic.category === 'energy') {
    return 'Commercially meaningful topic, but often broad and market-dependent.';
  }

  if (topic.category === 'consumer_utility') {
    return 'Broad utility topic. Needs a sharper angle to become a strong opportunity.';
  }

  if (topic.category === 'education_tools') {
    return 'Specific product/topic with moderate demand. Needs stronger intent or audience angle.';
  }

  return 'No strong category signal detected yet.';
};

const scoreTopic = classifiedTopic => {
  const baseline =
    CATEGORY_BASELINES[classifiedTopic.category] || CATEGORY_BASELINES.general;

  const restrictionPenalty = classifiedTopic.restrictions.length ? 1.5 : 0;
  const riskPenalty = getRiskPenalty(baseline.risk);

  const clickabilityScore = clampScore(baseline.clickability);
  const businessScore = clampScore(baseline.business);
  const competitionScore = clampScore(baseline.competition);

  const opportunityScore = clampScore(
    clickabilityScore * 0.38 +
      businessScore * 0.42 -
      competitionScore * 0.14 -
      riskPenalty -
      restrictionPenalty
  );

  const topic = {
    ...classifiedTopic,
    clickabilityScore,
    businessScore,
    competitionScore,
    opportunityScore,
    risk: baseline.risk,
  };

  return {
    ...topic,
    decision: getDecision(topic),
    reason: buildReason(topic),
  };
};

module.exports = {
  scoreTopic,
};