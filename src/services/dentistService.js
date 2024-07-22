const db = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');

const addDentist = async (dentistData) => {
    const transaction = await db.sequelize.transaction();
    try {
        let { email, password, name, phonenumber, degree, description, clinic_id, image } = dentistData;

        const hashedPassword = await bcrypt.hash(password, 10);
        const activedDate = moment().format('YYYY-MM-DD');

        // Create a new user
        const newUser = await db.user.create({
            email,
            password: hashedPassword,
            name,
            phonenumber,
            status: true,
            role_id: 3,
            image,
        }, { transaction });

        // Create a new dentist_info record
        const newDentistInfo = await db.dentist_info.create({
            dentist_id: newUser.id,
            clinic_id,
            degree,
            description,
            actived_date: activedDate
        }, { transaction });

        await transaction.commit();
        return { newUser, newDentistInfo };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const updateDentist = async (dentistId, dentistData) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { email, name, phonenumber, status, degree, description } = dentistData;

        // Update user
        const updatedUser = await db.user.update({
            email,
            name,
            phonenumber,
            status
        }, {
            where: { id: dentistId },
            transaction
        });

        // Update dentist_info
        const updatedDentistInfo = await db.dentist_info.update({
            degree,
            description
        }, {
            where: { dentist_id: dentistId },
            transaction
        });

        await transaction.commit();
        return { updatedUser, updatedDentistInfo };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const deleteDentist = async (dentistId) => {
    try {
        // Soft delete the user by setting status to false
        const updatedUser = await db.user.update({ status: false }, {
            where: { id: dentistId }
        });
        return updatedUser;
    } catch (error) {
        throw error;
    }
}

const getAllDentists = async () => {
    return db.user.findAll({
        where: { role_id: 3, status: true },
        include: [
            {
                model: db.dentist_info,
                as: 'dentist_info',
                include: [
                    {
                        model: db.clinic,
                        as: 'clinic'
                    }
                ]
            }
        ]
    });
};

const searchDentistsByName = async (name) => {
    return db.user.findAll({
        where: {
            role_id: 3,
            name: {
                [db.Sequelize.Op.like]: `%${name}%`
            },
            status: true
        },
        include: [
            {
                model: db.dentist_info,
                as: 'dentist_info',
                include: [
                    {
                        model: db.clinic,
                        as: 'clinic'
                    }
                ]
            }
        ]
    });
};

const getDentistsByClinic = async (clinicId) => {
    return db.clinic.findAll({
        where: { id: clinicId, status: true },
        include: [
            {
                model: db.dentist_info,
                as: 'dentist_infos',
                include: [
                    {
                        model: db.user,
                        as: 'dentist',
                        where: { status: true }
                    }
                ]
            }
        ]
    });
};

const getDentistsByClinicOwner = async (clinicId) => {
    return db.clinic.findAll({
        where: { id: clinicId, status: true },
        include: [
            {
                model: db.dentist_info,
                as: 'dentist_infos',
                include: [
                    {
                        model: db.user,
                        as: 'dentist',
                        attributes: ['id', 'name', 'email', 'phonenumber', 'image', 'status']
                    }
                ]
            }
        ],
        attributes: ['id']
    });
};

const getSlotsForDate = async (dentistId, date) => {
    try {
        console.log(`Fetching slots for dentistId: ${dentistId}, date: ${date}`);
        const slots = await db.dentist_slot.findAll({
            where: {
                dentist_id: dentistId,
                date: date
            },
            include: [
                {
                    model: db.slot,
                    as: 'slot'
                }
            ]
        });

        return slots;
    } catch (error) {
        throw new Error('Error fetching slots');
    }
};

const getAvailableSlots = async (dentistId, date) => {
    try {
        const availableSlots = await db.dentist_slot.findAll({
            where: {
                dentist_id: dentistId,
                date: date,
            },
            include: [
                {
                    model: db.slot,
                    as: 'slot',
                    where: {
                        [db.Sequelize.Op.and]: [
                            db.Sequelize.literal('dentist_slot.current_patients <= slot.max_patients')
                        ]
                    }
                }
            ]
        });

        return availableSlots;
    } catch (error) {
        console.error('Error fetching available slots:', error);
        throw new Error('Failed to fetch available slots');
    }
};

const getDentistWeeklySchedule = async (dentistId, selectedDate) => {
    try {
        // Convert selectedDate to a Date object (assuming selectedDate is in ISO format YYYY-MM-DD)
        const currentDate = new Date(selectedDate);

        // Calculate dates for the week of the selected date (Monday to Sunday)
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Sunday

        // Query to get slots and dentist slots within the date range
        const dentistSchedule = await db.dentist_slot.findAll({
            where: {
                dentist_id: dentistId,
                date: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                {
                    model: db.slot,
                    as: 'slot',
                },
                {
                    model: db.user,
                    as: 'dentist',
                    attributes: ['id', 'name'],
                },
            ],
            order: [
                ['date', 'ASC'],
                [{ model: db.slot, as: 'slot' }, 'start_time', 'ASC'],
            ],
        });

        return dentistSchedule;
    } catch (error) {
        console.error('Error fetching dentist schedule:', error);
        throw new Error('Failed to fetch dentist schedule');
    }
};

const getDentistPatients = async (dentistId) => {
    try {
        const today = moment().startOf('day').toDate(); // Lấy ngày hiện tại, bắt đầu từ đầu ngày

        // Fetch confirmed or completed appointments with associated slots, users, services, and examination results
        const appointments = await db.appointment.findAll({
            where: {
                dentist_id: dentistId,
                status: { [Op.or]: ['Confirmed', 'Completed'] },
                appointment_date: { [Op.gte]: today } // Lọc theo ngày hiện tại trở đi
            },
            include: [
                {
                    model: db.user,
                    as: 'customer',
                    attributes: ['id', 'name', 'email', 'phonenumber']
                },
                {
                    model: db.slot,
                    as: 'slot',
                    attributes: ['id', 'start_time', 'end_time']
                },
                {
                    model: db.service,
                    as: 'service',
                    attributes: ['id', 'name']
                },
                {
                    model: db.examination_result,
                    as: 'examination_results',
                }
            ],
        });

        // Log examination results for each appointment
        appointments.forEach(appointment => {
            console.log(`Appointment ID: ${appointment.id}, Examination Results: ${appointment.examination_results.length ? appointment.examination_results.map(er => er.id).join(', ') : 'None'}`);
        });

        // Fetch confirmed or completed reappointments with associated slots, users, services, and examination results
        const reappointments = await db.reappointment.findAll({
            where: {
                dentist_id: dentistId,
                status: { [Op.or]: ['Confirmed', 'Completed'] },
                reappointment_date: { [Op.gte]: today } // Lọc theo ngày hiện tại trở đi
            },
            include: [
                {
                    model: db.user,
                    as: 'customer',
                    attributes: ['id', 'name', 'email', 'phonenumber']
                },
                {
                    model: db.slot,
                    as: 'slot',
                    attributes: ['id', 'start_time', 'end_time']
                },
                {
                    model: db.service,
                    as: 'service',
                    attributes: ['id', 'name']
                },
                {
                    model: db.examination_result,
                    as: 'examination_results',
                }
            ],
        });

        // Log examination results for each reappointment
        reappointments.forEach(reappointment => {
            console.log(`Reappointment ID: ${reappointment.id}, Examination Results: ${reappointment.examination_results.length ? reappointment.examination_results.map(er => er.id).join(', ') : 'None'}`);
        });

        // Combine appointments and reappointments with relevant information
        const allPatients = [
            ...appointments.map(appointment => ({
                type: 'Appointment',
                customer: appointment.customer,
                date: appointment.appointment_date,
                clinic_id: appointment.clinic_id,
                service_id: appointment.service_id,
                slot: {
                    id: appointment.slot.id,
                    start_time: appointment.slot.start_time,
                    end_time: appointment.slot.end_time
                },
                serviceName: appointment.service.name,
                appointmentId: appointment.id,
                examinationResult: !!appointment.examination_results.length, // true if examination result exists, false otherwise
                examination_results: appointment.examination_results.map(er => er.result) // Map results
            })),
            ...reappointments.map(reappointment => ({
                type: 'Reappointment',
                customer: reappointment.customer,
                date: reappointment.reappointment_date,
                clinic_id: reappointment.clinic_id,
                service_id: reappointment.service_id,
                slot: {
                    id: reappointment.slot.id,
                    start_time: reappointment.slot.start_time,
                    end_time: reappointment.slot.end_time
                },
                serviceName: reappointment.service.name,
                appointmentId: reappointment.id,
                examinationResult: !!reappointment.examination_results.length, // true if examination result exists, false otherwise
                examination_results: reappointment.examination_results.map(er => er.result) // Map results
            }))
        ];

        // Sort patients based on date and slot ID
        allPatients.sort((a, b) => {
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;

            return a.slot.id - b.slot.id;
        });

        return allPatients;
    } catch (error) {
        console.error('Error fetching dentist patients:', error);
        throw new Error('Failed to fetch dentist patients');
    }
};




const getDentistPatientHistory = async (customerId) => {
    try {
        const history = await db.examination_result.findAll({
            where: { customer_id: customerId },
            include: [
                {
                    model: db.appointment,
                    as: 'appointment',
                    required: false,
                    include: [
                        {
                            model: db.slot,
                            as: 'slot',
                            attributes: ['start_time', 'end_time'],
                            required: false
                        }
                    ]
                },
                {
                    model: db.reappointment,
                    as: 'reappointment',
                    required: false,
                    include: [
                        {
                            model: db.slot,
                            as: 'slot',
                            attributes: ['start_time', 'end_time'],
                            required: false
                        }
                    ]
                },
                {
                    model: db.user,
                    as: 'customer',
                    required: false
                }
            ],
            order: [['result_date', 'DESC']],
        });

        // Format the result_date and slot information
        const formattedHistory = history.map(entry => {
            const entryJson = entry.toJSON();
            const appointmentSlot = entryJson.appointment?.slot || {};
            const reappointmentSlot = entryJson.reappointment?.slot || {};

            const slotInfo = entryJson.appointment
                ? { 
                    start_time: appointmentSlot.start_time, 
                    end_time: appointmentSlot.end_time 
                }
                : entryJson.reappointment
                ? { 
                    start_time: reappointmentSlot.start_time, 
                    end_time: reappointmentSlot.end_time 
                }
                : {};

            return {
                ...entryJson,
                result_date: new Date(entryJson.result_date).toLocaleString('en-US', { timeZone: 'UTC' }),
                slot: slotInfo // Include slot information
            };
        });

        return formattedHistory;
    } catch (error) {
        console.error('Error fetching patient history:', error);
        throw new Error('Failed to fetch patient history');
    }
};


const createExaminationResult = async (id, result, type) => {
    try {
        let appointment = null;
        let reappointment = null;
        console.log(id);

        if (type === 'Appointment') {
            appointment = await db.appointment.findByPk(id);
            if (!appointment) {
                throw new Error('Appointment not found.');
            }
        } else if (type === 'Reappointment') {
            reappointment = await db.reappointment.findByPk(id);
            if (!reappointment) {
                throw new Error('Reappointment not found.');
            }
        } else {
            throw new Error('Invalid type specified.');
        }

        let resultDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
        resultDate = db.sequelize.literal(`CONVERT(datetime, '${resultDate}', 120)`);
        console.log(typeof resultDate);

        let examinationResult;

        // Check if an examination result already exists
        if (type == 'Appointment') {
            examinationResult = await db.examination_result.findOne({
                where: {
                    customer_id: appointment.customer_id,
                    appointment_id: appointment.id
                }
            });
        }

        if (type == 'Reappointment') {
            examinationResult = await db.examination_result.findOne({
                where: {
                    customer_id: reappointment.customer_id,
                    reappointment_id: reappointment.id
                }
            });
        }

        console.log(examinationResult);

        if (examinationResult) {
            // Update the existing examination result
            examinationResult.result = result;
            examinationResult.result_date = resultDate;
            await examinationResult.save();
        } else {
            // Create a new examination result
            const examinationResultData = {
                customer_id: appointment ? appointment.customer_id : reappointment.customer_id,
                result,
                result_date: resultDate,
            };

            if (appointment) {
                examinationResultData.appointment_id = id;
                await appointment.update({ status: 'Completed' });
            } else {
                examinationResultData.reappointment_id = id;
                await reappointment.update({ status: 'Completed' });
            }

            examinationResult = await db.examination_result.create(examinationResultData);
        }

        return examinationResult;
    } catch (error) {
        console.error('Error in createOrUpdateExaminationResult service:', error);
        throw new Error('Failed to create or update examination result.');
    }
};





module.exports = {
    addDentist,
    updateDentist,
    deleteDentist,
    getAllDentists,
    searchDentistsByName,
    getDentistsByClinic,
    getSlotsForDate,
    getAvailableSlots,
    getDentistWeeklySchedule,
    getDentistPatients,
    getDentistPatientHistory,
    createExaminationResult,
    getDentistsByClinicOwner
}