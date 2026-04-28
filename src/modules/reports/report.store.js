const Report = require('../../models/report.model');

const saveReport = async (report, userId) => {
  await Report.create({
    id: report.id,
    userId,
    payload: report,
  });

  return report;
};

const getReportById = async (id, userId) => {
  const record = await Report.findOne({
    where: { id, userId },
  });

  return record ? record.payload : null;
};

const getReports = async userId => {
  const records = await Report.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });

  return records.map(record => {
    const report = record.payload;

    return {
      id: report.id,
      generatedAt: report.metadata.generatedAt,
      version: report.metadata.version,
      bestSeed: report.summary.bestSeed,
      averageScore: report.summary.averageScore,
      decision: report.recommendation.decision,
      summaryLine: report.recommendation.summaryLine,
    };
  });
};

const deleteReportById = async (id, userId) => {
  const deleted = await Report.destroy({
    where: { id, userId },
  });

  return deleted > 0;
};

module.exports = {
  saveReport,
  getReportById,
  getReports,
  deleteReportById,
};