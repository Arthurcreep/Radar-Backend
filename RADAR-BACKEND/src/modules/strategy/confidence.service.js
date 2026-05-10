const getConfidenceLevel = score => {
  if (score >= 0.75) return 'high';
  if (score >= 0.5) return 'medium';
  if (score >= 0.3) return 'low';

  return 'very low';
};

const normalize = value => Math.max(0, Math.min(1, value));

const calculateConfidenceScore = seed => {
  const { demand, commercial, pain, audience, competition } = seed.scores;

  const demandFactor = demand / 10;
  const commercialFactor = commercial / 10;
  const painFactor = pain / 10;
  const audienceFactor = audience / 10;
  const competitionFactor = 1 - competition / 10;

  const score =
    demandFactor * 0.25 +
    commercialFactor * 0.2 +
    painFactor * 0.2 +
    audienceFactor * 0.15 +
    competitionFactor * 0.2;

  return normalize(Number(score.toFixed(2)));
};

const buildConfidenceFactors = seed => {
  const factors = [];
  const { demand, commercial, pain, audience, competition } = seed.scores;

  if (demand >= 7) factors.push('Strong demand');
  if (commercial >= 5) factors.push('Commercial intent present');
  if (pain >= 5) factors.push('Clear problem signal');
  if (audience >= 4) factors.push('Defined audience');

  if (competition >= 7) factors.push('High competition reduces confidence');

  if (!factors.length) {
    factors.push('Weak signals across all dimensions');
  }

  return factors;
};

const attachConfidence = seeds =>
  seeds.map(seed => {
    const score = calculateConfidenceScore(seed);

    return {
      ...seed,
      confidence: {
        score,
        level: getConfidenceLevel(score),
        factors: buildConfidenceFactors(seed),
      },
    };
  });

module.exports = {
  attachConfidence,
};