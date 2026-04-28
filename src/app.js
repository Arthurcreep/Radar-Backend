const express = require('express');

const healthRoutes = require('./modules/health/health.routes');
const reportRoutes = require('./modules/reports/report.routes');
const analyzeRoutes = require('./modules/analyze/analyze.routes');

const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analyze', analyzeRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;