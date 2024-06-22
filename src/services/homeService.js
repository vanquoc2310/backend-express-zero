require('dotenv').config();
const db = require("./../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const getServices = async () => {
    try {
        const services = await db.service.findAll();
        return services;
    } catch (e) {
        throw e;
    }
};

const getClinics = async () => {
    try {
        const clinics = await db.clinic.findAll();
        return clinics;
    } catch (e) {
        throw e;
    }
};

const postSearchHomePage = async (keyword) => {
    try {
        const doctors = await db.user.findAll({
            where: {
                role_id: 3,
                name: {
                    [Op.like]: `%${keyword}%`
                }
            },
            attributes: ['id', 'name']
        });

        const services = await db.service.findAll({
            where: {
                name: {
                    [Op.like]: `%${keyword}%`
                }
            },
            attributes: ['id', 'name']
        });

        const clinics = await db.clinic.findAll({
            where: {
                name: {
                    [Op.like]: `%${keyword}%`
                }
            },
            attributes: ['id', 'name']
        });

        return {
            doctors,
            services,
            clinics
        };
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const getDataPageAllClinics = async () => {
    try {
        const clinics = await db.clinic.findAll({
            attributes: ['id', 'name', ]
        });

        return clinics;
    } catch (e) {
        throw e;
    }
};

const getDataPageAllDoctors = async () => {
    try {
        const doctors = await db.user.findAll({
            where: {
                role_id: 3
            },
            attributes: ['id', 'name', 'image'],
            include: [
                {
                    model: db.dentist_info,
                    as: 'dentist_info',
                    attributes: ['degree', 'clinic_id'],
                    include: [
                        {
                            model: db.clinic,
                            as: 'clinic',
                            attributes: ['name']
                        }
                    ]
                }
            ]
        });

        return doctors;
    } catch (e) {
        throw e;
    }
};

const getDataPageAllServices = async () => {
    try {
        const services = await db.service.findAll({
            attributes: ['id', 'name', 'image', 'price']
        });
        return services;
    } catch (e) {
        throw e;
    }
};

const getServiceById = async (id) => {
    try {
        const service = await db.service.findByPk(id);
        if (!service) {
            throw new Error('Service not found');
        }
        return service;
    } catch (error) {
        throw error;
    }
};

const getClinicById = async (id) => {
    try {
        const service = await db.clinic.findByPk(id);
        if (!service) {
            throw new Error('Service not found');
        }
        return service;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getServices,
    getClinics,
    postSearchHomePage,
    getDataPageAllClinics,
    getDataPageAllDoctors,
    getDataPageAllServices,
    getServiceById, 
    getClinicById
};
