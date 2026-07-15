const express = require("express");
const db = require("./db");
const bcrypt = require("bcrypt");

const routes = require('./routes');

const app = express();
app.use(express.json());

// single route entry
app.use('/api', routes);

app.listen(3000, () => {
  console.log("Server started");
});
