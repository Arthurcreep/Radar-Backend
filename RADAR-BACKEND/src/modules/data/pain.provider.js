const PAIN_TOKENS = [
  'manage',
  'management',
  'track',
  'tracker',
  'help',
  'reduce',
  'improve',
  'learn',
  'save',
  'budgeting',
  'expense',
  'debt',
  'sleep',
  'stress',
  'habit',
];

const countMatches = (tokens, dictionary) =>
  tokens.filter(token => dictionary.includes(token)).length;

const getPainSignal = async seed => {
  const matches = countMatches(seed.tokens, PAIN_TOKENS);

  return Math.min(10, 3 + matches * 2);
};

module.exports = {
  getPainSignal,
};