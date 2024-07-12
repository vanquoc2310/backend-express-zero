require('dotenv').config();
const db = require("./../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');


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
        const clinics = await db.clinic.findAll({ where: { status: true } });
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
                },
                status: true
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
                },
                status: true
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
            where: { status: true },

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
                role_id: 3, status: true
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

const getClinicByIdDetail = async (clinicId) => {
    try {
        const clinic = await db.clinic.findOne({
            where: { id: clinicId, status: true },
            include: [
                {
                    model: db.clinic_schedule,
                    as: 'clinic_schedules'
                },
                {
                    model: db.clinic_service,
                    as: 'clinic_services',
                    include: [
                        {
                            model: db.service,
                            as: 'service'
                        }
                    ]
                },
                {
                    model: db.dentist_info,
                    as: 'dentist_infos',
                    include: [
                        {
                            model: db.user,
                            as: 'dentist',
                            attributes: ['name'],
                            where: {status: true}
                        },
                    ], 
                },
                {
                    model: db.user,
                    as: 'clinic_owner',
                    attributes: ['name', 'email']
                },
            ]
        });

        if (!clinic) {
            throw new Error('Clinic not found');
        }

        // Format the start_time and end_time fields
        clinic.clinic_schedules.forEach(schedule => {
            schedule.start_time = new Date(schedule.start_time).toISOString().slice(11, 16);
            schedule.end_time = new Date(schedule.end_time).toISOString().slice(11, 16);
        });

        return clinic;
    } catch (error) {
        throw error;
    }
};

const getFeedbackByClinicId = async (clinicId) => {
    try {
        const feedbacks = await db.feedback.findAll({
            include: [
                {
                    model: db.examination_result,
                    as: 'examination_result',
                    include: [
                        {
                            model: db.appointment,
                            as: 'appointment',
                            required: false,
                            where: {
                                clinic_id: clinicId
                            },
                            attributes: ['clinic_id']
                        },
                        {
                            model: db.reappointment,
                            as: 'reappointment',
                            required: false,
                            where: {
                                clinic_id: clinicId
                            },
                            attributes: ['clinic_id']
                        }
                    ]
                },
                {
                    model: db.user,
                    as: 'customer',
                    attributes: ['name'],
                    required: true // Ensures that the customer information is included
                }
            ]
        });

        if (!feedbacks || feedbacks.length === 0) {
            return { message: 'No feedbacks found for this clinic' };
        }

        // Filter out feedbacks with null appointment and reappointment
        const filteredFeedbacks = feedbacks.filter(feedback =>
            feedback.examination_result.appointment || feedback.examination_result.reappointment
        );

        if (filteredFeedbacks.length === 0) {
            return { message: 'No feedbacks found for this clinic' };
        }

        // Map through filtered feedbacks and format feedback_date
        const formattedFeedbacks = filteredFeedbacks.map(feedback => ({
            id: feedback.id,
            customer_id: feedback.customer_id,
            rating: feedback.rating,
            feedback_text: feedback.feedback_text,
            feedback_date: feedback.feedback_date.toISOString().slice(0, 10), // Format feedback_date as YYYY-MM-DD
            examination_result_id: feedback.examination_result.id,
            examination_result: {
                id: feedback.examination_result.id,
                customer_id: feedback.examination_result.customer_id,
                result: feedback.examination_result.result,
                result_date: feedback.examination_result.result_date.toISOString(), // Keep result_date in ISO format
                appointment: feedback.examination_result.appointment ? {
                    clinic_id: feedback.examination_result.appointment.clinic_id
                } : null,
                reappointment: feedback.examination_result.reappointment ? {
                    clinic_id: feedback.examination_result.reappointment.clinic_id
                } : null,
                hasFeedback: feedback.examination_result.hasFeedback
            },
            customer: {
                name: feedback.customer.name
            }
        }));

        return formattedFeedbacks;
    } catch (error) {
        console.error('Error retrieving feedbacks:', error);
        return { error: 'Error retrieving feedbacks' };
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
    getClinicByIdDetail,
    getFeedbackByClinicId
};
