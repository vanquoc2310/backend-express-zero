const express = require('express');
const router = express.Router();
const { login, register, verifyEmail, requestPasswordReset, resetPassword, logout  } = require('../controllers/authController');


// Route xử lý đăng nhập
router.post('/login', login);
router.post('/register', register);
router.get('/verify/:userId', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/logout', logout)


module.exports = router;