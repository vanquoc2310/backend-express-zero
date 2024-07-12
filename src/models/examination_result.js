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
      type: DataTypes.STRING(4000),
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
    hasFeedback: {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // Giá trị mặc định là false (chưa có đánh giá)
      allowNull: false,
    }
  }, {
    sequelize,
    tableName: 'examination_result',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__examinat__3213E83F7ED8AF53",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
