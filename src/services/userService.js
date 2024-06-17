require('dotenv').config();
const { tranForgotPassword } = require('../../lang/eng');
const User = require('../models').User;
const { sendEmailNormal } = require('../config/mailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');



let findUserByEmail = async (userEmail) => {
  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email: userEmail } });
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
    const user = await User.findOne({ where: { email } });
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
    const user = await User.findOne({ where: { email, resetPasswordToken: token, resetPasswordExpires: { [Op.gt]: Date.now() } } });
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
    const user = await User.findOne({ where: { email } });
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
    const user = await User.findOne({ where: { id: userId } });
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

module.exports = {
  findUserByEmail,
  resetPassword,
  setNewPassword,
  sendVerificationEmail,
  createPasswordResetLink,
  verifyResetToken,
  findUserById
}
