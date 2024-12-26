const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('LoanReport', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    lead_id: { type: DataTypes.INTEGER },
    loan_amount: { type: DataTypes.DECIMAL(15, 2) },
    bank_name: { type: DataTypes.STRING },
    loan_type: { type: DataTypes.STRING },
    emi: { type: DataTypes.DECIMAL(10, 2) },
    outstanding: { type: DataTypes.DECIMAL(15, 2) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  }, { timestamps: true });
};
