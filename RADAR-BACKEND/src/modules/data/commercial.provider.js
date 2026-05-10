const COMMERCIAL_TOKENS = [
  'best',
  'review',
  'reviews',
  'vs',
  'alternative',
  'alternatives',
  'pricing',
  'price',
  'paid',
  'free',
  'cheap',
  'app',
  'apps',
  'tool',
  'tools',
  'software',
  'platform',
];

const countMatches = (tokens, dictionary) =>
  tokens.filter(token => dictionary.includes(token)).length;

const getCommercialSignal = async seed => {
  const matches = countMatches(seed.tokens, COMMERCIAL_TOKENS);

  return Math.min(10, 3 + matches * 2);
};

module.exports = {
  getCommercialSignal,
};