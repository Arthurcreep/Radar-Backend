const analyzeService = require('./analyze.service');

const getUserId = req => req.headers['x-user-id'];

const analyzeText = async (req, res) => {
  const debug = req.query.debug === 'true';

  const report = await analyzeService.analyzeText(
    req.body,
    getUserId(req),
    { debug }
  );

  res.status(201).json({
    success: true,
    data: report,
  });
};

const analyzeBatch = async (req, res) => {
  const debug = req.query.debug === 'true';

  const report = await analyzeService.analyzeBatch(
    req.body,
    getUserId(req),
    { debug }
  );

  res.status(201).json({
    success: true,
    data: report,
  });
};

module.exports = {
  analyzeText,
  analyzeBatch,
};