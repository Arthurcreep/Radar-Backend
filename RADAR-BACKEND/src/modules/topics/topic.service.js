const ApiError = require('../../utils/ApiError');

const { classifyTopic } = require('./topic.classifier');
const { scoreTopic } = require('./topicScoring.service');
const { expandTopic } = require('./topicExpansion.service');
const { buildTopicInsight } = require('./topicInsight.service');

const splitTextToTopics = text =>
  text
    .split(/[\n,;]+/)
    .map(item => item.trim())
    .filter(Boolean);

const validateTopicsPayload = payload => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'Request body must be an object');
  }

  if (!Array.isArray(payload.topics) && typeof payload.text !== 'string') {
    throw new ApiError(400, 'Provide topics array or text string');
  }

  const topics = Array.isArray(payload.topics)
    ? payload.topics
    : splitTextToTopics(payload.text);

  if (!topics.length) {
    throw new ApiError(400, 'topics must not be empty');
  }

  if (topics.length > 30) {
    throw new ApiError(400, 'topics must not exceed 30 items');
  }

  topics.forEach((topic, index) => {
    if (typeof topic !== 'string') {
      throw new ApiError(400, `topics[${index}] must be a string`);
    }

    if (!topic.trim()) {
      throw new ApiError(400, `topics[${index}] must not be empty`);
    }

    if (topic.trim().length > 80) {
      throw new ApiError(400, `topics[${index}] must not exceed 80 characters`);
    }
  });

  return topics.map(topic => topic.trim());
};

const validateExpandPayload = payload => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'Request body must be an object');
  }

  if (!payload.topic || typeof payload.topic !== 'string') {
    throw new ApiError(400, 'topic is required and must be a string');
  }

  if (!payload.topic.trim()) {
    throw new ApiError(400, 'topic must not be empty');
  }

  if (payload.topic.trim().length > 80) {
    throw new ApiError(400, 'topic must not exceed 80 characters');
  }

  return payload.topic.trim();
};

const getRiskRank = risk => {
  const ranks = {
    low: 1,
    medium: 2,
    high: 3,
    'very high': 4,
  };

  return ranks[risk] || 0;
};

const average = values => {
  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);

  return Number((total / values.length).toFixed(2));
};

const buildRealTopicDecision = topic => {
  if (topic.restrictions.includes('adult')) {
    return 'restricted';
  }

  if (topic.source.status !== 'ok') {
    return 'no data';
  }

  if (topic.opportunityScore >= 6.5) {
    return 'top opportunity';
  }

  if (topic.opportunityScore >= 4.5) {
    return 'investigate';
  }

  if (topic.clickabilityScore >= 6 && topic.risk === 'very high') {
    return 'caution';
  }

  return 'low signal';
};

const buildRealTopicReason = topic => {
  if (topic.source.status !== 'ok') {
    return 'No real suggestion data was returned by the provider.';
  }

  if (topic.restrictions.includes('adult')) {
    return 'Search demand exists, but this topic has adult/platform/payment restrictions.';
  }

  if (topic.decision === 'top opportunity') {
    return 'Real suggestions show strong opportunity signals across clickability and business intent.';
  }

  if (topic.decision === 'investigate') {
    return 'Real suggestions show enough signal to explore this topic further.';
  }

  if (topic.decision === 'caution') {
    return 'The topic is clickable, but risk and competition are high.';
  }

  return 'Real suggestions exist, but the topic needs a sharper commercial or problem-driven angle.';
};

const buildTopicFromExpansion = expansion => {
  const classifiedFallback = scoreTopic(classifyTopic(expansion.topic));
  const combinations = expansion.combinations || [];
  const topCombinations = combinations.slice(0, 5);

  const clickabilityScore = average(
    topCombinations.map(item => item.clickabilityScore)
  );

  const businessScore = average(
    topCombinations.map(item => item.businessScore)
  );

  const opportunityScore = average(
    topCombinations.map(item => item.opportunityScore)
  );

  const highestRisk = combinations.reduce(
    (currentRisk, item) =>
      getRiskRank(item.risk) > getRiskRank(currentRisk)
        ? item.risk
        : currentRisk,
    classifiedFallback.risk
  );

  const topic = {
    original: expansion.topic,
    normalized: expansion.normalized,
    category: expansion.category,
    topicType: classifiedFallback.topicType,
    monetizationType: classifiedFallback.monetizationType,
    restrictions: expansion.restrictions,

    source: expansion.source,
    warning: expansion.warning,

    suggestionsCount: expansion.totalCombinations || 0,
    rawSuggestionsCount: expansion.totalRawCombinations || 0,
    relevantSuggestionsCount: expansion.totalRelevantCombinations || 0,
    rejectedAsNoiseCount: expansion.totalRejectedAsNoise || 0,

    topSuggestion: combinations[0]?.keyword || null,

    clickabilityScore:
      expansion.source.status === 'ok' && combinations.length
        ? clickabilityScore
        : classifiedFallback.clickabilityScore,

    businessScore:
      expansion.source.status === 'ok' && combinations.length
        ? businessScore
        : classifiedFallback.businessScore,

    competitionScore: classifiedFallback.competitionScore,

    opportunityScore:
      expansion.source.status === 'ok' && combinations.length
        ? opportunityScore
        : classifiedFallback.opportunityScore,

    risk: highestRisk,

    topClusters: (expansion.clusters || []).slice(0, 3).map(cluster => ({
      intent: cluster.intent,
      label: cluster.label,
      count: cluster.summary.count,
      averageOpportunity: cluster.summary.averageOpportunity,
      topKeyword: cluster.summary.topKeyword,
    })),

    rejectedSamples: expansion.rejectedSamples || [],
  };

  const decision = buildRealTopicDecision(topic);

  const topicWithDecision = {
    ...topic,
    decision,
    reason: buildRealTopicReason({
      ...topic,
      decision,
    }),
  };

  const insight = buildTopicInsight(topicWithDecision);

  return {
    ...topicWithDecision,
    ...insight,
  };
};

const buildSummary = topics => {
  const topicsWithData = topics.filter(topic => topic.source?.status === 'ok');

  const sortedByOpportunity = [...topics].sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );

  const sortedByClickability = [...topics].sort(
    (a, b) => b.clickabilityScore - a.clickabilityScore
  );

  const sortedByBusiness = [...topics].sort(
    (a, b) => b.businessScore - a.businessScore
  );

  const sortedByRisk = [...topics].sort(
    (a, b) => getRiskRank(b.risk) - getRiskRank(a.risk)
  );

  const restrictedTopics = topics.filter(
    topic => topic.decision === 'restricted'
  );

  const totalRawSuggestions = topics.reduce(
    (sum, topic) => sum + (topic.rawSuggestionsCount || 0),
    0
  );

  const totalCleanSuggestions = topics.reduce(
    (sum, topic) => sum + (topic.suggestionsCount || 0),
    0
  );

  const totalRejectedAsNoise = topics.reduce(
    (sum, topic) => sum + (topic.rejectedAsNoiseCount || 0),
    0
  );

  return {
    totalTopics: topics.length,
    topicsWithRealData: topicsWithData.length,
    bestTopic: sortedByOpportunity[0]?.original || null,
    mostClickableTopic: sortedByClickability[0]?.original || null,
    bestBusinessTopic: sortedByBusiness[0]?.original || null,
    highestRiskTopic: sortedByRisk[0]?.original || null,
    restrictedCount: restrictedTopics.length,

    totalRawSuggestions,
    totalCleanSuggestions,
    totalRejectedAsNoise,

    dataSource: 'yandex_suggest',
    exactVolume: false,
    note: 'Scores are based on real Yandex autocomplete suggestions, not exact search volume.',
  };
};

const analyzeTopics = async payload => {
  const rawTopics = validateTopicsPayload(payload);
  const analyzedTopics = [];

  for (const topic of rawTopics) {
    const expansion = await expandTopic(topic);
    analyzedTopics.push(buildTopicFromExpansion(expansion));
  }

  const topics = analyzedTopics.sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );

  return {
    summary: buildSummary(topics),
    topics,
  };
};

const expandSingleTopic = async payload => {
  const topic = validateExpandPayload(payload);
  const expansion = await expandTopic(topic);
  const topicSummary = buildTopicFromExpansion(expansion);

  return {
    ...expansion,
    insightSummary: topicSummary.insightSummary,
    mainOpportunity: topicSummary.mainOpportunity,
    mainRisk: topicSummary.mainRisk,
    recommendedNextStep: topicSummary.recommendedNextStep,
    diagnostics: topicSummary.diagnostics,
  };
};

module.exports = {
  analyzeTopics,
  expandSingleTopic,
};