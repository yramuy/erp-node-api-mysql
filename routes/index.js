const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employeeController");
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

router.get("/employees", verifyToken, employeeController.getEmployees);
router.get(
  "/employeeByID/:id",
  verifyToken,
  employeeController.getEmployeeByID,
);
router.post("/login", authController.login);

module.exports = router;
