const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerLeadType = sequelize.define('CustomerLeadType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    leadTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lead_types',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    targetLeadsPerMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    currentMonthLeads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    costPerLead: {
      type: DataTypes.DECIMAL(8, 2), // Specific cost per lead for this customer and lead type
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1 = highest priority
      validate: {
        min: 1,
        max: 10
      }
    },
    maxDistance: {
      type: DataTypes.INTEGER, // Maximum distance in kilometers for this lead type
      allowNull: false,
      defaultValue: 60
    },
    qualityThreshold: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium'
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2), // Budget for this specific lead type
      allowNull: false,
      defaultValue: 0
    },
    budgetUsed: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'customer_lead_types',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['customerId', 'leadTypeId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['priority']
      }
    ]
  });

  // Instance methods
  CustomerLeadType.prototype.getRemainingBudget = function() {
    return this.budget - this.budgetUsed;
  };

  CustomerLeadType.prototype.getBudgetUtilization = function() {
    if (this.budget === 0) return 0;
    return (this.budgetUsed / this.budget) * 100;
  };

  CustomerLeadType.prototype.getLeadUtilization = function() {
    if (this.targetLeadsPerMonth === 0) return 0;
    return (this.currentMonthLeads / this.targetLeadsPerMonth) * 100;
  };

  CustomerLeadType.prototype.canReceiveLeads = function() {
    return this.isActive && 
           this.getRemainingBudget() > 0 && 
           this.currentMonthLeads < this.targetLeadsPerMonth;
  };

  return CustomerLeadType;
}; 