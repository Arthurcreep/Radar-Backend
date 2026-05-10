const { classifyTopic } = require('./topic.classifier');
const { getDeepSuggestions } = require('./topicDeepExpansion.service');
const {
  scoreSuggestion,
  buildClusters,
} = require('./topicCluster.service');
const { applyRelevance } = require('./topicRelevance.service');
const { applyQuality } = require('./topicQuality.service');

const expandTopic = async topic => {
  const classified = classifyTopic(topic);

  const providerResult = await getDeepSuggestions({
    topic: classified.original,
    category: classified.category,
  });

  const rawCombinations = providerResult.suggestions
    .map(suggestion =>
      scoreSuggestion({
        suggestion,
        category: classified.category,
      })
    )
    .sort((a, b) => b.opportunityScore - a.opportunityScore);

  const relevanceResult = applyRelevance({
    items: rawCombinations,
    topic: classified.original,
    normalizedTopic: classified.normalized,
    category: classified.category,
  });

  const combinations = applyQuality(relevanceResult.accepted)
    .sort((a, b) => {
      if (b.opportunityScore !== a.opportunityScore) {
        return b.opportunityScore - a.opportunityScore;
      }

      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      return b.qualityScore - a.qualityScore;
    });

  return {
    topic: classified.original,
    normalized: classified.normalized,
    category: classified.category,
    restrictions: classified.restrictions,

    source: providerResult.source,
    warning: providerResult.warning,

    queries: providerResult.queries,
    providerResults: providerResult.providerResults,

    totalRawCombinations: rawCombinations.length,
    totalRelevantCombinations: relevanceResult.accepted.length,
    totalRejectedAsNoise: relevanceResult.rejected.length,
    totalCombinations: combinations.length,

    rejectedSamples: relevanceResult.rejected.slice(0, 10).map(item => ({
      keyword: item.keyword,
      relevanceScore: item.relevanceScore,
      reason: item.relevanceReason,
    })),

    combinations,
    clusters: buildClusters(combinations),
  };
};

module.exports = {
  expandTopic,
};