const express = require("express");
const router = express.Router();

//controller
const {register, login, getCurrentUser, updateUser, getUserById, getCurrentUserGames, updateCurrentUserGame} = require("../controllers/UserController");

//middlewares
const validate = require("../middlewares/handleValidation");
const {userCreateValidation, loginValidation, userUpdateValidation, userUpdateGameValidation} = require("../middlewares/userValidations");
const authGuard = require("../middlewares/authGuard");
const { imageUpload } = require("../middlewares/imageUpload");

//routes
router.get("/games/:id", authGuard, getCurrentUserGames);
router.put("/games/", authGuard, (req, res, next) => {userUpdateGameValidation(req.body.validations)});
router.post("/register", userCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrentUser);
router.put("/", authGuard, userUpdateValidation(), validate, imageUpload.single("photo"), updateUser);
router.get("/:id", getUserById);

module.exports = router;