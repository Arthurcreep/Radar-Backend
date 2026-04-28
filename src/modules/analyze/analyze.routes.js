const express = require('express');

const analyzeController = require('./analyze.controller');
const asyncHandler = require('../../middlewares/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(analyzeController.analyzeText));

module.exports = router;