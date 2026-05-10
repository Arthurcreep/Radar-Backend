const getOpportunityLevel = finalScore => {
  if (finalScore >= 6.5) return 'high';
  if (finalScore >= 4.2) return 'medium';
  if (finalScore >= 2.5) return 'low';

  return 'very low';
};

const buildOpportunityReasons = seed => {
  const reasons = [];
  const { demand, commercial, pain, audience } = seed.scores;

  if (demand >= 7) {
    reasons.push('Strong demand signal');
  }

  if (commercial >= 5) {
    reasons.push('Commercial intent is present');
  }

  if (pain >= 5) {
    reasons.push('Pain or use-case signal is present');
  }

  if (audience >= 4) {
    reasons.push('Specific audience signal detected');
  }

  if (!reasons.length) {
    reasons.push('No strong opportunity signal detected');
  }

  return reasons;
};

const attachOpportunities = seeds =>
  seeds.map(seed => ({
    ...seed,
    opportunity: {
      level: getOpportunityLevel(seed.scores.finalScore),
      reasons: buildOpportunityReasons(seed),
    },
  }));

module.exports = {
  attachOpportunities,
};