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
      }
    },
    reappointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reappointment',
        key: 'id'
      }
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
        name: "PK__notifica__3213E83F7CB9D5C3",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
