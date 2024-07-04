const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "UQ__user__AB6E6164F7F87138"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phonenumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "UQ__user__622BF0C225F05774"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(4000),
      allowNull: true
    },
    token_user: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE, // Sử dụng kiểu dữ liệu DATE cho createdAt
      allowNull: false,
      defaultValue: Sequelize.literal('GETDATE()') // Giá trị mặc định khi tạo mới bản ghi
    },
    updatedAt: {
      type: DataTypes.DATE, // Sử dụng kiểu dữ liệu DATE cho updatedAt
      allowNull: false,
      defaultValue: Sequelize.literal('GETDATE()') // Giá trị mặc định khi cập nhật bản ghi
    }, 
  }, {
    sequelize,
    tableName: 'user',
    schema: 'dbo',
    timestamps: true,
    indexes: [
      {
        name: "PK__user__3213E83FF6086E51",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__user__622BF0C225F05774",
        unique: true,
        fields: [
          { name: "phonenumber" },
        ]
      },
      {
        name: "UQ__user__AB6E6164F7F87138",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};
