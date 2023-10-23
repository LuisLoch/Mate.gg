import { api, requestConfig } from "../utils/config";

//Get all available games
const getGames = async() => {
  const config = requestConfig("GET");

  try {
    const res = await fetch(api + "/games", config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
}

//Get single game users necessary info
const getGameUserInfo = async(id) => {
  const config = requestConfig("GET");

  try {
    const res = await fetch(api + "/games/" + id, config)
      .then((res) => res.json())
      .catch((err) => err);

    return res;
  } catch (error) {
    console.log(error);
  }
}

const gameService = {
  getGames,
  getGameUserInfo
};

export default gameService;