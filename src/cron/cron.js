// src/cron-jobs.js

const cron = require('node-cron');
const moment = require('moment-timezone');
const db = require('./../models');
const { sendEmailNormal } = require('../config/mailer');

// Function to send reminders at 6:00 AM (Vietnam time)
const sendReminders = async () => {
  try {
    const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    const appointments = await db.appointment.findAll({
      where: {
        appointment_date: today,
        status: 'Confirmed'
      },
      include: [
        { model: db.user, as: 'customer' },
        { model: db.slot, as: 'slot' }
      ]
    });

    for (const appointment of appointments) {
      if (appointment.customer && appointment.customer.email && appointment.slot) {
        const startTime = appointment.slot.start_time;
        const endTime = appointment.slot.end_time;
        const emailText = `Bạn có một cuộc hẹn vào ngày hôm nay, ${today}, từ ${startTime} đến ${endTime}. Vui lòng đến đúng giờ.`;
        await sendEmailNormal(appointment.customer.email, 'Nhắc nhở lịch hẹn', emailText);
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
};

// Function to cancel pending appointments at 12:00 AM (Vietnam time)
const cancelPendingAppointments = async () => {
  try {
    const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    const pendingAppointments = await db.appointment.update(
      { status: 'Cancelled' },
      {
        where: {
          appointment_date: today,
          status: 'Pending'
        }
      }
    );

    console.log(`Updated ${pendingAppointments[0]} pending appointments to cancelled.`);
  } catch (error) {
    console.error('Error in cron job:', error);
  }
};

// Schedule the cron jobs
const runJobs = async () => {
  // Schedule job to run at 6:00 AM daily
  cron.schedule('0 6 * * *', async () => {
    await sendReminders();
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // Schedule job to run at 12:00 AM daily
  cron.schedule('0 0 * * *', async () => {
    await cancelPendingAppointments();
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  console.log('Cron jobs scheduled successfully.');
};

runJobs();
