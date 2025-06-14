const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.ENUM('Netherlands', 'Belgium'),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    serviceRadius: {
      type: DataTypes.INTEGER, // in kilometers
      allowNull: false,
      defaultValue: 60
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2), // total budget for leads
      allowNull: false
    },
    budgetUsed: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    targetLeadsPerMonth: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currentMonthLeads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    costPerLead: {
      type: DataTypes.DECIMAL(8, 2), // target cost per lead
      allowNull: false
    },
    googleSheetId: {
      type: DataTypes.STRING, // ID of customer's Google Sheet
      allowNull: false
    },
    googleSheetName: {
      type: DataTypes.STRING,
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
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'customers',
    timestamps: true,
    indexes: [
      {
        fields: ['latitude', 'longitude']
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
  Customer.prototype.getRemainingBudget = function() {
    return this.budget - this.budgetUsed;
  };

  Customer.prototype.getBudgetUtilization = function() {
    return (this.budgetUsed / this.budget) * 100;
  };

  Customer.prototype.getLeadUtilization = function() {
    return (this.currentMonthLeads / this.targetLeadsPerMonth) * 100;
  };

  Customer.prototype.canReceiveLeads = function() {
    return this.isActive && 
           this.getRemainingBudget() > 0 && 
           this.currentMonthLeads < this.targetLeadsPerMonth;
  };

  return Customer;
}; 