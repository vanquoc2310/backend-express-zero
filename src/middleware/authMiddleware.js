require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);  // Nếu không có token, trả về Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);  // Nếu token không hợp lệ, trả về Forbidden

    req.user = user;  // Lưu thông tin người dùng trong req
    next();
  });
};

module.exports = authenticateToken;
