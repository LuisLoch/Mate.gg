import { getDatabase, ref, push, update, onValue, get } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import dbconfig from "../dbconfig.mjs";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class Notification {
  static getNotification(id, callback) {
    const notificationsRef = ref(db, "notifications");
    onValue(notificationsRef, (snapshot) => {
      const notifications = snapshot.val();
      const notification = Object.values(notifications).find((notification) => notification.id === id);

      callback(notification);
    });
  }

  static createnotification(notification, callback) {
    if(!notification.data){
      const error = {
        message: "Too few arguments.",
        statusCode: 400,
      };
      return callback(error);
    }

    const notificationsRef = ref(db, "notifications");
    push(notificationsRef, notification)
      .then(() => {
        callback(notification);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  static updatenotification(id, updatedData, callback) {
    const notificationsRef = ref(db, "notifications");
    onValue(notificationsRef, (snapshot) => {
      const notifications = snapshot.val();
      const notification = Object.values(notifications).find((notification) => notification.id === id);
      const notificationId = Object.keys(notifications).find((key) => notifications[key].id === id);
      let error = null;
  
      if (!notification) {
        error = {
          message: "Notification not found.",
          statusCode: 400,
        };
        return callback(error);
      }
  
      const updatedNotification = {
        ...notification,
        ...updatedData,
      };
  
      const filteredNotification = Object.fromEntries(
        Object.entries(updatedNotification).filter(([_, value]) => value !== undefined)
      );
  
      const notificationRef = ref(db, `notifications/${notificationId}`);
      update(notificationRef, filteredNotification)
        .then(() => {
          callback(filteredNotification);
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
  
  static deleteNotification(id, callback) {
    const notificationsRef = ref(db, "notifications");
    let error = null;
  
    get(notificationsRef)
      .then((snapshot) => {
        const notifications = snapshot.val();
        const notificationKey = Object.keys(notifications).find((key) => notifications[key].id === id);
  
        // Verifica se o usuário existe
        if (!notificationKey) {
          error = {
            message: "Notification not found.",
            statusCode: 400,
          };
          return callback(error);
        }
  
        const deletedNotification = notifications[otificationKey];
  
        let updatedNotifications = { ...notifications };
        delete updatedNotifications[notificationKey];
  
        // Atualiza os dados no banco de dados
        set(notificationsRef, updatednotifications)
          .then(() => {
            callback(deletedNotification);
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

export default Notification;
