const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BranchColumn = sequelize.define('BranchColumn', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    columns: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array van kolom objecten: [{key: "naamKlant", label: "Naam klant", order: 1}]'
    }
  }, {
    tableName: 'branch_columns',
    timestamps: true
  });

  return BranchColumn;
}; 