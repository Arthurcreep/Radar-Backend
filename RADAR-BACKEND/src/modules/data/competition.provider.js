const COMPETITIVE_TOKENS = [
  'ai',
  'crypto',
  'fitness',
  'dating',
  'social',
  'wallet',
  'travel',
];

const countMatches = (tokens, dictionary) =>
  tokens.filter(token => dictionary.includes(token)).length;

const getCompetitionSignal = async seed => {
  const matches = countMatches(seed.tokens, COMPETITIVE_TOKENS);

  return Math.min(10, 4 + matches * 2);
};

module.exports = {
  getCompetitionSignal,
};