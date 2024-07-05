const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('slot', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    start_time: {
      type: DataTypes.STRING, // Sử dụng STRING thay vì TIME
      allowNull: true
    },
    end_time: {
      type: DataTypes.STRING, // Sử dụng STRING thay vì TIME
      allowNull: true
    },
    max_patients: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'slot',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__slot__3213E83F402670CF",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};