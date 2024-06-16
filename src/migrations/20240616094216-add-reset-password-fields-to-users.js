'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('User', 'resetPasswordToken', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('User', 'resetPasswordExpires', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('User', 'resetPasswordToken');
        await queryInterface.removeColumn('User', 'resetPasswordExpires');
    }
};
