const db = require('../models');
const moment = require('moment');
const { transMailBookingNew } = require('../../lang/eng');
const { sendEmailNormal, sendEmailWithAttachment } = require('../config/mailer');
const momenttime = require('moment-timezone');
const appointment = require('../models/appointment');
const PDFDocument = require('pdfkit');
const fs = require('fs');





const createAppointment = async (customerId, clinicId, dentistId, serviceId, slotId, appointmentDate) => {
    try {
        // Check if the dentist has a slot on the specified date
        let existingSlot = await db.dentist_slot.findOne({
            where: {
                dentist_id: dentistId,
                date: appointmentDate,
                slot_id: slotId
            }
        });

        // If the slot does not exist, create a new one
        if (!existingSlot) {
            existingSlot = await db.dentist_slot.create({
                dentist_id: dentistId,
                slot_id: slotId,
                date: appointmentDate,
                current_patients: 0 // Initialize current_patients as 0
            });
        }

        if (existingSlot.current_patients >= 3) throw new Error('Slot is full');

        // Create a new appointment with status 'Pending'
        const newAppointment = await db.appointment.create({
            customer_id: customerId,
            clinic_id: clinicId,
            status: 'Pending',
            dentist_id: dentistId,
            service_id: serviceId,
            slot_id: slotId,
            appointment_date: db.sequelize.literal(`CONVERT(datetime, '${appointmentDate}', 120)`)
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
        const appointmentDate = moment(appointment.appointment_date); // Convert to moment.js object
        const dentistSlot = await db.dentist_slot.findOne({
            where: {
                dentist_id: appointment.dentist_id,
                date: appointmentDate.format('YYYY-MM-DD'), // Format the date for comparison
                slot_id: appointment.slot_id
            }
        });

        if (dentistSlot) {
            dentistSlot.current_patients += 1;
            await dentistSlot.save();
        }

        return appointment;
    } catch (error) {
        console.log(error);
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

        // Start from the last reappointment date or appointment date + 30 days
        let currentDate = moment.tz(appointment.appointment_date, 'Asia/Ho_Chi_Minh').endOf('day').add(30, 'days').startOf('day');

        // Calculate the reappointment dates
        const reappointmentDates = [];

        for (let i = 0; i < reappointmentCount; i++) {
            reappointmentDates.push(currentDate.clone()); // Use clone to prevent modification of original moment object
            currentDate.add(periodicInterval, 'days');
        }

        const currentDate1 = moment().format('YYYY-MM-DD');
        const pdfFilename = `reappointments_${clinic.name}_${currentDate1}.pdf`;
        const pdfPath = `C:/Users/84868/Downloads/reappointments/reappointment_${appointmentId}_${currentDate1}.pdf`;

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(pdfPath);

        doc.pipe(stream);

        // Write PDF content
        doc.fontSize(14).text('Reappointment Details', { align: 'center' }).moveDown(0.5);

        reappointmentDates.forEach((date, index) => {
            doc.fontSize(12).text(`Reappointment ${index + 1}`, { underline: true }).moveDown(0.5);
            doc.fontSize(10).text(`Customer: ${customer.name}`);
            doc.fontSize(10).text(`Dentist: ${dentist.name}`);
            doc.fontSize(10).text(`Clinic: ${clinic.name}`);
            doc.fontSize(10).text(`Service: ${service.name}`);
            doc.fontSize(10).text(`Reappointment Date: ${moment(date).format('YYYY-MM-DD')}`);
            doc.fontSize(10).text(`Time: ${slot.start_time} - ${slot.end_time}\n`);
            doc.moveDown(1);
        });

        // Finalize PDF
        doc.end();

        // Send email with attachment
        const emailSubject = 'Your Reappointment Details';
        const emailContent = `Dear ${customer.name},\n\nYour reappointment details are attached.`;

        try {
            await sendEmailWithAttachment(customer.email, emailSubject, emailContent, pdfFilename, pdfPath);
        } catch (error) {
            console.error('Error sending reappointment email:', error);
            // Handle email sending error here
        }

        return pdfPath;
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
