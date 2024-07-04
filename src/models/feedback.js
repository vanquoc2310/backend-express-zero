const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('feedback', {
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    feedback_text: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    feedback_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    examination_result_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'examination_result',
        key: 'id'
      },
      unique: "UQ__feedback__5DFC491E3F011298"
    }
  }, {
    sequelize,
    tableName: 'feedback',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__feedback__3213E83FABAE5005",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__feedback__5DFC491E3F011298",
        unique: true,
        fields: [
          { name: "examination_result_id" },
        ]
      },
    ]
  });
};
