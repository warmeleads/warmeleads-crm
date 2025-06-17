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
    facebookAdId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    facebookCampaignId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
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
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.ENUM('Netherlands', 'Belgium'),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    propertyType: {
      type: DataTypes.ENUM('house', 'apartment', 'commercial', 'other')
    },
    propertyAge: {
      type: DataTypes.INTEGER // in years
    },
    propertySize: {
      type: DataTypes.INTEGER // in square meters
    },
    energyLabel: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'unknown')
    },
    currentHeatingSystem: {
      type: DataTypes.STRING
    },
    interestIn: {
      type: DataTypes.JSON // Array of interests like ['solar_panels', 'heat_pump', 'battery']
    },
    budget: {
      type: DataTypes.STRING
    },
    timeline: {
      type: DataTypes.ENUM('immediate', 'within_3_months', 'within_6_months', 'within_year', 'unknown')
    },
    additionalInfo: {
      type: DataTypes.TEXT
    },
    leadQuality: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium'
    },
    cost: {
      type: DataTypes.DECIMAL(8, 2), // Cost of acquiring this lead
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
    },
    rawData: {
      type: DataTypes.JSON // Store complete Facebook lead data
    },
    sheetTabName: {
      type: DataTypes.STRING // Naam van het tabblad waar de lead vandaan komt
    },
    sheetCustomerName: {
      type: DataTypes.STRING // Klantnaam uit tabbladnaam
    },
    sheetBranche: {
      type: DataTypes.STRING // Branche uit tabbladnaam
    },
    sheetLocation: {
      type: DataTypes.STRING // Locatie uit tabbladnaam
    },
    naamKlant: {
      type: DataTypes.STRING
    },
    datumInteresse: {
      type: DataTypes.STRING
    },
    postcode: {
      type: DataTypes.STRING
    },
    plaatsnaam: {
      type: DataTypes.STRING
    },
    telefoonnummer: {
      type: DataTypes.STRING
    },
    zonnepanelen: {
      type: DataTypes.STRING
    },
    dynamischContract: {
      type: DataTypes.STRING
    },
    stroomverbruik: {
      type: DataTypes.STRING
    },
    redenThuisbatterij: {
      type: DataTypes.STRING
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
        fields: ['latitude', 'longitude']
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