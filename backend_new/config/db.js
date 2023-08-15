const {initializeApp} = require("firebase/app")
const {getDatabase} = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyAmxSAs44kVm1_FGt16niGKMeb01ah_T28",
  authDomain: "mategg-c5508.firebaseapp.com",
  databaseURL: "https://mategg-c5508-default-rtdb.firebaseio.com",
  projectId: "mategg-c5508",
  storageBucket: "mategg-c5508.appspot.com",
  messagingSenderId: "436818415611",
  appId: "1:436818415611:web:bd558d73bd035b773dc55e"
};

const app = initializeApp(firebaseConfig);

const dbconfig = getDatabase(app);

module.exports = dbconfig;