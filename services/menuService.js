const db = require("../db");

exports.getLevel1Menus = (id) => {
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
        AND m.level = 1
        AND m.status = 1
    ORDER BY m.id
        `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return reject(new Error("Failed to fetch menus"));
      }

      if (results.length === 0) {
        return reject(new Error("Menu not found"));
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
          m.url_extras
      FROM erp_menu_item m
      INNER JOIN erp_user_role_screen urs
          ON m.screen_id = urs.screen_id
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