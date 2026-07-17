const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "192.168.235.185",
  port: 3306,
  user: "nodeuser",
  password: "Node@123",
  database: "entreplan_uat"
});

db.connect((err) => {
  if (err) {
    console.error("DB Error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;

// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: "192.168.235.185",
//   port: 3306,
//   user: "nodeuser",
//   password: "Node@123",
//   database: "entreplan_uat"
// });

// // const db = mysql.createConnection({
// //   host: "192.168.235.39",
// //   user: "entreplan",
// //   password: "Pr0duction@39",
// //   database: "entreplan",
// // });

// db.connect((err) => {
//   if (err) {
//     console.error("DB Error:", err);
//   } else {
//     console.log("Connected to MySQL");
//   }
// });

// module.exports = db;