const { getDemandSignal } = require('../data/demand.provider');
const { getCompetitionSignal } = require('../data/competition.provider');
const { getCommercialSignal } = require('../data/commercial.provider');
const { getPainSignal } = require('../data/pain.provider');
const { getAudienceSignal } = require('../data/audience.provider');

const { getScoringWeights } = require('../../config/scoring.config');

const clampScore = score => Math.max(0, Math.min(10, score));

const calcWeightedScore = (scores, weights) =>
  scores.demand * weights.demand +
  scores.commercial * weights.commercial +
  scores.pain * weights.pain +
  scores.audience * weights.audience +
  scores.competition * weights.competition;

const calcSeedScore = async seed => {
  const demandSignal = await getDemandSignal(seed);

  const demand = demandSignal.score;
  const competition = await getCompetitionSignal(seed);
  const commercial = await getCommercialSignal(seed);
  const pain = await getPainSignal(seed);
  const audience = await getAudienceSignal(seed);

  const weights = getScoringWeights(seed.niche);

  const rawScores = {
    demand,
    commercial,
    pain,
    audience,
    competition,
  };

  const rawFinalScore = calcWeightedScore(rawScores, weights);
  const finalScore = clampScore(rawFinalScore);

  return {
    ...rawScores,
    finalScore: Number(finalScore.toFixed(2)),
    weights,
    sources: [
      demandSignal.source,
      'heuristic-competition',
      'heuristic-commercial',
      'heuristic-pain',
      'heuristic-audience',
    ],
  };
};

const scoreSeeds = async seeds => {
  const result = [];

  for (const seed of seeds) {
    const scores = await calcSeedScore(seed);

    result.push({
      ...seed,
      scores,
    });
  }

  return result;
};

module.exports = {
  scoreSeeds,
};