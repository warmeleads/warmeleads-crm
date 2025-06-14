const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LeadDistribution = sequelize.define('LeadDistribution', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'leads',
        key: 'id'
      }
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    distributionScore: {
      type: DataTypes.DECIMAL(5, 4), // Score that determined this distribution (0.0000 to 1.0000)
      allowNull: false
    },
    distributionReason: {
      type: DataTypes.TEXT // Explanation of why this lead was distributed to this customer
    },
    distance: {
      type: DataTypes.DECIMAL(8, 2), // Distance in kilometers between lead and customer
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(8, 2), // Cost charged to customer for this lead
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed'),
      defaultValue: 'pending'
    },
    sentToGoogleSheet: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    googleSheetRowId: {
      type: DataTypes.STRING // Row ID in customer's Google Sheet
    },
    sentAt: {
      type: DataTypes.DATE
    },
    deliveredAt: {
      type: DataTypes.DATE
    },
    errorMessage: {
      type: DataTypes.TEXT
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    nextRetryAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'lead_distributions',
    timestamps: true,
    indexes: [
      {
        fields: ['leadId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sentToGoogleSheet']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Instance methods
  LeadDistribution.prototype.markAsSent = async function() {
    this.status = 'sent';
    this.sentAt = new Date();
    await this.save();
  };

  LeadDistribution.prototype.markAsDelivered = async function() {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    this.sentToGoogleSheet = true;
    await this.save();
  };

  LeadDistribution.prototype.markAsFailed = async function(errorMessage) {
    this.status = 'failed';
    this.errorMessage = errorMessage;
    this.retryCount += 1;
    this.nextRetryAt = new Date(Date.now() + (this.retryCount * 5 * 60 * 1000)); // 5 minutes * retry count
    await this.save();
  };

  LeadDistribution.prototype.canRetry = function() {
    return this.status === 'failed' && this.retryCount < 3;
  };

  return LeadDistribution;
}; 