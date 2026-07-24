const db = require("../db");

const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.getDynamicScreenFields = async (moduleId, screenId) => {
  try {
    const sql = `
      SELECT 
        df.*,
        c.name AS control_type
      FROM erp_dynamic_form_fields df
      LEFT JOIN erp_controls c ON df.control_id = c.id
      WHERE df.module_id = ?
        AND df.screen_id = ?
        AND df.is_active = 1
      ORDER BY df.order_by ASC
    `;

    const results = await queryAsync(sql, [moduleId, screenId]);

    const output = [];
    for (const value of results) {
      output.push({
        id: value.id,
        module_id: value.module_id,
        control_id: value.control_id,
        label_name: value.label_name,
        field_name: value.field_name,
        master_entity_id: value.master_entity_id,
        is_mandatory: value.is_mandatory,
        is_display: value.is_display,
        role_id: value.role_id,
        is_enable: value.is_enable,
        is_active: value.is_active,
        control_type: value.control_type,
        control_value: value.field_name === "employee_id" ? await exports.getEmployeeLastID() : "",
        entity_data: value.master_entity_id ? await exports.getEntityMasterData(value.master_entity_id) : [],
        order_by: value.order_by
      });
    }

    return output;
  } catch (error) {
    throw new Error("Failed to fetch dynamic screen fields");
  }
};

exports.getEntityMasterData = async (id) => {
  try {
    const sql = `
      SELECT *
      FROM erp_master_entity
      WHERE id = ?
        AND is_active = 1
    `;

    const result = await queryAsync(sql, [id]);

    if (!result || result.length === 0) {
      return [];
    }

    const entityRow = result[0];
    const entity = await exports.getEntityDataByTableName(entityRow.master_table, entityRow.id);

    return entity;
  } catch (error) {
    throw new Error("Failed to fetch entity master data");
  }
};

exports.getEntityDataByTableName = async (table, id) => {
  try {
    let sql = `SELECT * FROM ??`;
    const params = [table];

    // if (String(id) === "4") {
    //   sql += ` WHERE parent_id = ?`;
    //   params.push(0);
    // }

    const result = await queryAsync(sql, params);

    return result.map((value) => ({
      id: value.id,
      name: value.name
    }));
  } catch (error) {
    throw new Error("Failed to fetch entity data by table name");
  }
};

exports.getEmployeeLastID = async () => {
  try {
    const sql = `
      SELECT employee_id
      FROM hs_hr_employee
      WHERE employee_id IS NOT NULL
      ORDER BY id DESC
      LIMIT 1
    `;

    const result = await queryAsync(sql);

    if (!result || result.length === 0) {
      return "";
    }

    return result[0].employee_id;
  } catch (error) {
    throw new Error("Failed to fetch last employee ID");
  }
};

exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        u.id AS user_id,
        u.user_role_id,
        ur.name AS role_name,
        u.user_name,
        e.emp_number,
        CONCAT(e.emp_firstname,' ',e.emp_lastname) AS fullName 
      FROM erp_user u 
      LEFT JOIN hs_hr_employee e ON u.emp_number = e.emp_number 
      LEFT JOIN erp_user_role ur ON ur.id = u.user_role_id
      WHERE deleted = 0 
        AND status = 1 
        AND e.termination_id IS NULL
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return reject(new Error("Failed to fetch users"));
      }

      if (results.length === 0) {
        return reject(new Error("User not found"));
      }

      resolve(results);
    });
  });
};

exports.getLevel2Menus = (roleId, parentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT
          m.id,
          m.menu_title,
          m.screen_id,
          m.parent_id,
          m.level,
          m.order_hint,
          m.url_extras
      FROM erp_menu_item m
      INNER JOIN erp_user_role_screen urs
          ON m.screen_id = urs.screen_id
      WHERE urs.user_role_id = ?
        AND urs.can_read = 1
        AND m.parent_id = ?
        AND m.level = 2
        AND m.status = 1
      ORDER BY m.order_hint
    `;

    db.query(sql, [roleId, parentId], async (err, results) => {
      if (err) {
        return reject(new Error("Failed to fetch level 2 menus"));
      }

      for (const menu of results) {
        menu.children = await exports.getLevel3Menus(roleId, menu.id);
      }

      resolve(results);
    });
  });
};

exports.getLevel3Menus = (roleId, parentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT
        m.id,
        m.menu_title,
        m.screen_id,
        m.parent_id,
        m.level,
        m.order_hint,
        m.url_extras,
        m.menu_icon,
        s.name,
        s.action_url
      FROM erp_menu_item m
      INNER JOIN erp_user_role_screen urs
          ON m.screen_id = urs.screen_id
      INNER JOIN erp_screen s
          ON m.screen_id = s.id
      WHERE urs.user_role_id = ?
        AND urs.can_read = 1
        AND m.parent_id = ?
        AND m.level = 3
        AND m.status = 1
      ORDER BY m.order_hint
    `;

    db.query(sql, [roleId, parentId], (err, results) => {
      if (err) {
        return reject(new Error("Failed to fetch level 3 menus"));
      }

      resolve(results);
    });
  });
};