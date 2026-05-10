const getRiskLevel = competition => {
  if (competition >= 8) return 'very high';
  if (competition >= 6) return 'high';
  if (competition >= 4) return 'medium';

  return 'low';
};

const buildRiskReasons = seed => {
  const reasons = [];
  const { competition } = seed.scores;

  if (competition >= 8) {
    reasons.push('Very high competition signal');
  }

  if (competition >= 6 && competition < 8) {
    reasons.push('High competition signal');
  }

  if (seed.tokens.includes('crypto')) {
    reasons.push('Crypto-related ideas usually require strong trust and security advantages');
  }

  if (seed.tokens.includes('wallet')) {
    reasons.push('Wallet products have high trust and security requirements');
  }

  if (seed.tokens.includes('social')) {
    reasons.push('Social products usually require strong distribution and network effects');
  }

  if (seed.tokens.includes('dating')) {
    reasons.push('Dating products are highly competitive and retention-sensitive');
  }

  if (!reasons.length) {
    reasons.push('No major risk signal detected');
  }

  return reasons;
};

const attachRisks = seeds =>
  seeds.map(seed => ({
    ...seed,
    risk: {
      level: getRiskLevel(seed.scores.competition),
      reasons: buildRiskReasons(seed),
    },
  }));

module.exports = {
  attachRisks,
};