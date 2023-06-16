import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import dbconfig from "../dbconfig.js";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class Game {
  static getAllGames(callback) {
    const gamesRef = ref(db, "games");
    onValue(gamesRef, (snapshot) => {
      const games = snapshot.val();
      callback(200, games);
    });
  }

  static getGameById(id, callback) {
    const gameRef = ref(db, "games/"+id);
    onValue(gameRef, (snapshot) => {
      const game = snapshot.val();
      callback(200, game);
    });
  }

  static createGame(game, callback) {
    if(!game.title || !game.description || !game.userDetails || !game.art){
      callback(400, "Too few arguments.");
    }

    const gamesRef = ref(db, "games");
    push(gamesRef, game)
      .then(() => {
        callback(201, "Game created successfully.");
      })
      .catch(() => {
        callback(500, "Internal server error.");
      });
  }

  static updateGame(id, updatedData, callback) {
    const gameRef = ref(db, "games/" + id);
  
    get(gameRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const existingGame = snapshot.val();
          const updatedGame = {
            ...existingGame,
            ...updatedData,
          };
  
          const filteredGame = Object.fromEntries(
            Object.entries(updatedGame).filter(([_, value]) => value !== undefined)
          );
  
          update(gameRef, filteredGame)
            .then(() => {
              callback(200, "Game updated successfully.");
            })
            .catch(() => {
              callback(404, "Error updating game.");
            });
        } else {
          callback(404, "Game not found.");
        }
      })
      .catch(() => {
        callback(500, "Error checking game existence.");
      });
  }
  
  
  static deleteGame(id, callback) {
    const gameRef = ref(db, "games/" + id);
  
    get(gameRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          remove(gameRef)
            .then(() => {
              callback(200, "Game deleted successfully.");
            })
            .catch(() => {
              callback(500, "Error deleting game.");
            });
        } else {
          callback(404, "Game not found.");
        }
      })
      .catch(() => {
        callback(500, "Error checking game exsitence.");
      });
  }
}

export default Game;
