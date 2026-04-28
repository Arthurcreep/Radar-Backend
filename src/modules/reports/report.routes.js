const express = require('express');

const reportController = require('./report.controller');
const asyncHandler = require('../../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(reportController.listReports));
router.post('/', asyncHandler(reportController.createReport));
router.get('/:id', asyncHandler(reportController.getReport));
router.delete('/:id', asyncHandler(reportController.deleteReport));

module.exports = router;