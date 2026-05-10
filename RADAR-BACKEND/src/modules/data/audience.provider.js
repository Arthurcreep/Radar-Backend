const AUDIENCE_TOKENS = [
  'students',
  'student',
  'freelancers',
  'freelancer',
  'creators',
  'creator',
  'parents',
  'parent',
  'couples',
  'couple',
  'beginners',
  'beginner',
  'kids',
  'teens',
  'developers',
  'developer',
];

const countMatches = (tokens, dictionary) =>
  tokens.filter(token => dictionary.includes(token)).length;

const getAudienceSignal = async seed => {
  const matches = countMatches(seed.tokens, AUDIENCE_TOKENS);

  return Math.min(10, 2 + matches * 2);
};

module.exports = {
  getAudienceSignal,
};