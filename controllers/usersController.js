const userService = require("../services/userService");

exports.getUsers = async (req, res) => {

    try {

    const users = await userService.getUsers();

    res.json({
      status: true,
      message: "Users fetched successfully",
      users: users
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }

};

exports.getLevel2Menus = async (req, res) => {

  try {

    const roleId = req.params.roleId;
    const parentId = req.params.parentId;

    const menus = await menuService.getLevel2Menus(roleId, parentId);

    res.json({
      status: true,
      message: "Level 2 Menus fetched successfully",
      menus
    });

  } catch (error) {

    res.status(500).json({
      status: false,
      message: error.message
    });

  }

};