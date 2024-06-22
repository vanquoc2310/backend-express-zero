const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dentist_info', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dentist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      },
      unique: "UQ__dentist___686BBC18C6754838"
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clinic',
        key: 'id'
      }
    },
    actived_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    degree: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'dentist_info',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__dentist___3213E83F6F689E2B",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__dentist___686BBC18C6754838",
        unique: true,
        fields: [
          { name: "dentist_id" },
        ]
      },
    ]
  });
};
