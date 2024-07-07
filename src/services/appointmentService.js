const db = require('../models');
const moment = require('moment');
const { transMailBookingNew } = require('../../lang/eng');
const { sendEmailNormal } = require('../config/mailer');
const momenttime = require('moment-timezone');



const createAppointment = async (customerId, clinicId, dentistId, serviceId, slotId, appointmentDate) => {
    try {
        // Check if the dentist has a slot on the specified date
        let existingSlot = await db.dentist_slot.findOne({
            where: {
                dentist_id: dentistId,
                date: appointmentDate
            }
        });

        if (existingSlot.current_patients >= 3) throw new Error('Slot is full');

        // If the slot does not exist, create a new one
        if (!existingSlot) {
            existingSlot = await db.dentist_slot.create({
                dentist_id: dentistId,
                slot_id: slotId,
                date: appointmentDate,
                current_patients: 0 // Initialize current_patients as 0
            });
        }


        // Create a new appointment with status 'Pending'
        const newAppointment = await db.appointment.create({
            customer_id: customerId,
            clinic_id: clinicId,
            status: 'Pending',
            dentist_id: dentistId,
            service_id: serviceId,
            slot_id: slotId,
        });

        // Send confirmation email to the customer
        const slot = await db.slot.findByPk(slotId);
        const dentist = await db.user.findByPk(dentistId);
        const customer = await db.user.findByPk(customerId);

        const time = `${slot.start_time} - ${slot.end_time}`; // Format time
        const date = appointmentDate; // Get date from dentist_slot

        // Generate confirmation link with appointment ID
        const port = process.env.PORT || 8081; //port
        const confirmationLink = `http://localhost:${port}/appointments/confirm/${newAppointment.id}`;
        const emailContent = transMailBookingNew.template({ doctor: dentist.name, time, date, confirmationLink });
        await sendEmailNormal(customer.email, transMailBookingNew.subject, emailContent);


        return newAppointment;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw new Error('Failed to create appointment');
    }
};


const confirmAppointment = async (appointmentId) => {
    try {
        // Find the appointment
        const appointment = await db.appointment.findByPk(appointmentId);

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        // Update the appointment status to 'Confirmed'
        appointment.status = 'Confirmed';
        await appointment.save();

        // Increase current_patients in dentist_slot by 1
        const dentistSlot = await db.dentist_slot.findByPk(appointment.slot_id);
        if (dentistSlot) {
            dentistSlot.current_patients += 1;
            await dentistSlot.save();
        }

        return appointment;
    } catch (error) {
        throw new Error('Error confirming appointment');
    }
};

const createReappointment = async (appointmentId, periodicInterval, reappointmentCount) => {
    try {
        // Fetch the original appointment to get necessary details
        const appointment = await db.appointment.findByPk(appointmentId, {
            include: [
                {
                    model: db.slot,
                    as: 'slot',
                    include: [
                        {
                            model: db.dentist_slot,
                            as: 'dentist_slots',
                        }
                    ],
                },
                {
                    model: db.user,
                    as: 'customer',
                },
                {
                    model: db.user,
                    as: 'dentist',
                },
                {
                    model: db.service,
                    as: 'service',
                },
                {
                    model: db.clinic,
                    as: 'clinic',
                },
            ],
        });

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        const { slot, customer, dentist, service, clinic } = appointment;

        // Calculate the reappointment dates
        const reappointmentDates = [];
        const dentistSlots = slot.dentist_slots; // Ensure to get all dentist_slots related to the slot

        // Start from the beginning of the day
        let currentDate = momenttime.tz(dentistSlots[0].date, 'Asia/Ho_Chi_Minh').startOf('day');
        currentDate.add(periodicInterval, 'days');


        for (let i = 0; i < reappointmentCount; i++) {
            reappointmentDates.push(currentDate.clone()); // Use clone to prevent modification of original moment object
            currentDate.add(periodicInterval, 'days');
        }

        // Create reappointments and schedule dentist slots
        const createdReappointments = await Promise.all(reappointmentDates.map(async (date) => {
            const currentDateTime = momenttime().format('YYYY-MM-DD HH:mm:ss');

            // Create reappointment
            const reappointment = await db.reappointment.create({
                customer_id: customer.id,
                dentist_id: dentist.id,
                clinic_id: clinic.id,
                service_id: service.id,
                slot_id: slot.id,
                reappointment_date: db.sequelize.literal(`CONVERT(datetime, '${currentDateTime}', 120)`),
                periodic_interval: periodicInterval,
                status: 'Confirmed',
                reappointment_count: reappointmentCount,
            });

            // Schedule dentist slot (check and create if not exist)
            const formattedDate = date.format('YYYY-MM-DD');
            const existingSlot = await db.dentist_slot.findOne({
                where: {
                    dentist_id: dentist.id,
                    slot_id: slot.id,
                    date: formattedDate, // Only check for date without time part
                }
            });

            if (existingSlot) {
                // If slot exists, update current_patients by incrementing by 1
                await existingSlot.increment('current_patients');
            }

            if (!existingSlot) {
                // Create new dentist_slot if not exist
                await db.dentist_slot.create({
                    dentist_id: dentist.id,
                    slot_id: slot.id,
                    date: formattedDate, // Use the new calculated date
                    current_patients: 1, // Assuming initial patients count is 1
                });
            }

            return reappointment;
        }));

        return createdReappointments;
    } catch (error) {
        console.error('Error in createReappointment service:', error);
        throw new Error('Failed to create reappointment');
    }
};


module.exports = {
    createAppointment,
    confirmAppointment,
    createReappointment
};
