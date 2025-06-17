const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/warmeleads', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const User = require('./User')(sequelize);
const Customer = require('./Customer')(sequelize);
const Lead = require('./Lead')(sequelize);
const LeadDistribution = require('./LeadDistribution')(sequelize);
const LeadType = require('./LeadType')(sequelize);
const CustomerLeadType = require('./CustomerLeadType')(sequelize);
const DistributionRule = require('./DistributionRule')(sequelize);
const BranchColumn = require('./BranchColumn')(sequelize);

// Define associations
User.hasMany(Customer, { foreignKey: 'userId' });
Customer.belongsTo(User, { foreignKey: 'userId' });

Customer.hasMany(LeadDistribution, { foreignKey: 'customerId' });
LeadDistribution.belongsTo(Customer, { foreignKey: 'customerId' });

Lead.hasMany(LeadDistribution, { foreignKey: 'leadId' });
LeadDistribution.belongsTo(Lead, { foreignKey: 'leadId' });

// Lead belongs to LeadType
Lead.belongsTo(LeadType, { foreignKey: 'leadTypeId' });
LeadType.hasMany(Lead, { foreignKey: 'leadTypeId' });

// Many-to-many relationship between Customer and LeadType
Customer.belongsToMany(LeadType, { through: CustomerLeadType, foreignKey: 'customerId' });
LeadType.belongsToMany(Customer, { through: CustomerLeadType, foreignKey: 'leadTypeId' });

Customer.hasMany(DistributionRule, { foreignKey: 'customerId' });
DistributionRule.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = {
  sequelize,
  User,
  Customer,
  Lead,
  LeadDistribution,
  LeadType,
  CustomerLeadType,
  DistributionRule,
  BranchColumn
}; 