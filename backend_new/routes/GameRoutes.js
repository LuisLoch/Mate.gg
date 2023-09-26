const express = require("express");
const router = express.Router();

//controller
const { getGameList, getGameUserInfo } = require("../controllers/GameController");

//routes
router.get("/", getGameList);
router.get("/:gameId", getGameUserInfo);

module.exports = router;