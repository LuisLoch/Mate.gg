const { getDatabase, ref, push, update, onValue, get, remove } = require("firebase/database");
const dbconfig = require("../config/db");

class Game {
  constructor(name, splashart, userInfo) {
    this.name = name;
    this.splashart = splashart;
    this.userInfo = userInfo;
  }
}

module.exports = Game;
