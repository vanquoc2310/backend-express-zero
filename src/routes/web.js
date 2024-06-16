const express = require('express');
const router = express.Router();
const { login, register, verifyEmail, requestPasswordReset, resetPassword  } = require('../controllers/authController');


// Route xử lý đăng nhập
router.post('/login', login);
router.post('/register', register);
router.get('/verify/:userId', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
//router.get('/reset-password', showResetPasswordForm); // Trang form để nhập mật khẩu mới
router.post('/reset-password', resetPassword);


module.exports = router;