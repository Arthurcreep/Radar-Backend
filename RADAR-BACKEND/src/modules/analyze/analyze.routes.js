const express = require('express');

const analyzeController = require('./analyze.controller');
const asyncHandler = require('../../middlewares/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(analyzeController.analyzeText));
router.post('/batch', asyncHandler(analyzeController.analyzeBatch));

module.exports = router;