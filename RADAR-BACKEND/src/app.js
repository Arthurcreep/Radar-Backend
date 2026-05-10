const express = require('express');
const cors = require('cors');

const healthRoutes = require('./modules/health/health.routes');
const reportRoutes = require('./modules/reports/report.routes');
const analyzeRoutes = require('./modules/analyze/analyze.routes');
const topicRoutes = require('./modules/topics/topic.routes');

const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/topics', topicRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;