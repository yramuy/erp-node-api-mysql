const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key"; // 👉 move to .env later

exports.loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM erp_user WHERE user_name = ? LIMIT 1";

    db.query(sql, [username], async (err, results) => {
      if (err) {
        return reject(new Error("Database error"));
      }

      // User not found
      if (results.length === 0) {
        return reject(new Error("User not found"));
      }

      const user = results[0];

      // ✅ Verify password (bcrypt)
      const hash = user.user_password.replace(/^\$2y\$/, "$2b$");

      const isMatch = await bcrypt.compare(password.trim(), hash);

      console.log("Entered Password:", `"${password}"`);
      // console.log("Stored Hash123:", `"${hash}"`);
      // console.log("Hash starts with:", user.user_password.substring(0, 4));
      // console.log("Hash length:", user.user_password.length);

      console.log("Password Match:", isMatch);

      if (!isMatch) {
        return reject(new Error("Invalid username or password12345"));
      }

      // ✅ Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.user_name,
        },
        SECRET_KEY,
        { expiresIn: "1h" },
      );

      // ✅ Return safe user data
      resolve({
        userId: user.id,
        username: user.user_name,
        emp_number: user.emp_number,
        user_role_id: user.user_role_id,
        token: token,
      });
    });
  });
};
