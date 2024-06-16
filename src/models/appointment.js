const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appointment', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clinic',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dentist_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'service',
        key: 'id'
      }
    },
    slot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'slot',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'appointment',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__appointm__3213E83F4E6E6041",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
