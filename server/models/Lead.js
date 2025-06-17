const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lead = sequelize.define('Lead', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    leadTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lead_types',
        key: 'id'
      }
    },
    facebookLeadId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    rawData: {
      type: DataTypes.JSON,
      comment: 'Complete sheet data'
    },
    sheetTabName: {
      type: DataTypes.STRING
    },
    sheetCustomerName: {
      type: DataTypes.STRING
    },
    sheetBranche: {
      type: DataTypes.STRING
    },
    sheetLocation: {
      type: DataTypes.STRING
    },
    cost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('new', 'distributed', 'contacted', 'converted', 'lost'),
      defaultValue: 'new'
    },
    distributionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastDistributedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'leads',
    timestamps: true,
    indexes: [
      {
        fields: ['facebookLeadId']
      },
      {
        fields: ['leadTypeId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Instance methods
  Lead.prototype.calculateDistance = function(customerLat, customerLng) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(customerLat - this.latitude);
    const dLng = this.deg2rad(customerLng - this.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(this.latitude)) * Math.cos(this.deg2rad(customerLat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  Lead.prototype.deg2rad = function(deg) {
    return deg * (Math.PI/180);
  };

  Lead.prototype.isWithinRadius = function(customerLat, customerLng, radius) {
    const distance = this.calculateDistance(customerLat, customerLng);
    return distance <= radius;
  };

  Lead.prototype.incrementDistributionCount = async function() {
    this.distributionCount += 1;
    this.lastDistributedAt = new Date();
    await this.save();
  };

  return Lead;
}; 