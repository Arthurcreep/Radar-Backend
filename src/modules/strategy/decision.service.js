const buildDecision = seed => {
  if (!seed) {
    return {
      label: 'no-data',
      confidence: 0,
      reason: 'No seed available for decision.',
    };
  }

  const score = seed.scores.finalScore;
  const confidence = seed.confidence?.score || 0;

  // 🚫 плохие идеи
  if (seed.verdict.label === 'avoid' || score <= 1) {
    return {
      label: 'no-go',
      confidence,
      reason: 'Very weak signal or extremely high competition.',
    };
  }

  // ⚠️ слабые идеи
  if (seed.verdict.label === 'weak opportunity' || score < 4) {
    return {
      label: 'no-go',
      confidence,
      reason: 'Weak opportunity. Not worth building yet.',
    };
  }

  // 🤔 средние идеи
  if (seed.verdict.label === 'needs validation') {
    return {
      label: 'investigate',
      confidence,
      reason: 'Promising but requires validation before building.',
    };
  }

  // 🚀 сильные идеи
  if (seed.verdict.label === 'strong opportunity') {
    return {
      label: 'go',
      confidence,
      reason: 'Strong signal with acceptable risk.',
    };
  }

  return {
    label: 'investigate',
    confidence,
    reason: 'Default decision path.',
  };
};

module.exports = {
  buildDecision,
};