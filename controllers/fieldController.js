const fieldService = require("../services/fieldService");

exports.insertDynamic = async (req, res) => {
  try {
    const payload = req.body;

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      Object.keys(payload).length === 0
    ) {
      return res.status(400).json({
        status: false,
        message: "A valid payload is required",
      });
    }

    const { selectedScreenID, ...dataPayload } = payload;

    if (!selectedScreenID) {
      return res.status(400).json({
        status: false,
        message: "Screen ID is required",
      });
    }

    // Remove unwanted fields
    if (Number(selectedScreenID) === 717 || Number(selectedScreenID) === 722) {
      delete dataPayload.module_id;
    }

    if (Object.keys(dataPayload).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No data fields provided",
      });
    }

    const data = await fieldService.insertDynamic(
      selectedScreenID,
      dataPayload
    );

    return res.status(201).json({
      status: true,
      message: "Data saved successfully",
      data,
    });
  } catch (error) {
    console.error("saveData error:", error);

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getScreenFields = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const screenId = req.params.screenId;

    const fields = await fieldService.getScreenFields(moduleId, screenId);

    res.json({
      status: true,
      message: "Fields fetched successfully",
      fields: fields,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getScreenFields = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const screenId = req.params.screenId;

    const fields = await fieldService.getScreenFields(moduleId, screenId);

    res.json({
      status: true,
      message: "Fields fetched successfully",
      fields: fields,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getViewFields = async (req, res) => {
  try {
    const fields = await fieldService.getViewFields();

    res.json({
      status: true,
      message: "Fields fetched successfully",
      fields: fields,
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
      menus,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getDependanceMaster = async (req, res) => {
  try {
    const { moduleID } = req.body;

    console.log("Module ID : ", moduleID);

    const data = await fieldService.getDependanceMaster(moduleID);

    res.json({
      status: true,
      message: "Data fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
