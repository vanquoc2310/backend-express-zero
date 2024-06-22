const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notification', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'appointment',
        key: 'id'
      },
      unique: "UQ__notifica__A50828FDA8F481E5"
    },
    reappointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reappointment',
        key: 'id'
      },
      unique: "UQ__notifica__AF984F0D2604D5B0"
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'notification',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__notifica__3213E83F59279330",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__notifica__A50828FDA8F481E5",
        unique: true,
        fields: [
          { name: "appointment_id" },
        ]
      },
      {
        name: "UQ__notifica__AF984F0D2604D5B0",
        unique: true,
        fields: [
          { name: "reappointment_id" },
        ]
      },
    ]
  });
};
