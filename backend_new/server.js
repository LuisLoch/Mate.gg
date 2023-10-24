//General server
require("dotenv").config();

const express = require('express');
const path = require('path');
const cors = require('cors');

const port = process.env.PORT;

const server = express();

//config JSON and form data response
server.use(express.json());
server.use(express.urlencoded({extended: false}));

//cors
server.use(cors({credentials: true, origin: "http://localhost:3000"}));

//uploads
server.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//db connection
require("./config/db.js");

//test route
server.get("/", (req, res) => {
  res.send("API Working!");
});

//routes
const router = require("./routes/Router.js");

server.use(router);

server.listen(port, () => {
  console.log(`Server initialized on port ${port}`);
});