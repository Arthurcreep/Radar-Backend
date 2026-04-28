const crypto = require('crypto');

const { validateCreateReportPayload } = require('./report.validator');
const { normalizeSeeds } = require('../../utils/normalizeSeed');
const { dedupeSeeds } = require('../../utils/dedupeSeeds');
const { scoreSeeds } = require('../scoring/score.service');
const { attachVerdicts } = require('../strategy/verdict.service');
const { attachRisks } = require('../strategy/risk.service');
const { attachOpportunities } = require('../strategy/opportunity.service');
const { attachConfidence } = require('../strategy/confidence.service');
const { buildReportRecommendation } = require('../strategy/recommendation.service');
const { buildReportSummary } = require('./reportSummary.service');
const { buildMarketSummary } = require('./marketSummary.service');
const { buildDataQuality } = require('./dataQuality.service');

const {
  saveReport,
  getReportById,
  getReports,
  deleteReportById,
} = require('./report.store');

const ApiError = require('../../utils/ApiError');

const REPORT_VERSION = '1.5.3';

const sanitizeSeed = seed => {
  const { tokens, scores, ...rest } = seed;
  const { weights, sources, ...publicScores } = scores;

  return {
    ...rest,
    scores: publicScores,
  };
};

const getDataSources = seeds => {
  const sources = new Set();

  seeds.forEach(seed => {
    if (seed.scores?.sources) {
      seed.scores.sources.forEach(source => sources.add(source));
    }
  });

  return Array.from(sources);
};

const getDataWarnings = seeds => {
  const warnings = [];

  const usedFallback = seeds.some(seed =>
    seed.scores?.sources?.includes('heuristic-fallback')
  );

  if (usedFallback) {
    warnings.push('Demand signal used heuristic fallback for at least one seed.');
  }

  return warnings;
};

const buildReport = async (payload, options = {}) => {
  validateCreateReportPayload(payload);

  const normalizedSeeds = normalizeSeeds(payload.seeds);
  const { uniqueSeeds, duplicatesRemoved } = dedupeSeeds(normalizedSeeds);

  const scoredSeeds = await scoreSeeds(uniqueSeeds);
  const seedsWithVerdicts = attachVerdicts(scoredSeeds);
  const seedsWithRisks = attachRisks(seedsWithVerdicts);
  const seedsWithOpportunities = attachOpportunities(seedsWithRisks);
  const seedsWithConfidence = attachConfidence(seedsWithOpportunities);

  const analyzedSeeds = seedsWithConfidence.map(seed => ({
    ...seed,
    status: 'analyzed',
  }));

  const markets = buildMarketSummary(analyzedSeeds);
  const dataSources = getDataSources(analyzedSeeds);
  const seeds = options.debug ? analyzedSeeds : analyzedSeeds.map(sanitizeSeed);

  return {
    id: crypto.randomUUID(),
    metadata: {
      version: REPORT_VERSION,
      generatedAt: new Date().toISOString(),
      debug: Boolean(options.debug),
      dataSources,
      dataWarnings: getDataWarnings(analyzedSeeds),
      dataQuality: buildDataQuality(dataSources),
    },
    summary: {
      ...buildReportSummary(analyzedSeeds),
      duplicatesRemoved,
    },
    recommendation: buildReportRecommendation(analyzedSeeds, markets),
    markets,
    seeds,
  };
};

const createReport = async (payload, userId, options = {}) => {
  if (!userId) {
    throw new ApiError(400, 'Missing x-user-id header');
  }

  const report = await buildReport(payload, options);

  return await saveReport(report, userId);
};

const findReportById = async (id, userId) => {
  if (!userId) {
    throw new ApiError(400, 'Missing x-user-id header');
  }

  const report = await getReportById(id, userId);

  if (!report) {
    throw new ApiError(404, 'Report not found');
  }

  return report;
};

const listReports = async userId => {
  if (!userId) {
    throw new ApiError(400, 'Missing x-user-id header');
  }

  return await getReports(userId);
};

const deleteReport = async (id, userId) => {
  if (!userId) {
    throw new ApiError(400, 'Missing x-user-id header');
  }

  const deleted = await deleteReportById(id, userId);

  if (!deleted) {
    throw new ApiError(404, 'Report not found');
  }

  return {
    deleted: true,
    id,
  };
};

module.exports = {
  createReport,
  findReportById,
  listReports,
  deleteReport,
};