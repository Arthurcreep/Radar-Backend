const BASE_CHECKLIST = [
  'Find 5 direct competitors',
  'Identify their core features',
  'Check their pricing model',
  'Read negative reviews',
  'Identify what users complain about',
  'Look for missing features or gaps',
];

const FINANCE_CHECKLIST = [
  'Check top budgeting apps in App Store',
  'Compare free vs paid features',
  'Analyze onboarding complexity',
  'Check retention signals in reviews',
];

const getChecklistByNiche = seed => {
  if (seed.niche === 'finance') {
    return [...BASE_CHECKLIST, ...FINANCE_CHECKLIST];
  }

  return BASE_CHECKLIST;
};

const buildCompetitorChecklist = seed => {
  if (!seed) {
    return ['Submit a valid idea to generate competitor checklist.'];
  }

  if (seed.verdict.label === 'avoid') {
    return [
      'This idea is too weak. Do not analyze competitors deeply.',
      'Focus on finding a stronger opportunity instead.',
    ];
  }

  return getChecklistByNiche(seed);
};

module.exports = {
  buildCompetitorChecklist,
};