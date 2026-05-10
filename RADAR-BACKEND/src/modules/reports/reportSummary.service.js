const calcAverageScore = seeds => {
  if (!seeds.length) return 0;

  const total = seeds.reduce((sum, seed) => sum + seed.scores.finalScore, 0);

  return Number((total / seeds.length).toFixed(2));
};

const getBestSeed = seeds => {
  if (!seeds.length) return null;

  return [...seeds].sort((a, b) => b.scores.finalScore - a.scores.finalScore)[0].value;
};

const countByVerdict = (seeds, label) =>
  seeds.filter(seed => seed.verdict.label === label).length;

const buildReportSummary = seeds => ({
  totalSeeds: seeds.length,
  bestSeed: getBestSeed(seeds),
  averageScore: calcAverageScore(seeds),
  strongCount: countByVerdict(seeds, 'strong opportunity'),
  needsValidationCount: countByVerdict(seeds, 'needs validation'),
  weakCount: countByVerdict(seeds, 'weak opportunity'),
  avoidCount: countByVerdict(seeds, 'avoid'),
});

module.exports = {
  buildReportSummary,
};