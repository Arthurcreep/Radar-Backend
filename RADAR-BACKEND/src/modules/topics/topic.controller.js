const topicService = require('./topic.service');

const analyzeTopics = async (req, res) => {
  const result = await topicService.analyzeTopics(req.body);

  res.status(201).json({
    success: true,
    data: result,
  });
};

const expandTopic = async (req, res) => {
  const result = await topicService.expandSingleTopic(req.body);

  res.status(201).json({
    success: true,
    data: result,
  });
};

module.exports = {
  analyzeTopics,
  expandTopic,
};