//model
const Game = require("../models/Game");

//db
const { ref, get, query} = require("firebase/database");
const db = require("../config/db")

const gamesRef = ref(db, "games");

const getGameList = async(req, res) => {
  try {
    const gamesSnapshot = await get(gamesRef);
    const gameList = {};

    gamesSnapshot.forEach((game) => {
      const gameData = game.val();
      gameList[game.key] = gameData;
    })

    if(!gameList) {
      res.status(404).json({errors: ["Nenhum jogo foi encontrado."]});
      return;
    }

    res.status(200).json(gameList);
  } catch (error) {
    res.status(500).json({errors: ["Não foi possível realizar a busca por jogos."]});
  }
}

const getGameUserInfo = async(req, res) => {
  try {
    const { gameId } = req.params;
    const userInfoRef = ref(db, `games/${gameId}/userInfo`);

    const userInfoSnapshot = await get(query(userInfoRef));

    const userInfo = userInfoSnapshot.val();

    if(!userInfo) {
      res.status(404).json({errors: ["Jogo não encontrado."]});
      return;
    }

    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({errors: ["Não foi possível realizar a busca pelo jogo informado."]});
  }
}

module.exports = {
  getGameList,
  getGameUserInfo
}