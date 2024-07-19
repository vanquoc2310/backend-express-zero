require('dotenv').config();
const { tranForgotPassword } = require('../../lang/eng');
const { sendEmailNormal } = require('../config/mailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const db = require("./../models");
const moment = require('moment-timezone');




let findUserByEmail = async (userEmail) => {
  try {
    // Tìm người dùng theo email
    const user = await db.user.findOne({ where: { email: userEmail } });
    if (!user) {
      console.log('User not found');
      return null;
    }

    // Trả về người dùng nếu xác thực thành công
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

const findUserByPhoneNumber = async (phoneNumber) => {
  try {
    // Tìm người dùng theo email
    const user = await db.user.findOne({ where: { phonenumber: phoneNumber } });
    if (!user) {
      console.log('User not found');
      return null;
    }

    // Trả về người dùng nếu xác thực thành công
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};


const sendVerificationEmail = async (User) => {
  console.log(User.name);
  const port = process.env.PORT || 8081; //port
  const url = `http://localhost:${port}/api/auth/verify/${User.id}`;

  const subject = 'Verify your email';
  const htmlContent = `
      <p>Hello ${User.name},</p>
      <p>Thank you for registering with us. Please click the link below to verify your email:</p>
      <p><a href="${url}">Verify Email</a></p>
    `;

  try {
    sendEmailNormal(User.email, subject, htmlContent);
    console.log('Email sent successfully');
  } catch (error) {
    console.log('Error sending email:', error);
  }
};


const createPasswordResetLink = async (email) => {
  try {
    const user = await db.user.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
    await user.save();

    const frontendPort = 3000; // Frontend port
    const linkVerify = `http://localhost:${frontendPort}/forgetpassword2?token=${token}&email=${email}`;
    console.log(linkVerify);
    return linkVerify;
  } catch (error) {
    throw new Error(error.message);
  }
}

const resetPassword = async (email, linkVerify) => {
  try {
    await sendEmailNormal(email, tranForgotPassword.subject, tranForgotPassword.template(linkVerify));
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw new Error('Email sending failed'); // Ném ra lỗi khi gửi email thất bại
  }
}

const verifyResetToken = async (email, token) => {
  try {
    const user = await db.user.findOne({ where: { email, resetPasswordToken: token, resetPasswordExpires: { [Op.gt]: Date.now() } } });
    if (!user) {
      throw new Error('Token is invalid or has expired');
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

const setNewPassword = async (email, password) => {
  try {
    const user = await db.user.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

  } catch (error) {
    throw new Error(error.message);
  }
}

const findUserById = async (userId) => {
  try {
    // Tìm người dùng theo id
    const user = await db.user.findOne({ where: { id: userId } });
    if (!user) {
      console.log('User not found');
      return null;
    }

    // Trả về người dùng nếu xác thực thành công
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}


// const getInfoDoctors = async () => {
//   try {
//     const topDentists = await db.user.findAll({
//       where: {role_id: 3},
//       include: [
//         {
//           model: db.appointment,
//           as: 'dentist_appointments',
//           where: { status: 'completed' },
//           attributes: []
//         },
//         {
//           model: db.dentist_info,
//           as: 'dentist_info',
//           attributes: ['degree', 'description', 'actived_date']
//         }
//       ],
//       attributes: [
//         'id', 
//         'name', 
//         [db.sequelize.fn('COUNT', db.sequelize.col('dentist_appointments.id')), 'completed_appointments_count']
//       ],
//       group: ['user.id', 'dentist_info.id'],
//       order: [[db.sequelize.literal('completed_appointments_count'), 'DESC']],
//       limit: 6,
//     });

//     return topDentists;
//   } catch (error) {
//     console.error('Error fetching top dentists:', error);
//     throw error;
//   }
// };


const getDoctorById = async (id) => {
  try {
    const doctor = await db.user.findOne({
      where: { id: id, role_id: 3 },
      include: [
        {
          model: db.dentist_info,
          as: 'dentist_info',
          include: [
            {
              model: db.clinic,
              as: 'clinic',
              attributes: ['id', 'name'],
              include: [
                {
                  model: db.clinic_service,
                  as: 'clinic_services',
                  include: [
                    {
                      model: db.service,
                      as: 'service'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return doctor;
  } catch (error) {
    throw error;
  }
};

async function getTopDentists() {
  try {
    const topDentistsQuery = `
      SELECT TOP 6
        u.id AS dentist_id,
        u.name,
        u.email,
        u.image,
        COUNT(a.id) AS completed_appointments,
        CAST(di.degree AS NVARCHAR(MAX)) AS degree,
        CAST(di.description AS NVARCHAR(MAX)) AS description,
        c.name AS clinic_name
      FROM appointment a
      JOIN "user" u ON a.dentist_id = u.id
      JOIN dentist_info di ON u.id = di.dentist_id
      JOIN clinic c ON di.clinic_id = c.id
      WHERE a.status = 'completed' AND u.role_id = 3
      GROUP BY u.id, u.name, u.email, u.image, CAST(di.degree AS NVARCHAR(MAX)), CAST(di.description AS NVARCHAR(MAX)), c.id, c.name
      ORDER BY completed_appointments DESC;
    `;

    const topDentists = await db.sequelize.query(topDentistsQuery, {
      type: db.sequelize.QueryTypes.SELECT
    });

    return topDentists;
  } catch (error) {
    console.error('Error fetching top dentists:', error);
  }
}

const getHistoryResult = async (customerId) => {
  try {
    const history = await db.examination_result.findAll({
      where: { customer_id: customerId },
      attributes: ['id', 'result', 'result_date', 'hasFeedback'],
      include: [
        {
          model: db.appointment,
          as: 'appointment',
          attributes: ['id', 'clinic_id', 'slot_id', 'dentist_id'],
          required: false,
          include: [
            {
              model: db.slot,
              as: 'slot',
              attributes: ['start_time', 'end_time'], // Lấy các thuộc tính start_time và end_time của slot
            },
            {
              model: db.user,
              as: 'dentist',
              attributes: ['name'], // Chỉ lấy trường name của bác sĩ
            },
            {
              model: db.clinic,
              as: 'clinic',
              attributes: ['name'], // Chỉ lấy trường name của clinic
            },
          ],
        },
        {
          model: db.reappointment,
          as: 'reappointment',
          attributes: ['clinic_id', 'slot_id', 'dentist_id'],
          required: false,
          include: [
            {
              model: db.slot,
              as: 'slot',
              attributes: ['start_time', 'end_time'], // Lấy các thuộc tính start_time và end_time của slot
            },
            {
              model: db.user,
              as: 'dentist',
              attributes: ['name'], // Chỉ lấy trường name của bác sĩ
            },
            {
              model: db.clinic,
              as: 'clinic',
              attributes: ['name'], // Chỉ lấy trường name của clinic
            },
          ],
        },
        {
          model: db.feedback,
          as: 'feedback',
          attributes: ['id', 'rating', 'feedback_text'], // Lấy các thuộc tính của feedback
          required: false,
        },
      ],
      order: [['result_date', 'DESC']],
    });

    // Định dạng lại result_date trước khi trả về
    const formattedHistory = history.map(entry => ({
      ...entry.toJSON(),
      result_date: new Date(entry.result_date).toLocaleString('en-US', { timeZone: 'UTC' }) // Định dạng theo yêu cầu
    }));

    return formattedHistory;
  } catch (error) {
    console.error('Error fetching patient history:', error);
    throw new Error('Failed to fetch patient history');
  }
};



const createFeedback = async (feedbackData) => {
  try {
    const { customer_id, rating, feedback_text, examination_result_id } = feedbackData;

    // Chuyển đổi ngày giờ thành định dạng không có múi giờ
    const feedback_date = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');

    console.log("Formatted Feedback Date:", feedback_date); // Debug line to check formatted date

    const newFeedback = await db.feedback.create({
      customer_id,
      rating,
      feedback_text,
      feedback_date: db.sequelize.literal(`CONVERT(datetime, '${feedback_date}', 120)`),
      examination_result_id
    });

    return newFeedback;
  } catch (error) {
    console.error("Error in createFeedback:", error); // Debug line to log the error
    throw error;
  }
}

const getPatientAppointments = async (userId) => {
  try {
    // Fetch all appointments for the patient
    const appointments = await db.appointment.findAll({
      where: {
        customer_id: userId,
        status: 'Confirmed'
      },
      include: [
        {
          model: db.clinic,
          as: 'clinic',
          attributes: ['id', 'name']
        },
        {
          model: db.user,
          as: 'dentist',
          attributes: ['id', 'name']
        },
        {
          model: db.service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: db.slot,
          as: 'slot',
          attributes: ['id', 'start_time', 'end_time']
        }
      ],
      attributes: ['id', 'appointment_date'],
    });

    // Fetch all reappointments for the patient
    const reappointments = await db.reappointment.findAll({
      where: {
        customer_id: userId,
      },
      include: [
        {
          model: db.clinic,
          as: 'clinic',
          attributes: ['id', 'name']
        },
        {
          model: db.user,
          as: 'dentist',
          attributes: ['id', 'name']
        },
        {
          model: db.service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: db.slot,
          as: 'slot',
          attributes: ['id', 'start_time', 'end_time']
        }
      ],
      attributes: ['id', 'reappointment_date'],
    });

    // Combine both appointments and reappointments into a single array
    const allAppointments = [...appointments, ...reappointments];

    // Initialize an array to hold the final results
    const result = [];

    for (const app of allAppointments) {
      const date = app.appointment_date || app.reappointment_date;

      result.push({
        type: app instanceof db.appointment ? 'appointment' : 'reappointment',
        id: app.id,
        clinic: app.clinic,
        dentist: app.dentist,
        service: app.service,
        slot: app.slot,
        date: moment(date).format('YYYY-MM-DD'), // Format date if needed
      });
    }

    // Return the result array
    return result;
  } catch (error) {
    console.error('Error fetching appointments for patient:', error);
    throw error;
  }
};

const blacklist = [];

const logout = (token) => {
  blacklist.push(token);
};

const isTokenBlacklisted = (token) => {
  return blacklist.includes(token);
};

module.exports = {
  findUserByEmail,
  resetPassword,
  setNewPassword,
  sendVerificationEmail,
  createPasswordResetLink,
  verifyResetToken,
  findUserById,
  //getInfoDoctors, 
  getDoctorById,
  findUserByPhoneNumber,
  getTopDentists,
  getHistoryResult,
  createFeedback,
  getPatientAppointments,
  logout,
  isTokenBlacklisted,
}

