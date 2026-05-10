require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const sequelize = require('./database/sequelize');

require('./models/report.model');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(env.port, () => {
      console.log(`RADAR API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start RADAR API:', error.message);
    process.exit(1);
  }
};

startServer();