const ApiError = require('../../utils/ApiError');

const reportService = require('../reports/report.service');

const guessNiche = text => {
  const value = text.toLowerCase();

  if (
    value.includes('budget') ||
    value.includes('expense') ||
    value.includes('money') ||
    value.includes('finance') ||
    value.includes('freelancer')
  ) {
    return 'finance';
  }

  if (
    value.includes('crypto') ||
    value.includes('wallet') ||
    value.includes('blockchain') ||
    value.includes('web3') ||
    value.includes('defi')
  ) {
    return 'crypto';
  }

  if (
    value.includes('sleep') ||
    value.includes('health') ||
    value.includes('fitness') ||
    value.includes('stress') ||
    value.includes('wellness') ||
    value.includes('coach')
  ) {
    return 'health';
  }

  if (
    value.includes('learn') ||
    value.includes('learning') ||
    value.includes('course') ||
    value.includes('education') ||
    value.includes('kids') ||
    value.includes('student') ||
    value.includes('students')
  ) {
    return 'education';
  }

  if (
    value.includes('project') ||
    value.includes('management') ||
    value.includes('productivity') ||
    value.includes('developer') ||
    value.includes('developers') ||
    value.includes('task') ||
    value.includes('workflow') ||
    value.includes('tool')
  ) {
    return 'productivity';
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

const validateAnalyzeBatchPayload = payload => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'Request body must be an object');
  }

  if (!Array.isArray(payload.ideas)) {
    throw new ApiError(400, 'ideas is required and must be an array');
  }

  if (!payload.ideas.length) {
    throw new ApiError(400, 'ideas must not be empty');
  }

  if (payload.ideas.length > 20) {
    throw new ApiError(400, 'ideas must not exceed 20 items');
  }

  payload.ideas.forEach((idea, index) => {
    if (typeof idea !== 'string') {
      throw new ApiError(400, `ideas[${index}] must be a string`);
    }

    if (!idea.trim()) {
      throw new ApiError(400, `ideas[${index}] must not be empty`);
    }

    if (idea.trim().length > 160) {
      throw new ApiError(400, `ideas[${index}] must not exceed 160 characters`);
    }
  });
};

const analyzeText = async (payload, userId, options = {}) => {
  validateAnalyzePayload(payload);

  const text = payload.text.trim();

  const reportPayload = {
    seeds: [
      {
        value: text,
        niche: guessNiche(text),
      },
    ],
  };

  return await reportService.createReport(reportPayload, userId, options);
};

const analyzeBatch = async (payload, userId, options = {}) => {
  validateAnalyzeBatchPayload(payload);

  const seeds = payload.ideas.map(idea => {
    const value = idea.trim();

    return {
      value,
      niche: guessNiche(value),
    };
  });

  return await reportService.createReport({ seeds }, userId, options);
};

module.exports = {
  analyzeText,
  analyzeBatch,
};