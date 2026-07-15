const authService = require("../services/authService");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Validation
    if (!username || !password) {
      return res.status(400).json({
        status: false,
        message: "Username and password are required",
      });
    }

    const data = await authService.loginUser(username, password);

    res.json({
      status: true,
      message: "Login successfully",
      userData: data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
