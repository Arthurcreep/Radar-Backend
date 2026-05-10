const getDefaultFeatures = seed => [
  `Core workflow for ${seed.value}`,
  'Simple user onboarding',
  'Basic dashboard',
  'Manual data input',
];

const getFinanceFeatures = seed => [
  'Manual expense input',
  'Category-based tracking',
  'Weekly financial summary',
  'Simple budget alerts',
];

const getFeaturesByNiche = seed => {
  if (seed.niche === 'finance') return getFinanceFeatures(seed);

  return getDefaultFeatures(seed);
};

const buildMvpHypothesis = seed => {
  if (!seed) {
    return {
      hypothesis: 'No MVP hypothesis available.',
      features: [],
      validationGoal: 'Submit a valid seed first.',
    };
  }

  if (seed.verdict.label === 'avoid') {
    return {
      hypothesis: `Do not build an MVP for "${seed.value}".`,
      features: [],
      validationGoal: 'Find a stronger opportunity before building.',
    };
  }

  if (seed.verdict.label === 'weak opportunity') {
    return {
      hypothesis: `Do not build an MVP for "${seed.value}" yet. First, find a narrower audience or stronger pain angle.`,
      features: [],
      validationGoal: 'Identify a sharper segment before defining MVP features.',
    };
  }

  return {
    hypothesis: `A narrow ${seed.niche} product focused on "${seed.value}" may be worth validating before building.`,
    features: getFeaturesByNiche(seed),
    validationGoal: 'Validate that at least 10 target users have this problem and would try a simple MVP.',
  };
};

module.exports = {
  buildMvpHypothesis,
};