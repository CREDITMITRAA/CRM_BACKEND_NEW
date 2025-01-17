const { DataTypes } = require('sequelize');
const { LEAD_STATUSES, VERIFICATION_STATUSES, TASK_STATUSES } = require('../utilities/constants');

module.exports = (sequelize) => {
  return sequelize.define('Activity', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    lead_id: { type: DataTypes.INTEGER },
    activity_status: { type: DataTypes.ENUM(...LEAD_STATUSES), defaultValue: 'Not Contacted' },
    description: { type: DataTypes.TEXT },
    docs_collected: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_by: { type: DataTypes.INTEGER },
    follow_up: { type: DataTypes.DATE },
    task_status: { 
      type: DataTypes.ENUM(...TASK_STATUSES), // Spread the array values into the ENUM type
      defaultValue: TASK_STATUSES[0] // Set a default value
    },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  }, { timestamps: true});
};
