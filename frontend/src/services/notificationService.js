import { api, requestConfig } from "../utils/config";

//get all user notifications
const listNotifications = async(id) => {
  const config = requestConfig("GET");

  try {
    const res = await fetch(api + "/users/" + id, config)
      .then((res) => res.json())
      .catch((err) => err);

    console.log("requisição: " + api + "/users/" + id)

    return res.notifications;
  } catch (error) {
    console.log(error);
  }
}

const notificationService = {
  listNotifications
};

export default notificationService;