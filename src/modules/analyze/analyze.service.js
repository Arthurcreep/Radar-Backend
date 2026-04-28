const ApiError = require('../../utils/ApiError');

const reportService = require('../reports/report.service');

const guessNiche = text => {
  const value = text.toLowerCase();

  if (
    value.includes('budget') ||
    value.includes('expense') ||
    value.includes('money') ||
    value.includes('finance')
  ) {
    return 'finance';
  }

  if (
    value.includes('crypto') ||
    value.includes('wallet') ||
    value.includes('blockchain')
  ) {
    return 'crypto';
  }

  if (
    value.includes('learn') ||
    value.includes('course') ||
    value.includes('education')
  ) {
    return 'education';
  }

  if (
    value.includes('health') ||
    value.includes('fitness') ||
    value.includes('sleep') ||
    value.includes('stress')
  ) {
    return 'health';
  }

  return 'general';
};

const validateAnalyzePayload = payload => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'Request body must be an object');
  }

  if (!payload.text || typeof payload.text !== 'string') {
    throw new ApiError(400, 'text is required and must be a string');
  }

  if (!payload.text.trim()) {
    throw new ApiError(400, 'text must not be empty');
  }

  if (payload.text.trim().length > 160) {
    throw new ApiError(400, 'text must not exceed 160 characters');
  }
};

const analyzeText = async (payload, userId, options = {}) => {
  validateAnalyzePayload(payload);

  const text = payload.text.trim();

  const reportPayload = {
    seeds: [
      {
        value: text,
        niche: payload.niche || guessNiche(text),
      },
    ],
  };

  return await reportService.createReport(reportPayload, userId, options);
};

module.exports = {
  analyzeText,
};