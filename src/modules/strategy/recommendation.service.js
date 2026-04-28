const { buildMvpHypothesis } = require('./mvp.service');
const { buildPositioning } = require('./positioning.service');
const { buildValidationQuestions } = require('./validation.service');
const { buildCompetitorChecklist } = require('./competitor.service');
const { buildDecision } = require('./decision.service');

const sortByScoreDesc = seeds =>
  [...seeds].sort((a, b) => b.scores.finalScore - a.scores.finalScore);

const getBestSeed = seeds => {
  if (!seeds.length) return null;

  return sortByScoreDesc(seeds)[0];
};

const getMarketByName = (markets, name) => {
  if (!markets || !markets.length || !name) return null;

  return markets.find(market => market.name === name) || null;
};

const getRejectedSeeds = seeds =>
  seeds
    .filter(seed => seed.verdict.label === 'avoid')
    .map(seed => ({
      value: seed.value,
      reason: seed.verdict.message,
      risk: seed.risk.level,
    }));

const buildSummaryLine = seed => {
  if (!seed) return 'No decision available.';

  if (seed.verdict.label === 'strong opportunity') {
    return 'Strong signal. Worth deeper validation and MVP planning.';
  }

  if (seed.verdict.label === 'needs validation') {
    return 'Promising idea. Validate before building.';
  }

  if (seed.verdict.label === 'weak opportunity') {
    return 'Do not build yet. Weak signal. Narrow the audience or find stronger pain.';
  }

  return 'Avoid. Very weak signal or unacceptable risk.';
};

const buildRecommendationReason = seed => {
  if (!seed) return 'No seed available for recommendation.';

  const hasMediumOrBetterOpportunity =
    seed.opportunity.level === 'medium' || seed.opportunity.level === 'high';

  const hasAcceptableRisk =
    seed.risk.level === 'low' || seed.risk.level === 'medium';

  if (hasMediumOrBetterOpportunity && hasAcceptableRisk) {
    return 'This seed has the best balance of opportunity and risk in the current report.';
  }

  if (hasMediumOrBetterOpportunity && !hasAcceptableRisk) {
    return 'This seed has opportunity signals, but risk is high. Validate carefully before building.';
  }

  return 'This is the best seed in the current report, but overall signal is still weak.';
};

const buildRecommendationAction = seed => {
  if (!seed) return 'Provide at least one valid seed.';

  if (seed.verdict.label === 'strong opportunity') {
    return 'Move this seed to deeper market and MVP analysis.';
  }

  if (seed.verdict.label === 'needs validation') {
    return 'Validate this idea with the target audience before building.';
  }

  if (seed.verdict.label === 'weak opportunity') {
    return 'Do not build yet. Look for a narrower audience, stronger pain, or better commercial intent.';
  }

  return 'Avoid this idea for now and prioritize stronger opportunities.';
};

const buildNextSteps = seed => {
  if (!seed) {
    return ['Submit at least one valid seed for analysis.'];
  }

  if (seed.verdict.label === 'strong opportunity') {
    return [
      'Define the exact target audience.',
      'Analyze direct competitors.',
      'Build a narrow MVP scope.',
      'Prepare a validation landing page.',
    ];
  }

  if (seed.verdict.label === 'needs validation') {
    return [
      'Define the target audience more precisely.',
      'Interview or survey at least 10 potential users.',
      'Check existing competitors and alternatives.',
      'Look for a narrower positioning before building.',
    ];
  }

  if (seed.verdict.label === 'weak opportunity') {
    return [
      'Do not build immediately.',
      'Search for a narrower audience segment.',
      'Look for stronger pain or commercial intent.',
      'Compare this idea with stronger alternatives.',
    ];
  }

  return [
    'Do not prioritize this idea.',
    'Remove it from the active shortlist.',
    'Focus on seeds with stronger opportunity and lower risk.',
  ];
};

const buildReportRecommendation = (seeds, markets = []) => {
  const bestSeed = getBestSeed(seeds);

  if (!bestSeed) {
    return {
      summaryLine: 'No decision available.',
      decision: buildDecision(null),
      bestMarket: null,
      bestMarketVerdict: null,
      bestMarketNote: null,
      bestSeed: null,
      verdict: null,
      opportunity: null,
      risk: null,
      reason: 'No analyzed seeds available.',
      action: 'Submit at least one seed for analysis.',
      nextSteps: buildNextSteps(null),
      positioning: buildPositioning(null),
      validationQuestions: buildValidationQuestions(null),
      competitorChecklist: buildCompetitorChecklist(null),
      mvp: buildMvpHypothesis(null),
      rejectedSeeds: [],
    };
  }

  const bestSeedMarket = getMarketByName(markets, bestSeed.niche);

  return {
    summaryLine: buildSummaryLine(bestSeed),
    decision: buildDecision(bestSeed),

    bestMarket: bestSeed.niche,
    bestMarketVerdict: bestSeedMarket?.verdict || null,
    bestMarketNote: bestSeedMarket?.note || null,

    bestSeed: bestSeed.value,
    verdict: bestSeed.verdict.label,
    opportunity: bestSeed.opportunity.level,
    risk: bestSeed.risk.level,
    reason: buildRecommendationReason(bestSeed),
    action: buildRecommendationAction(bestSeed),
    nextSteps: buildNextSteps(bestSeed),
    positioning: buildPositioning(bestSeed),
    validationQuestions: buildValidationQuestions(bestSeed),
    competitorChecklist: buildCompetitorChecklist(bestSeed),
    mvp: buildMvpHypothesis(bestSeed),
    rejectedSeeds: getRejectedSeeds(seeds),
  };
};

module.exports = {
  buildReportRecommendation,
};