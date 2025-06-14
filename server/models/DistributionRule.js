const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DistributionRule = sequelize.define('DistributionRule', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    ruleType: {
      type: DataTypes.ENUM('distance', 'budget', 'lead_count', 'quality', 'time', 'custom'),
      allowNull: false
    },
    conditions: {
      type: DataTypes.JSON, // Flexible conditions object
      allowNull: false
    },
    weight: {
      type: DataTypes.DECIMAL(3, 2), // Weight for this rule in scoring (0.00 to 1.00)
      allowNull: false,
      defaultValue: 1.00,
      validate: {
        min: 0,
        max: 1
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1 = highest priority
      validate: {
        min: 1,
        max: 10
      }
    },
    appliesTo: {
      type: DataTypes.ENUM('all', 'specific_lead_types', 'specific_regions'),
      defaultValue: 'all'
    },
    targetLeadTypes: {
      type: DataTypes.JSON // Array of lead type IDs this rule applies to
    },
    targetRegions: {
      type: DataTypes.JSON // Array of regions this rule applies to
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringPattern: {
      type: DataTypes.JSON // Cron-like pattern for recurring rules
    }
  }, {
    tableName: 'distribution_rules',
    timestamps: true,
    indexes: [
      {
        fields: ['customerId']
      },
      {
        fields: ['ruleType']
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
  DistributionRule.prototype.isValid = function() {
    const now = new Date();
    
    // Check if rule is within date range
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    
    return this.isActive;
  };

  DistributionRule.prototype.appliesToLeadType = function(leadTypeId) {
    if (this.appliesTo === 'all') return true;
    if (this.appliesTo === 'specific_lead_types' && this.targetLeadTypes) {
      return this.targetLeadTypes.includes(leadTypeId);
    }
    return false;
  };

  DistributionRule.prototype.appliesToRegion = function(region) {
    if (this.appliesTo === 'all') return true;
    if (this.appliesTo === 'specific_regions' && this.targetRegions) {
      return this.targetRegions.includes(region);
    }
    return false;
  };

  DistributionRule.prototype.evaluate = function(lead, customer) {
    if (!this.isValid()) return 0;
    
    switch (this.ruleType) {
      case 'distance':
        return this.evaluateDistance(lead, customer);
      case 'budget':
        return this.evaluateBudget(customer);
      case 'lead_count':
        return this.evaluateLeadCount(customer);
      case 'quality':
        return this.evaluateQuality(lead);
      case 'time':
        return this.evaluateTime();
      case 'custom':
        return this.evaluateCustom(lead, customer);
      default:
        return 0;
    }
  };

  DistributionRule.prototype.evaluateDistance = function(lead, customer) {
    const distance = lead.calculateDistance(customer.latitude, customer.longitude);
    const maxDistance = this.conditions.maxDistance || customer.serviceRadius;
    
    if (distance <= maxDistance) {
      // Closer distance = higher score
      return Math.max(0, 1 - (distance / maxDistance)) * this.weight;
    }
    return 0;
  };

  DistributionRule.prototype.evaluateBudget = function(customer) {
    const budgetUtilization = customer.getBudgetUtilization();
    const targetUtilization = this.conditions.targetUtilization || 80;
    
    if (budgetUtilization < targetUtilization) {
      // Lower utilization = higher score
      return Math.max(0, 1 - (budgetUtilization / targetUtilization)) * this.weight;
    }
    return 0;
  };

  DistributionRule.prototype.evaluateLeadCount = function(customer) {
    const leadUtilization = customer.getLeadUtilization();
    const targetUtilization = this.conditions.targetUtilization || 80;
    
    if (leadUtilization < targetUtilization) {
      // Lower utilization = higher score
      return Math.max(0, 1 - (leadUtilization / targetUtilization)) * this.weight;
    }
    return 0;
  };

  DistributionRule.prototype.evaluateQuality = function(lead) {
    const qualityScores = { high: 1, medium: 0.6, low: 0.3 };
    const minQuality = this.conditions.minQuality || 'medium';
    
    if (lead.leadQuality === minQuality || 
        (minQuality === 'medium' && lead.leadQuality === 'high') ||
        (minQuality === 'low' && ['high', 'medium'].includes(lead.leadQuality))) {
      return qualityScores[lead.leadQuality] * this.weight;
    }
    return 0;
  };

  DistributionRule.prototype.evaluateTime = function() {
    const now = new Date();
    const hour = now.getHours();
    
    // Example: prefer leads during business hours
    if (hour >= 9 && hour <= 17) {
      return this.weight;
    }
    return 0;
  };

  DistributionRule.prototype.evaluateCustom = function(lead, customer) {
    // Custom evaluation logic based on conditions
    // This can be extended based on specific business rules
    return this.weight;
  };

  return DistributionRule;
}; 