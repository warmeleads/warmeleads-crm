const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LeadType = sequelize.define('LeadType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.ENUM('energy', 'heating', 'cooling', 'storage', 'other'),
      allowNull: false
    },
    averageCost: {
      type: DataTypes.DECIMAL(8, 2), // Average cost per lead for this type
      allowNull: false,
      defaultValue: 0
    },
    conversionRate: {
      type: DataTypes.DECIMAL(5, 4), // Expected conversion rate (0.0000 to 1.0000)
      allowNull: false,
      defaultValue: 0.05
    },
    averageValue: {
      type: DataTypes.DECIMAL(10, 2), // Average value of converted lead
      allowNull: false,
      defaultValue: 0
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
    targetKeywords: {
      type: DataTypes.JSON // Keywords to identify this lead type
    },
    facebookFormId: {
      type: DataTypes.STRING // Facebook form ID for this lead type
    },
    googleSheetTemplate: {
      type: DataTypes.STRING // Template Google Sheet ID for this lead type
    }
  }, {
    tableName: 'lead_types',
    timestamps: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['category']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // Instance methods
  LeadType.prototype.getROI = function() {
    if (this.averageCost === 0) return 0;
    return (this.averageValue * this.conversionRate) / this.averageCost;
  };

  LeadType.prototype.isProfitable = function() {
    return this.getROI() > 1;
  };

  return LeadType;
}; 