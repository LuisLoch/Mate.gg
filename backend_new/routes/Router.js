const express = require("express");
const router = express();

router.use("/api/users", require("./UserRoutes"))
router.use("/api/games", require("./GameRoutes"))

module.exports = router;