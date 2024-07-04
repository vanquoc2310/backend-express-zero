const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('role', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'role',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__role__3213E83FF2C6778B",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
