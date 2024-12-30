const { DataTypes } = require('sequelize');
const { LEAD_STATUSES, VERIFICATION_STATUSES, APPLICATION_STATUSES } = require('../utilities/constants');

module.exports = (sequelize) => {
  return sequelize.define('Lead', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING(15), unique:true },
    city: { type: DataTypes.STRING },
    company: { type: DataTypes.STRING },
    lead_source: { type: DataTypes.STRING },
    company_category_id: { type: DataTypes.INTEGER },
    salary: { type: DataTypes.DECIMAL(10, 2) },
    verification_status: { 
      type: DataTypes.ENUM(...VERIFICATION_STATUSES), // Spread the array values into the ENUM type
      defaultValue: 'Under Review' // Set a default value
    },
    lead_status: { type: DataTypes.ENUM(...LEAD_STATUSES), defaultValue: 'Not Contacted' },
    application_status : { type: DataTypes.ENUM(...APPLICATION_STATUSES) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  }, { timestamps: true });
};
