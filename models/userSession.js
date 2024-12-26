const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserSession', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER },
    login_status: { type: DataTypes.ENUM('registered', 'loggedIn', 'loggedOut'), defaultValue: 'registered' },
    login_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    logout_time: { type: DataTypes.DATE },
  }, { timestamps: false });
};
