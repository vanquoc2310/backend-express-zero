const Sequelize = require('sequelize');
const moment = require('moment');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appointment', {
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
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clinic',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    appointment_date: {
      type: DataTypes.DATE, // Kiểu ngày giờ trong Sequelize
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Sử dụng CURRENT_TIMESTAMP SQL
      get() {
        const rawValue = this.getDataValue('appointment_date');
        return rawValue ? moment(rawValue).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss') : null; // Định dạng ngày giờ cho múi giờ châu Á/Hà Nội
      }
    },
    dentist_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
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
    },
    slot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'slot',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'appointment',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__appointm__3213E83F5AEA6F65",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
