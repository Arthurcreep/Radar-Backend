const reportService = require('./report.service');

const getUserId = req => req.headers['x-user-id'];

const createReport = async (req, res) => {
  const debug = req.query.debug === 'true';

  const report = await reportService.createReport(
    req.body,
    getUserId(req),
    { debug }
  );

  res.status(201).json({
    success: true,
    data: report,
  });
};

const getReport = async (req, res) => {
  const report = await reportService.findReportById(
    req.params.id,
    getUserId(req)
  );

  res.json({
    success: true,
    data: report,
  });
};

const listReports = async (req, res) => {
  const reports = await reportService.listReports(getUserId(req));

  res.json({
    success: true,
    data: reports,
  });
};

const deleteReport = async (req, res) => {
  const result = await reportService.deleteReport(
    req.params.id,
    getUserId(req)
  );

  res.json({
    success: true,
    data: result,
  });
};

module.exports = {
  createReport,
  getReport,
  listReports,
  deleteReport,
};