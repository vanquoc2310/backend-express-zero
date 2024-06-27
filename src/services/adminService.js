require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const db = require("./../models");

const createUser = async ({ email, password, name, phonenumber, role_id, image, clinic_id }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const t = await db.sequelize.transaction();
    try {
        const newUser = await db.user.create({
            email,
            password: hashedPassword,
            name,
            phonenumber,
            role_id,
            image,
        }, { transaction: t });

        if (role_id === 3) {
            await db.dentist_info.create({
                dentist_id: newUser.id,
                clinic_id: clinic_id
            }, { transaction: t });
        }

        await t.commit();
        return newUser;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

const updateUser = async ({ userId, email, password, name, phonenumber, role_id, image, clinic_id }) => {
    const user = await db.user.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    let updatedPassword = user.password;
    if (password) {
        updatedPassword = await bcrypt.hash(password, 10);
    }

    await user.update({
        email: email || user.email,
        phonenumber: phonenumber || user.phonenumber,
        name: name || user.name,
        password: updatedPassword,
        role_id: role_id || user.role_id,
        image: image || user.image
    });

    if (role_id === 3 && clinic_id) {
        await db.dentist_info.update({
            clinic_id: clinic_id
        }, {
            where: { dentist_id: userId }
        });
    }

    return user;
};

const deleteUser = async (userId) => {
    const t = await db.sequelize.transaction();
    try {
        const user = await db.user.findByPk(userId, { transaction: t });
        if (!user) {
            throw new Error('User not found');
        }

        await user.update({ status: false }, { transaction: t });

        await t.commit();
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

const getCustomersAndClinicOwners = async () => {
    return db.user.findAll({
        where: {
            role_id: [2, 4], // 2 is customer, 4 is clinic owner
        }
    });
};

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getCustomersAndClinicOwners
}