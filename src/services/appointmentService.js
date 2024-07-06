const db = require('../models');
const moment = require('moment');
const { transMailBookingNew } = require('../../lang/eng');
const { sendEmailNormal } = require('../config/mailer');


const createAppointment =  async (customerId, clinicId, dentistId, serviceId, slotId, appointmentDate) => {
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

module.exports = {
    createAppointment,
    confirmAppointment
};
