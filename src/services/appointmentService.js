const db = require('../models');
const moment = require('moment');
const { transMailBookingSuccess, transMailBookingFailed } = require('../../lang/eng');
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

        // Send confirmation email to the customer
        const slot = await db.slot.findByPk(appointment.slot_id);
        const dentist = await db.user.findByPk(appointment.dentist_id);
        const customer = await db.user.findByPk(appointment.customer_id);
        const clinic = await db.clinic.findByPk(appointment.clinic_id);


        const time = `${slot.start_time} - ${slot.end_time}`; // Format time
        const date = moment(appointment.appointment_date).format('DD-MM-YYYY'); // Get date from appointment

        // Notify customer about appointment confirmation
        const emailSubject = 'Thông báo xác nhận lịch hẹn';
        const emailContent = transMailBookingSuccess.template({
            dentistName: dentist.name,
            time,
            date,
            customerName: customer.name,
            clinicName: clinic.name,
        });

        await sendEmailNormal(customer.email, emailSubject, emailContent);

        return appointment;
    } catch (error) {
        console.error(error);
        throw new Error('Error confirming appointment');
    }
};


const createReappointment = async (type, appointmentId, periodicInterval, reappointmentCount) => {
    let transaction;
    try {
        // Start a transaction
        transaction = await db.sequelize.transaction();
        console.log(appointmentId);

        // Determine which model to query based on the type
        const model = type === 'Appointment' ? db.appointment : db.reappointment;

        console.log(model);

        // Fetch the original appointment or reappointment to get necessary details
        const appointment = await model.findByPk(appointmentId, {
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
            transaction, // Pass transaction to ensure consistency
        });

        if (!appointment) {
            throw new Error(`${type} not found`);
        }

        const { slot, customer, dentist, service, clinic } = appointment;

        // Start from the last reappointment date or appointment date + 30 days
        let currentDate = moment.tz(appointment.appointment_date || appointment.reappointment_date, 'Asia/Ho_Chi_Minh').endOf('day').add(30, 'days').startOf('day');

        // Calculate the reappointment dates
        const reappointmentDates = [];

        for (let i = 0; i < reappointmentCount; i++) {
            reappointmentDates.push(currentDate.clone()); // Use clone to prevent modification of original moment object
            currentDate.add(periodicInterval, 'days');
        }

        // Generate PDF content
        const pdfFilename = `reappointments_${clinic.name}_${moment().format('YYYY-MM-DD')}.pdf`;
        const pdfPath = `C:/Users/84868/Downloads/reappointments/${pdfFilename}`;

        const doc = new PDFDocument({ bufferPages: true });
        const stream = fs.createWriteStream(pdfPath);

        // Embed a font that supports Vietnamese
        doc.registerFont('Arial', 'C:/Windows/Fonts/Arial.ttf');
        doc.font('Arial');

        doc.pipe(stream);

        // Write PDF content
        doc.fontSize(16).text('Chi tiết lịch tái khám', { align: 'center' }).moveDown(0.5);

        reappointmentDates.forEach((date, index) => {
            doc.fontSize(12).text(`Lịch tái khám ${index + 1}`, { underline: true }).moveDown(0.5);
            doc.fontSize(10).text(`Khách hàng: ${customer.name}`);
            doc.fontSize(10).text(`Bác sĩ: ${dentist.name}`);
            doc.fontSize(10).text(`Phòng khám: ${clinic.name}`);
            doc.fontSize(10).text(`Dịch vụ: ${service.name}`);
            doc.fontSize(10).text(`Ngày tái khám: ${moment(date).format('YYYY-MM-DD')}`);
            doc.fontSize(10).text(`Thời gian: ${slot.start_time} - ${slot.end_time}\n`);
            doc.moveDown(1);
        });

        // Thank you note
        doc.fontSize(12).text('Chúng tôi chân thành cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.', { align: 'center' }).moveDown(1);

        // Finalize PDF
        doc.end();

        // Send email with attachment
        const emailSubject = 'Thông tin lịch tái khám của bạn';
        const emailContent = `
            Chào bạn ${customer.name},

            Bạn vừa đặt lịch tái khám tại bệnh viện chúng tôi. Thông tin chi tiết lịch tái khám của bạn đính kèm trong file PDF đính kèm.

            Trân trọng cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.

            Thân ái,
            Đội ngũ Phòng Khám ${clinic.name}
        `;

        try {
            await sendEmailWithAttachment(customer.email, emailSubject, emailContent, pdfFilename, pdfPath);
        } catch (error) {
            console.error('Error sending reappointment email:', error);
            // Handle email sending error here
        }

        // Update the status of the original appointment or reappointment to 'Completed'
        await appointment.update({ status: 'Completed' }, { transaction });

        // Create reappointments and schedule dentist slots
        const createdReappointments = await Promise.all(reappointmentDates.map(async (date) => {
            // Create reappointment
            const reappointment = await db.reappointment.create({
                customer_id: customer.id,
                dentist_id: dentist.id,
                clinic_id: clinic.id,
                service_id: service.id,
                slot_id: slot.id,
                reappointment_date: date.toDate(), // Convert moment object to Date
                periodic_interval: periodicInterval,
                status: 'Confirmed',
                reappointment_count: reappointmentCount,
            }, { transaction });

            // Schedule dentist slot (check and create if not exist)
            const formattedDate = date.format('YYYY-MM-DD');
            const existingSlot = await db.dentist_slot.findOne({
                where: {
                    dentist_id: dentist.id,
                    slot_id: slot.id,
                    date: formattedDate,
                },
                transaction,
            });

            if (existingSlot) {
                await existingSlot.increment('current_patients', { transaction });
            } else {
                await db.dentist_slot.create({
                    dentist_id: dentist.id,
                    slot_id: slot.id,
                    date: formattedDate,
                    current_patients: 1,
                }, { transaction });
            }

            return reappointment;
        }));

        await transaction.commit();

        return createdReappointments;
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error in createReappointment service:', error);
        throw new Error('Failed to create reappointment');
    }
};

const cancelAppointment = async (appointmentId) => {
    try {
        // Find the appointment
        const appointment = await db.appointment.findByPk(appointmentId);

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        // Update the appointment status to 'Cancelled'
        appointment.status = 'Cancelled';
        await appointment.save();

        // Send cancellation email to the customer
        const slot = await db.slot.findByPk(appointment.slot_id);
        const dentist = await db.user.findByPk(appointment.dentist_id);
        const customer = await db.user.findByPk(appointment.customer_id);
        const clinic = await db.clinic.findByPk(appointment.clinic_id);

        const time = `${slot.start_time} - ${slot.end_time}`; // Format time
        const date = moment(appointment.appointment_date).format('DD-MM-YYYY'); // Get date from appointment

        // Notify customer about appointment cancellation
        const emailSubject = 'Thông báo hủy lịch hẹn';
        const emailContent = transMailBookingFailed.template({
            dentistName: dentist.name,
            time,
            date,
            customerName: customer.name,
            clinicName: clinic.name,
            reason: 'Xin lỗi vì sự bất tiện này và mong rằng bạn sẽ sớm đặt lại lịch hẹn khác.' 
        });

        await sendEmailNormal(customer.email, emailSubject, emailContent);

        return appointment;
    } catch (error) {
        console.error(error);
        throw new Error('Error cancelling appointment');
    }
};


module.exports = {
    createAppointment,
    confirmAppointment,
    createReappointment,
    cancelAppointment
};

