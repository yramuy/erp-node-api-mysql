const db = require("../db");

exports.saveAndUpdate = async (selectedScreenID, formData) => {
  if (
    !formData ||
    typeof formData !== "object" ||
    Array.isArray(formData) ||
    Object.keys(formData).length === 0
  ) {
    throw new Error("Form data is required");
  }

  // // Get table name
  // const tableResult = await queryAsync(
  //   `SELECT table_name
  //    FROM erp_screen_tables
  //    WHERE screen_id = ?
  //      AND is_active = 1
  //    LIMIT 1`,
  //   [selectedScreenID],
  // );

  // if (tableResult.length === 0) {
  //   throw new Error("Table mapping not found for selected screen");
  // }

  const tableName = await exports.getTableName(selectedScreenID);

  if (!isValidIdentifier(tableName)) {
    throw new Error("Invalid table name");
  }

  // Validate column names
  const columns = Object.keys(formData);

  const invalidColumns = columns.filter((column) => !isValidIdentifier(column));

  if (invalidColumns.length > 0) {
    throw new Error(`Invalid column names: ${invalidColumns.join(", ")}`);
  }

  // Get ID
  const id = formData.id;

  // =====================================================
  // UPDATE
  // =====================================================
  if (id) {
    // Remove id from SET data
    const updateData = { ...formData };
    delete updateData.id;

    if (Object.keys(updateData).length === 0) {
      throw new Error("No fields available for update");
    }

    const sql = "UPDATE ?? SET ? WHERE id = ?";

    const result = await queryAsync(sql, [tableName, updateData, id]);

    return {
      id: id,
      table_name: tableName,
      fields: updateData,
      action: "update",
      affectedRows: result.affectedRows,
    };
  }

  // =====================================================
  // INSERT
  // =====================================================
  const sql = "INSERT INTO ?? SET ?";

  const result = await queryAsync(sql, [tableName, formData]);

  return {
    id: result.insertId,
    table_name: tableName,
    fields: formData,
    action: "insert",
  };
};

exports.getListViewData = async (moduleId, screenId) => {
  const tableName = await exports.getTableName(screenId);

  if (!isValidIdentifier(tableName)) {
    throw new Error("Invalid table name");
  }

  const tableFields = await exports.getTableFields(screenId);

  if (!tableFields || tableFields.length === 0) {
    throw new Error("No fields configured for this screen");
  }

  // Get configured database columns
  const columns = tableFields
    .map((field) => field.tr_name)
    .filter(Boolean);

  // Validate columns
  columns.forEach((column) => {
    if (!isValidIdentifier(column)) {
      throw new Error(`Invalid column name: ${column}`);
    }
  });

  // Main table columns
  const selectColumns = columns.map((col) => `t.${col}`);

  const joins = [];

  /*
   * Module Name
   */
  if (columns.includes("module_id")) {
    selectColumns.push("m.name AS module_name");

    joins.push(`
      LEFT JOIN erp_module m
        ON t.module_id = m.id
    `);
  }

  /*
   * Screen Name
   */
  if (columns.includes("screen_id")) {
    selectColumns.push("s.name AS screen_name");

    joins.push(`
      LEFT JOIN erp_screen s
        ON t.screen_id = s.id
    `);
  }

  /*
   * Parent Menu Name
   */
  if (columns.includes("parent_id")) {
    selectColumns.push("pm.menu_title AS parent_name");

    joins.push(`
      LEFT JOIN erp_menu_item pm
        ON t.parent_id = pm.id
    `);
  }

  const sql = `
    SELECT
      ${selectColumns.join(", ")}
    FROM ?? t
    ${joins.join("\n")}
  `;

  const result = await queryAsync(sql, [tableName]);

  /*
   * Create dynamic table headers.
   *
   * The header is generated from the actual fields
   * returned by the SQL query.
   */
  const tableHeaders = Object.keys(result[0] || {}).map((key) => {

    // Check whether the field exists in configured table fields
    const configuredField = tableFields.find(
      (field) => field.tr_name === key
    );

    // If configured, use configured th_name
    if (configuredField) {
      return {
        th_name: configuredField.th_name,
      };
    }

    // Otherwise generate display name automatically
    const displayName = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return {
      th_name: displayName,
    };
  });

  return {
    status: true,
    message: "Data fetched successfully",
    data: {
      tableHeaders,
      tableRowData: result,
    },
  };
};

exports.getTableName = async (selectedScreenID) => {
  const result = await queryAsync(
    `SELECT table_name
     FROM erp_screen_tables
     WHERE screen_id = ?
       AND is_active = 1
     LIMIT 1`,
    [selectedScreenID],
  );

  if (!result.length) {
    throw new Error("Table mapping not found for selected screen");
  }

  const tableName = result[0].table_name;

  if (!isValidIdentifier(tableName)) {
    throw new Error("Invalid table name");
  }

  return tableName;
};

exports.getTableFields = async (screenId) => {
  const sql = `
    SELECT
      id,
      th_name,
      tr_name,
      order_by
    FROM erp_dynamic_list_view_fields
    WHERE screen_id = ?
      AND is_active = 1
    ORDER BY order_by ASC
  `;

  const result = await queryAsync(sql, [screenId]);

  if (!result.length) {
    throw new Error("No list view fields found for the selected screen");
  }

  result.forEach((field) => {
    if (!isValidIdentifier(field.tr_name)) {
      throw new Error(`Invalid column name: ${field.tr_name}`);
    }
  });

  return result;
};

const isValidIdentifier = (value) => {
  return typeof value === "string" && /^[a-zA-Z0-9_]+$/.test(value);
};

exports.getViewFields = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        df.id,
        df.module_id,
        df.screen_id,
        df.control_id,
        df.label_name,
        df.field_name,
        df.master_entity_id,
        df.dynamic_form_module_id,
        df.dynamic_form_screen_id,
        CASE 
          WHEN df.is_mandatory = 1 THEN 'Yes'
          ELSE 'No'
        END AS is_mandatory,
        CASE 
          WHEN df.is_display = 1 THEN 'Yes'
          ELSE 'No'
        END AS is_display,
        df.role_id,
        df.is_enable,
        df.order_by,
        df.is_active,
        c.name AS control_type,
        s.name AS screen
      FROM erp_dynamic_form_fields df
      LEFT JOIN erp_controls c ON df.control_id = c.id
      LEFT JOIN erp_screen s ON df.screen_id = s.id
      WHERE df.is_active = 1`;

    db.query(sql, (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return reject(new Error("Failed to fetch fields"));
      }

      if (results.length === 0) {
        return reject(new Error("No fields found"));
      }

      resolve(results);
    });
  });
};

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

exports.getScreenFields = async (moduleId, screenId) => {
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
        control_value:
          value.field_name === "employee_id"
            ? await exports.getEmployeeLastID()
            : "",
        entity_data: value.master_entity_id
          ? await exports.getEntityMasterData(value.master_entity_id)
          : [],
        order_by: value.order_by,
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
    const entity = await exports.getEntityDataByTableName(
      entityRow.master_table,
      entityRow.id,
    );

    return entity;
  } catch (error) {
    throw new Error("Failed to fetch entity master data");
  }
};

exports.getEntityDataByTableName = async (table, id) => {
  try {
    sql = `SELECT * FROM ??`;

    const params = [table];

    const result = await queryAsync(sql, params);

    if (String(table) == "erp_menu_item") {
      return result.map((value) => ({
        id: value.id,
        name: value.menu_title,
      }));
    } else {
      return result.map((value) => ({
        id: value.id,
        name: value.name,
      }));
    }
  } catch (error) {
    console.error("getEntityDataByTableName:", error);
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

exports.getDependanceMaster = async (moduleID) => {
  const sql = `
        SELECT *
        FROM erp_screen
        WHERE module_id = ?
        ORDER BY name
    `;

  const result = await queryAsync(sql, [moduleID]);

  return result.map((item) => ({
    id: item.id,
    name: item.name,
  }));
};
