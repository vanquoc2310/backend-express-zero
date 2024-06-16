const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('clinic_schedule', {
    schedule_id: {
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
    day_of_week: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'clinic_schedule',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__clinic_s__C46A8A6FBD0EEF99",
        unique: true,
        fields: [
          { name: "schedule_id" },
        ]
      },
    ]
  });
};
