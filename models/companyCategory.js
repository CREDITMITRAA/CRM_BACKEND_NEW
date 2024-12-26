const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CompanyCategory', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  }, { timestamps: true });
};
