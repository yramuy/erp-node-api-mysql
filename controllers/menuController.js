const menuService = require("../services/menuService");

exports.getLevel1Menus = async (req, res) => {

    try {
    const id = req.params.id;

    // validation
    if (!id) {
      return res.status(400).json({
        status: false,
        message: 'Role ID is required'
      });
    }

    const menus = await menuService.getLevel1Menus(id);

    res.json({
      status: true,
      message: "Level 1 Menus fetched successfully",
      menus: menus
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