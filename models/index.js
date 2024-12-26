const sequelize = require('../config/db');
const User = require('./user')(sequelize);
const Role = require('./role')(sequelize);
const Lead = require('./lead')(sequelize);
const CompanyCategory = require('./companyCategory')(sequelize);
const LeadAssignment = require('./leadAssignment')(sequelize);
const Activity = require('./activity')(sequelize);
const UserSession = require('./userSession')(sequelize);
const LoanReport = require('./loanReport')(sequelize);
const CreditReport = require('./creditReport')(sequelize);
const InvalidLead = require('./invalidLead')(sequelize)

// Define Relationships
// User.belongsToMany(Role, { through: UserRole });
// Role.belongsToMany(User, { through: UserRole });
User.belongsTo(Role, {foreignKey: 'role_id',as: 'Role'})
Role.hasMany(User, {foreignKey: 'role_id', as: 'Users'});
User.hasMany(LeadAssignment, { foreignKey: 'assigned_to', as: 'AssignedLeads' });

Lead.belongsTo(CompanyCategory, { foreignKey: 'company_category_id' });
CompanyCategory.hasMany(Lead, { foreignKey: 'company_category_id' });

Lead.hasMany(Activity, { foreignKey: 'lead_id', as: 'Activities' });
Lead.hasMany(LeadAssignment, { foreignKey: 'lead_id', as: 'LeadAssignments' });

LeadAssignment.belongsTo(Lead, { foreignKey: 'lead_id', as: 'Lead' });
LeadAssignment.belongsTo(User, { foreignKey: 'assigned_to', as: 'AssignedTo' });
LeadAssignment.belongsTo(User, { as: 'assignedBy', foreignKey: 'assigned_by' });

Activity.belongsTo(Lead, { foreignKey: 'lead_id', as: 'Lead' });
Activity.belongsTo(User, { foreignKey: 'created_by', as: "CreatedBy" });

UserSession.belongsTo(User, { foreignKey: 'user_id' });

LoanReport.belongsTo(Lead, { foreignKey: 'lead_id' });
CreditReport.belongsTo(Lead, { foreignKey: 'lead_id' });

Activity.hasMany(LeadAssignment, { foreignKey: 'lead_id', as: 'LeadAssignments' });
LeadAssignment.belongsTo(Activity, { foreignKey: 'lead_id', as: 'Activity' });

module.exports = {
  sequelize,
  User,
  Role,
  Lead,
  CompanyCategory,
  LeadAssignment,
  Activity,
  UserSession,
  LoanReport,
  CreditReport,
  InvalidLead
};
