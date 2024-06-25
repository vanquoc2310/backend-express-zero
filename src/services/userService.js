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
                  include: [{ model: db.clinic, as: 'clinic' , attributes: ['name'] }]
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
        COUNT(a.id) AS completed_appointments,
        CAST(di.degree AS NVARCHAR(MAX)) AS degree,
        CAST(di.description AS NVARCHAR(MAX)) AS description,
        c.name AS clinic_name
      FROM appointment a
      JOIN "user" u ON a.dentist_id = u.id
      JOIN dentist_info di ON u.id = di.dentist_id
      JOIN clinic c ON di.clinic_id = c.id
      WHERE a.status = 'completed' AND u.role_id = 3
      GROUP BY u.id, u.name, u.email, CAST(di.degree AS NVARCHAR(MAX)), CAST(di.description AS NVARCHAR(MAX)), c.id, c.name
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
}
