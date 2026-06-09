const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_SECRET = config.JWT_SECRET;

module.exports = function (req, res, next) {
  let token = req.cookies ? req.cookies.token : null;

  // Fallback to Authorization header if cookie is not present
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
  }

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Set user information from token payload
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};
