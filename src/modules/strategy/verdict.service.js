const getVerdictByScore = finalScore => {
  if (finalScore >= 6.5) {
    return {
      label: 'strong opportunity',
      message: 'Strong signal. This seed deserves deeper market and strategy analysis.',
    };
  }

  if (finalScore >= 4.2) {
    return {
      label: 'needs validation',
      message: 'There are useful signals, but this seed needs validation before prioritization.',
    };
  }

  if (finalScore >= 2.5) {
    return {
      label: 'weak opportunity',
      message: 'Weak signal. Needs stronger demand, pain, audience, or commercial intent.',
    };
  }

  return {
    label: 'avoid',
    message: 'Very weak signal. Do not prioritize this seed unless you have a strong unfair advantage.',
  };
};

const buildReasons = seed => {
  const reasons = [];
  const { demand, commercial, pain, audience, competition } = seed.scores;

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

  if (competition >= 7) {
    reasons.push('High competition risk');
  }

  if (!reasons.length) {
    reasons.push('No strong positive signal detected');
  }

  return reasons;
};

const attachVerdicts = seeds =>
  seeds.map(seed => ({
    ...seed,
    verdict: {
      ...getVerdictByScore(seed.scores.finalScore),
      reasons: buildReasons(seed),
    },
  }));

module.exports = {
  getVerdictByScore,
  attachVerdicts,
};