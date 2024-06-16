const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('examination_result', {
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
    result: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    result_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'appointment',
        key: 'id'
      },
      unique: "UQ__examinat__A50828FD8346ACA6"
    },
    reappointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reappointment',
        key: 'id'
      },
      unique: "UQ__examinat__AF984F0DF7150AAA"
    }
  }, {
    sequelize,
    tableName: 'examination_result',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__examinat__3213E83F4F4B817D",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__examinat__A50828FD8346ACA6",
        unique: true,
        fields: [
          { name: "appointment_id" },
        ]
      },
      {
        name: "UQ__examinat__AF984F0DF7150AAA",
        unique: true,
        fields: [
          { name: "reappointment_id" },
        ]
      },
    ]
  });
};
