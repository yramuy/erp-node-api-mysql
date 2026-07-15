// middleware/auth.js
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      status: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Invalid token format",
    });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: false,
        message: "Invalid or expired token",
      });
    }

    req.user = decoded; // 👈 important
    next();
  });
};

module.exports = verifyToken;