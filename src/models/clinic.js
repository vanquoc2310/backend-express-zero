const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('clinic', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phonenumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    clinic_owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      },
      unique: "UQ__clinic__8019EC38BE132499"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'clinic',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__clinic__3213E83FB8830DEA",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__clinic__8019EC38BE132499",
        unique: true,
        fields: [
          { name: "clinic_owner_id" },
        ]
      },
    ]
  });
};
