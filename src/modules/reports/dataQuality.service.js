const buildDataQuality = dataSources => {
  const usesGoogleTrends = dataSources.includes('google-trends');
  const usesFallback = dataSources.includes('heuristic-fallback');

  if (usesGoogleTrends && !usesFallback) {
    return {
      level: 'high',
      reason: 'Report uses external demand data.',
    };
  }

  if (usesGoogleTrends && usesFallback) {
    return {
      level: 'medium',
      reason: 'Report uses a mix of external demand data and heuristic fallback.',
    };
  }

  return {
    level: 'low',
    reason: 'Report uses heuristic fallback for demand. Treat results as directional, not final.',
  };
};

module.exports = {
  buildDataQuality,
};