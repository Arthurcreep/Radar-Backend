const googleTrends = require('google-trends-api');

const normalizeTrend = timelineData => {
  if (!timelineData || !timelineData.length) return 0;

  const values = timelineData.map(point => Number(point.value[0]));
  const avg = values.reduce((acc, value) => acc + value, 0) / values.length;

  return Math.min(10, avg / 10);
};

const getTrendData = async keyword => {
  try {
    const response = await googleTrends.interestOverTime({
      keyword,
      geo: 'US',
      hl: 'en-US',
      timezone: 360,
    });

    const parsed = JSON.parse(response);

    return parsed.default?.timelineData || null;
  } catch (error) {
    return null;
  }
};

const getFallbackDemand = seed => {
  const tokens = seed.tokens || [];

  let score = 3;

  if (tokens.length >= 3) score += 2;
  if (tokens.includes('app') || tokens.includes('apps')) score += 2;

  return Math.min(10, score);
};

const getDemandSignal = async seed => {
  const timelineData = await getTrendData(seed.value);

  if (!timelineData) {
    return {
      score: getFallbackDemand(seed),
      source: 'heuristic-fallback',
    };
  }

  const trendScore = normalizeTrend(timelineData);

  if (trendScore < 1) {
    return {
      score: getFallbackDemand(seed),
      source: 'heuristic-fallback',
    };
  }

  return {
    score: Number(trendScore.toFixed(2)),
    source: 'google-trends',
  };
};

module.exports = {
  getDemandSignal,
};