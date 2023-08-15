const User = require("../models/User");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET

//db
const { getDatabase, ref, query, push, update, onValue, get, remove, child, orderByChild, equalTo, limitToFirst } = require("firebase/database");
const db = require("../config/db")

const authGuard = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  //check if header has a token
  if(!token) return res.status(401).json({errors: ["Acesso negado"]})

  try {
    const verified = jwt.verify(token, jwtSecret);

    const userRef = ref(db, `users/${verified.id}`);
    const userSnapshot = await get(userRef);
    const user = userSnapshot.val();
    delete user.password;
    user.id = verified.id;

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({errors: ["Token inválido."]})
  }
}

module.exports = authGuard;