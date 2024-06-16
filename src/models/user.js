const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "UQ__user__AB6E61649EA23669"
    },
    password: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    phonenumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "UQ__user__622BF0C292651721"
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
  }, {
    sequelize,
    tableName: 'user',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__user__3213E83FE671F478",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__user__622BF0C292651721",
        unique: true,
        fields: [
          { name: "phonenumber" },
        ]
      },
      {
        name: "UQ__user__AB6E61649EA23669",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};
