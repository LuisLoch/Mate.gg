//model
const User = require("../models/User");

//db
const { ref, query, push, set, update, get, orderByChild, equalTo } = require("firebase/database");
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
  const { password, birth_date, games, region } = req.body;

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

//updates the data of an user
const updateCurrentUserGame = async (req, res) => {
  const reqBody = req.body;
  const userId = reqBody.userId;
  const reqGame = reqBody.game;
  delete reqBody.game;
  delete reqBody.user;
  try {
    const game = {};
    const userRef = ref(db, `users/${userId}/games/${reqGame}`);
    
    for (const key in reqBody) {
      if (reqBody.hasOwnProperty(key)) {
        const value = reqBody[key];
        if(key != 'validations' && key != 'userId') {
          game[key] = value;
        }
      }
    }

    const date = new Date();
    const minute = date.getUTCMinutes().toString().padStart(2, '0')
    const hour = date.getUTCHours().toString().padStart(2, '0')
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();

    game['updateMoment'] = `${year}-${month}-${day} ${hour}:${minute}`;

    await set(userRef, game);

    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao atualizar os dados do usuário."] });
  }
}

//get user by id
const getUserById = async (req, res) => {
  const {id} = req.params;
  
  try {
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

const getPlayerList = async(req, res) => {
  const {gameId} = req.params;

  try {
    const usersSnapshot = await get(usersRef);
    const playerList = {};

    usersSnapshot.forEach((user) => {
      const playerData = user.val();
      const playerKey = user.key;
      if (playerData && playerData.games && playerData.games[gameId]) {
        const player = playerData.games[gameId];
        player.region = playerData.region;
        player.birth_date = playerData.birth_date;
        player.photo = playerData.photo;
        player.id = playerKey;
        playerList[playerData.games[gameId]['nickname']] = player;
      }
    })

    const playerArray = Object.values(playerList);

    playerArray.sort((a, b) => {
      const dateA = new Date(a.updateMoment);
      const dateB = new Date(b.updateMoment);
      return dateB - dateA;
    });

    const sortedPlayerList = {};
    
    playerArray.forEach((player) => {
      sortedPlayerList[player.nickname] = player;
    });

    res.status(200).json(sortedPlayerList);
  } catch (error) {
    res.status(500).json({errors: ["Não foi possível realizar a busca por jogadores."]});
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  getCurrentUserGames,
  updateUser,
  updateCurrentUserGame,
  getUserById,
  getPlayerList
}