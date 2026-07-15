const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "192.168.235.39",
  user: "entreplan",
  password: "Pr0duction@39",
  database: "test",
});

db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;
