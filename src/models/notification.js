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
      unique: "UQ__notifica__A50828FD74DD151D"
    },
    reappointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reappointment',
        key: 'id'
      },
      unique: "UQ__notifica__AF984F0D343062F9"
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
        name: "PK__notifica__3213E83F08C50A2F",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__notifica__A50828FD74DD151D",
        unique: true,
        fields: [
          { name: "appointment_id" },
        ]
      },
      {
        name: "UQ__notifica__AF984F0D343062F9",
        unique: true,
        fields: [
          { name: "reappointment_id" },
        ]
      },
    ]
  });
};
