const groupSeedsByNiche = seeds =>
  seeds.reduce((groups, seed) => {
    const niche = seed.niche;

    if (!groups[niche]) {
      groups[niche] = [];
    }

    groups[niche].push(seed);

    return groups;
  }, {});

const calcAverageScore = seeds => {
  if (!seeds.length) return 0;

  const total = seeds.reduce((sum, seed) => sum + seed.scores.finalScore, 0);

  return Number((total / seeds.length).toFixed(2));
};

const calcAverageConfidence = seeds => {
  if (!seeds.length) return 0;

  const total = seeds.reduce((sum, seed) => sum + seed.confidence.score, 0);

  return Number((total / seeds.length).toFixed(2));
};

const getBestSeed = seeds => {
  if (!seeds.length) return null;

  return [...seeds].sort((a, b) => b.scores.finalScore - a.scores.finalScore)[0];
};

const getMarketVerdict = market => {
  if (market.averageScore >= 6 && market.averageConfidence >= 0.65) {
    return 'strong market';
  }

  if (market.averageScore >= 4 && market.averageConfidence >= 0.5) {
    return 'best market to validate';
  }

  if (market.averageScore >= 2.5) {
    return 'weak market';
  }

  return 'avoid market';
};

const buildMarketNote = market => {
  if (
    market.verdict === 'weak market' &&
    market.strongestSeedVerdict === 'needs validation'
  ) {
    return 'Market is weak on average, but contains one seed worth validating.';
  }

  if (
    market.verdict === 'avoid market' &&
    market.strongestSeedVerdict === 'needs validation'
  ) {
    return 'Market looks risky overall, but one seed may still deserve validation.';
  }

  if (market.verdict === 'best market to validate') {
    return 'Market has enough signal to validate the strongest seed.';
  }

  if (market.verdict === 'strong market') {
    return 'Market has strong overall signal.';
  }

  return 'No strong market-level signal detected.';
};

const buildMarketSummary = seeds => {
  const grouped = groupSeedsByNiche(seeds);

  return Object.entries(grouped)
    .map(([name, marketSeeds]) => {
      const bestSeed = getBestSeed(marketSeeds);

      const market = {
        name,
        seedsCount: marketSeeds.length,
        averageScore: calcAverageScore(marketSeeds),
        averageConfidence: calcAverageConfidence(marketSeeds),
        bestSeed: bestSeed ? bestSeed.value : null,
        bestSeedScore: bestSeed ? bestSeed.scores.finalScore : 0,
        strongestSeedVerdict: bestSeed ? bestSeed.verdict.label : null,
      };

      const verdict = getMarketVerdict(market);

      return {
        ...market,
        verdict,
        note: buildMarketNote({
          ...market,
          verdict,
        }),
      };
    })
    .sort((a, b) => b.bestSeedScore - a.bestSeedScore);
};

module.exports = {
  buildMarketSummary,
};