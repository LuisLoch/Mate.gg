//model
const User = require("../models/User");

//db
const { ref, query, push, update, get, orderByChild, equalTo } = require("firebase/database");
const db = require("../config/db")

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

const usersRef = ref(db, "users");

//generate user token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
}

//register user and sign in
const register = async(req, res) => {
  const {email, password} = req.body;

  try{
    //check if user email exists
    const emailSnapshot = await get(
      query(usersRef, orderByChild("email"), equalTo(email))
    );

    if (emailSnapshot.exists()) {
      res.status(422).json({ errors: "O email informado já está sendo usado." });
      return;
    }

    //generate password hash
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    //create user
    const newUser = new User(email, passwordHash, "", "", "");

    const newUserRef = push(usersRef, newUser)
    userId = newUserRef.key;
    
    res.status(201).json({
      message: "Usuário criado com sucesso.",
      _id: userId, token:
      generateToken(userId)
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: "Erro interno." });
    return;
  }
};

//sign user in
const login = async (req, res) => {
  const {email, password} = req.body;

  //check if user email exists
  const snapshot = await get(
    query(usersRef, orderByChild("email"), equalTo(email))
  );
  
  //check if user exists
  if(!snapshot.exists()) {
    res.status(404).json({errors: ["Usuário não encontrado."]});
    return;
  }

  const user = Object.values(snapshot.val())[0];

  //check if password matches
  if(!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({errors: ["Senha inválida."]});
    return;
  }

  //return user with token
  res.status(201).json({
    _id: Object.keys(snapshot.val())[0],
    photo: user.photo,
    token: generateToken(Object.keys(snapshot.val())[0])
  });
}

//get current logged in user
const getCurrentUser = async(req, res) => {
  const user = req.user;
  
  res.status(200).json(user);
}

//get current logged in user games
const getCurrentUserGames = async (req, res) => {
  const user = req.user;

  if (user && user.games) {
    const userGames = user.games;
    res.status(200).json(userGames);
  } else {
    res.status(200).json([]);
  }
};

//updates the data of an user
const updateUser = async (req, res) => {
  const {password, birth_date, games, region } = req.body;

  let photo = null;

  if(req.file) {
    photo = req.file.filename;
  }

  const reqUser = req.user;

  //copy the user without password
  const userRef = ref(db, `users/${reqUser.id}`);
  const userSnapshot = await get(userRef);
  const user = userSnapshot.val();
  delete user.password;

  //update the internal user data
  if(password) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
  }
  if(photo) {
    user.photo = photo;
  }
  if(birth_date) {
    user.birth_date = birth_date;
  }
  if(games) {
    user.games = games;
  }
  if(region) {
    user.region = region;
  }

  //save updated user
  try {
    await update(userRef, user);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao atualizar os dados do usuário."] });
  }
}

//get user by id
const getUserById = async (req, res) => {
  try {
    const {id} = req.params;

    const userRef = ref(db, `users/${id}`);
    const userSnapshot = await get(userRef);
    const user = userSnapshot.val();
    delete user.password;
    user.id = id;

    //check if user exists
    if(!user) {
      res.status(404).json({errors: ["Usuário não encontrado."]});
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({errors: ["Usuário não encontrado."]});
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  getCurrentUserGames,
  updateUser,
  getUserById
}