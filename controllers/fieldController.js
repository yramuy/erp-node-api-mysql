const fieldService = require("../services/fieldService");

exports.getDynamicScreenFields = async (req, res) => {

    try {

    const moduleId = req.params.moduleId;
    const screenId = req.params.screenId;

    const fields = await fieldService.getDynamicScreenFields(moduleId, screenId);

    res.json({
      status: true,
      message: "Fields fetched successfully",
      fields: fields
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