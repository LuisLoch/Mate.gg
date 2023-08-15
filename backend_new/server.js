require("dotenv").config();

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

//config JSON and form data response
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//cors
app.use(cors({credentials: true, origin: "http://localhost:3000"}));

//uploads
app.use("./uploads", express.static(path.join(__dirname, "/uploads")));

//dbconnection
require("./config/db.js");

//routes
const router = require("./routes/Router.js");
app.use(router);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server initialized on port ${port}`);
});