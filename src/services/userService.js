require('dotenv').config();
const { tranForgotPassword } = require('../../lang/eng');
const { sendEmailNormal } = require('../config/mailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const db = require("./../models");




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

const sendVerificationEmail = async (User) => {
  console.log(User.name);
  const url = `http://localhost:8080/api/auth/verify/${User.id}`;

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

    const linkVerify = `http://localhost:8080/api/auth/reset-password?token=${token}&email=${email}`;
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
//     try {
//         // Lấy danh sách bác sĩ có số lượng đặt hẹn thành công
//         const doctors = await db.user.findAll({
//             where: { role_id: 3 },
//             attributes: {
//                 include: [
//                     [db.sequelize.fn('COUNT', db.sequelize.col('appointment.id')), 'countBooking']
//                 ]
//             },
//             include: [
//                 {
//                     model: db.dentist_info,
//                     as: 'dentist_info',
//                     required: false,
//                     include: [{ model: db.clinic, attributes: ['name'] }]
//                 },
//                 {
//                     model: db.appointment,
//                     as: 'appointments',
//                     where: { status: 'successful' },
//                     attributes: []
//                 }
//             ],
//             group: ['user.id', 'dentist_info.id', 'dentist_info->clinic.id'],
//             order: [[db.sequelize.literal('countBooking'), 'DESC']],
//             limit: 6
//         });
//         return doctors;
//     } catch (e) {
//         throw e;
//     }
// };

const getDoctorById = async (id) => {
  try {
      const doctor = await db.user.findOne({
          where: { id: id, role_id: 3 },
          include: [
              {
                  model: db.dentist_info,
                  required: false,
                  include: [{ model: db.clinic, attributes: ['name'] }]
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


module.exports = {
  findUserByEmail,
  resetPassword,
  setNewPassword,
  sendVerificationEmail,
  createPasswordResetLink,
  verifyResetToken,
  findUserById, 
  //getInfoDoctors, 
  getDoctorById
}
