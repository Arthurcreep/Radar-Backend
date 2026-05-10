const STOP_WORDS = ['the', 'a', 'an', 'for', 'with', 'and', 'or', 'to', 'of'];

const normalizeText = text =>
  String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const tokenizeText = text =>
  normalizeText(text)
    .split(' ')
    .map(token => token.trim())
    .filter(token => token.length > 1)
    .filter(token => !STOP_WORDS.includes(token));

const normalizeSeed = seed => {
  const value = normalizeText(seed.value);
  const niche = normalizeText(seed.niche);

  return {
    value,
    niche,
    tokens: tokenizeText(value),
  };
};

const normalizeSeeds = seeds =>
  seeds.map(normalizeSeed);

module.exports = {
  normalizeText,
  tokenizeText,
  normalizeSeed,
  normalizeSeeds,
};