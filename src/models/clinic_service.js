const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('clinic_service', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clinic',
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
    }
  }, {
    sequelize,
    tableName: 'clinic_service',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__clinic_s__3213E83F71953BFE",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
