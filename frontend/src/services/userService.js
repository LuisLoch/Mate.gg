import { api, requestConfig } from "../utils/config";

//Get user details
const profile = async (data, token) => {
  const config = requestConfig("GET", data, token);

  try {
    const res = await fetch(api + "/users/profile", config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
};

//Update user details
const updateProfile = async (data, token) => {
  const config = requestConfig("PUT", data, token, true);
  console.log("requestConfig: ", config);
  console.log("userService data:");
  console.log(typeof data);
  for (const pair of data.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const res = await fetch(api + "/users/", config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
};

//Update or define a user game
const updateUserGame = async (data, token) => {
  const config = requestConfig("PUT", data, token, false);
  console.log("userService data: ", data.validations);

  try {
    const res = await fetch(api + "/users/games/", config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
};

//Get user details
const getUserDetails = async (id) => {
  const config = requestConfig("GET");

  try {
    const res = await fetch(api + "/users/" + id, config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
};

//Get user games
const getUserGames = async (id, token) => {
  const config = requestConfig("GET", null, token);

  try {
    const res = await fetch(api + "/users/games/" + id, config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
};

//Get user games
const getPlayers = async (gameId) => {
  const config = requestConfig("GET");

  try {
    const res = await fetch(api + "/users/players/" + gameId, config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
};

const userService = {
  profile,
  updateProfile,
  updateUserGame,
  getUserDetails,
  getUserGames,
  getPlayers
};

export default userService;