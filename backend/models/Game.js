import { getDatabase, ref, push, update, onValue, get } from "firebase/database";
import dbconfig from "../dbconfig.mjs";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class Game {
  static getAllGames(callback) {
    const gamesRef = ref(db, "games");
    onValue(gamesRef, (snapshot) => {
      const games = snapshot.val();
      callback(games);
    });
  }

  static getGame(id, callback) {
    const gamesRef = ref(db, "games");
    onValue(gamesRef, (snapshot) => {
      const games = snapshot.val();
      const game = games[id];

      callback(game);
    });
  }

  static createGame(game, callback) {
    if(!game.fields){
      const error = {
        message: "Too few arguments.",
        statusCode: 400,
      };
      return callback(error);
    }

    const gamesRef = ref(db, "games");
    push(gamesRef, game)
      .then(() => {
        callback(game);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  static updateGame(id, updatedData, callback) {
    const gamesRef = ref(db, "games");
    onValue(gamesRef, (snapshot) => {
      const games = snapshot.val();
      const game = Object.values(games).find((game) => game.id === id);
      const gameId = Object.keys(games).find((key) => games[key].id === id);
      let error = null;
  
      if (!game) {
        error = {
          message: "Game not found.",
          statusCode: 400,
        };
        return callback(error);
      }
  
      const updatedGame = {
        ...game,
        ...updatedData,
      };
  
      const filteredGame = Object.fromEntries(
        Object.entries(updatedGame).filter(([_, value]) => value !== undefined)
      );
  
      const gameRef = ref(db, `games/${gameId}`);
      update(gameRef, filteredGame)
        .then(() => {
          callback(filteredGame);
        })
        .catch(() => {
          error = {
            message: "Something went wrong.",
            statusCode: 500,
          };
          return callback(error);
        });
    });
  }
  
  static deleteGame(id, callback) {
    const gamesRef = ref(db, "games");
    let error = null;
  
    get(gamesRef)
      .then((snapshot) => {
        const games = snapshot.val();
        const gameKey = Object.keys(games).find((key) => games[key].id === id);
  
        // Verifica se o usuário existe
        if (!gameKey) {
          error = {
            message: "Game not found.",
            statusCode: 400,
          };
          return callback(error);
        }
  
        const deletedGame = games[gameKey];
  
        let updatedGames = { ...games };
        delete updatedGames[gameKey];
  
        // Atualiza os dados no banco de dados
        set(gamesRef, updatedGames)
          .then(() => {
            callback(deletedGame);
          })
          .catch(() => {
            error = {
              message: "Something went wrong.",
              statusCode: 500,
            };
            return callback(error);
          });
      })
      .catch(() => {
        error = {
          message: "Something went wrong.",
          statusCode: 500,
        };
        return callback(error);
      });
  }
}

export default Game;