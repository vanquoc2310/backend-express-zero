const userService = require('../services/userService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/').user;
const db = require("./../models");


const register = async (req, res) => {
  try {
    const { name, email, phonenumber, password, } = req.body;
    console.log(name, email, password, phonenumber);

    const hashedPassword = await bcrypt.hash(password, 10); // Băm mật khẩu

    console.log(hashedPassword);

    const newUser = await User.create({
      name,
      email,
      phonenumber,
      password: hashedPassword,
      role_id: 2,
    });

    await userService.sendVerificationEmail(newUser);

    res.status(201).json({ message: 'User registered, please check your email to verify your account.' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).json({ error: 'Error registering user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;

    // Check if the identifier is an email or phone number
    if (/\S+@\S+\.\S+/.test(email)) {
      // It's an email
      user = await userService.findUserByEmail(email);
    } else {
      // It's a phone number
      user = await userService.findUserByPhoneNumber(email);
    }

    if (!user) {
      return res.status(400).json({ error: 'Email or phone number does not exist' });
    }
    const isMatch = await bcrypt.compare(password, user.password); // So sánh mật khẩu

    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }

    if (!user.status) {
      return res.status(400).json({ error: 'Account is not actived' });
    }

    let clinicId = null;
    let additionalPayload = {};

    if (user.role_id === 3 || user.role_id === 2 || user.role_id === 1) {
      additionalPayload.name = user.name;
    } else if (user.role_id === 4) {
      // Clinic owner
      additionalPayload.name = user.name;
      additionalPayload.image = user.image;
      const clinic = await db.clinic.findOne({ where: { clinic_owner_id: user.id } });
      if (clinic) {
        clinicId = clinic.id;
      }
    }

    const payload = {
      userId: user.id,
      role: user.role_id,  // Assuming role_id represents the role of the user
      clinicId: clinicId,
      ...additionalPayload,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {});
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Error logging in' });
  }
};

const verifyEmail = async (req, res) => {
  const { userId } = req.params;  // Lấy userId từ URL
  try {
    // Tìm người dùng trong cơ sở dữ liệu bằng userId
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });  // Không tìm thấy người dùng
    }

    // Cập nhật trạng thái của người dùng thành true để xác thực email
    await user.update({ status: true });

    // Trả về phản hồi thành công
    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const linkVerify = await userService.createPasswordResetLink(email);
    await userService.resetPassword(email, linkVerify);
    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    const user = await userService.verifyResetToken(email, token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    await userService.setNewPassword(email, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

const logout = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);  // Nếu không có token, trả về Unauthorized

  userService.logout(token);  // Thêm token vào blacklist

  res.json({ message: 'Logged out successfully' });
};


module.exports = {
  login,
  register,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout,
};
