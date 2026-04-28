const { DataTypes } = require('sequelize');

const sequelize = require('../database/sequelize');

const Report = sequelize.define(
  'Report',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    tableName: 'reports',
    timestamps: true,
  }
);

module.exports = Report;