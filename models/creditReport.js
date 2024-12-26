const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CreditReport', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    lead_id: { type: DataTypes.INTEGER },
    credit_card_name: { type: DataTypes.STRING },
    total_outstanding: { type: DataTypes.DECIMAL(15, 2) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  }, { timestamps: true });
};
