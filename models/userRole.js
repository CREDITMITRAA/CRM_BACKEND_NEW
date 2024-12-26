// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   return sequelize.define('UserRole', {
//     id: { 
//       type: DataTypes.INTEGER, 
//       autoIncrement: true, 
//       primaryKey: true
//     },
//     user_id: { 
//       type: DataTypes.INTEGER, 
//       allowNull: false,
//       references: {
//         model: 'Users',  // Assuming 'Users' is the table for the User model
//         key: 'id',       // The primary key in the Users table
//       }
//     },
//     role_id: { 
//       type: DataTypes.INTEGER, 
//       allowNull: false,
//       references: {
//         model: 'Roles',  // Assuming 'Roles' is the table for the Role model
//         key: 'id',       // The primary key in the Roles table
//       }
//     }
//   }, {
//     timestamps: false,  // No timestamps required
//     indexes: [
//       {
//         unique: true,
//         fields: ['user_id', 'role_id'],  // Composite unique constraint
//       }
//     ]
//   });
// };
