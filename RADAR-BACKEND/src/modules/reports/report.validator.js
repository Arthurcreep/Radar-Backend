const ApiError = require('../../utils/ApiError');

const MAX_SEEDS_PER_REPORT = 100;
const MAX_SEED_VALUE_LENGTH = 120;
const MAX_NICHE_LENGTH = 60;

const validateCreateReportPayload = payload => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'Request body must be an object');
  }

  if (!Array.isArray(payload.seeds)) {
    throw new ApiError(400, 'seeds must be an array');
  }

  if (!payload.seeds.length) {
    throw new ApiError(400, 'seeds must not be empty');
  }

  if (payload.seeds.length > MAX_SEEDS_PER_REPORT) {
    throw new ApiError(400, `seeds must not contain more than ${MAX_SEEDS_PER_REPORT} items`);
  }

  payload.seeds.forEach((seed, index) => {
    if (!seed || typeof seed !== 'object' || Array.isArray(seed)) {
      throw new ApiError(400, `seeds[${index}] must be an object`);
    }

    if (!seed.value || typeof seed.value !== 'string') {
      throw new ApiError(400, `seeds[${index}].value is required and must be a string`);
    }

    if (seed.value.trim().length > MAX_SEED_VALUE_LENGTH) {
      throw new ApiError(400, `seeds[${index}].value must not exceed ${MAX_SEED_VALUE_LENGTH} characters`);
    }

    if (!seed.niche || typeof seed.niche !== 'string') {
      throw new ApiError(400, `seeds[${index}].niche is required and must be a string`);
    }

    if (seed.niche.trim().length > MAX_NICHE_LENGTH) {
      throw new ApiError(400, `seeds[${index}].niche must not exceed ${MAX_NICHE_LENGTH} characters`);
    }
  });
};

module.exports = {
  validateCreateReportPayload,
};