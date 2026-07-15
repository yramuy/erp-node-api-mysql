const db = require("../db");

exports.getAllEmployees = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        emp_number,
        employee_id,
        CONCAT(emp_firstname, ' ', emp_lastname) AS full_name,
        emp_street1,
        emp_street2,
        city_code,
        emp_mobile,
        emp_work_email
      FROM hs_hr_employee
      WHERE termination_id IS NULL
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return reject(new Error("Failed to fetch employees"));
      }

      resolve(results);
    });
  });
};

exports.getEmployeeByID = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        emp_number,
        employee_id,
        CONCAT(emp_firstname, ' ', emp_lastname) AS full_name,
        emp_street1,
        emp_street2,
        city_code,
        emp_mobile,
        emp_work_email
      FROM hs_hr_employee
      WHERE emp_number = ? AND termination_id IS NULL
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return reject(new Error("Failed to fetch employees"));
      }

      if (results.length === 0) {
        return reject(new Error("Employee not found"));
      }

      resolve(results[0]);
    });
  });
};
