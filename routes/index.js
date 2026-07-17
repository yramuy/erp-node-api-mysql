const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employeeController");
const authController = require("../controllers/authController");
const menuController = require("../controllers/menuController");
const verifyToken = require("../middleware/auth");

router.post("/login", authController.login);

router.get(
  "/menus/:id",
  verifyToken,
  menuController.getLevel1Menus,
);

router.get("/subMenus/:roleId/:parentId", verifyToken, menuController.getLevel2Menus);

router.get("/employees", verifyToken, employeeController.getEmployees);
router.get(
  "/employeeByID/:id",
  verifyToken,
  employeeController.getEmployeeByID,
);


module.exports = router;
