const COMMON_AUDIENCE_ANGLES = [
  'for students',
  'for freelancers',
  'for beginners',
  'for small business owners',
];

const COMMON_PAIN_ANGLES = [
  'focused on saving time',
  'focused on reducing stress',
  'focused on tracking progress',
  'focused on avoiding mistakes',
];

const buildPositioning = seed => {
  if (!seed) {
    return {
      suggestion: 'No positioning available.',
      angles: [],
    };
  }

  if (seed.verdict.label === 'avoid') {
    return {
      suggestion: 'Do not position this idea yet. Replace it with a stronger opportunity.',
      angles: [],
    };
  }

  if (seed.verdict.label === 'weak opportunity') {
    return {
      suggestion: 'The idea is too broad. Narrow it by audience or pain before building.',
      angles: [
        ...COMMON_AUDIENCE_ANGLES,
        ...COMMON_PAIN_ANGLES,
      ],
    };
  }

  return {
    suggestion: 'Use narrow positioning before MVP validation.',
    angles: [
      `${seed.value} for a specific audience`,
      `${seed.value} for a painful recurring problem`,
      `${seed.value} with a simpler workflow`,
    ],
  };
};

module.exports = {
  buildPositioning,
};