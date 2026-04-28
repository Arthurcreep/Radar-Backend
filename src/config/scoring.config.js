const DEFAULT_SCORING_WEIGHTS = {
  demand: 0.22,
  commercial: 0.18,
  pain: 0.25,
  audience: 0.2,
  competition: -0.12,
};

const NICHE_SCORING_WEIGHTS = {
  crypto: {
    demand: 0.18,
    commercial: 0.12,
    pain: 0.18,
    audience: 0.1,
    competition: -0.4,
  },

  finance: {
    demand: 0.22,
    commercial: 0.22,
    pain: 0.28,
    audience: 0.18,
    competition: -0.1,
  },

  health: {
    demand: 0.18,
    commercial: 0.12,
    pain: 0.36,
    audience: 0.28,
    competition: -0.08,
  },

  education: {
    demand: 0.24,
    commercial: 0.14,
    pain: 0.22,
    audience: 0.3,
    competition: -0.08,
  },

  productivity: {
    demand: 0.2,
    commercial: 0.22,
    pain: 0.24,
    audience: 0.22,
    competition: -0.1,
  },
};

const getScoringWeights = niche =>
  NICHE_SCORING_WEIGHTS[niche] || DEFAULT_SCORING_WEIGHTS;

module.exports = {
  DEFAULT_SCORING_WEIGHTS,
  NICHE_SCORING_WEIGHTS,
  getScoringWeights,
};