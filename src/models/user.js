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
      unique: "UQ__user__AB6E61649F6A7DB5"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phonenumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "UQ__user__622BF0C2A60DD1DD"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'role',
        key: 'id'
      }
    },
    image: {
      type: DataTypes.BLOB,
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'user',
    schema: 'dbo',
    timestamps: true,
    indexes: [
      {
        name: "PK__user__3213E83FCFF6C1AA",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__user__622BF0C2A60DD1DD",
        unique: true,
        fields: [
          { name: "phonenumber" },
        ]
      },
      {
        name: "UQ__user__AB6E61649F6A7DB5",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};
