const express = require('express');

const topicController = require('./topic.controller');
const asyncHandler = require('../../middlewares/asyncHandler');

const router = express.Router();

router.post('/analyze', asyncHandler(topicController.analyzeTopics));
router.post('/expand', asyncHandler(topicController.expandTopic));

module.exports = router;