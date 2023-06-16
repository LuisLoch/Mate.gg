import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import dbconfig from "../dbconfig.js";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class Notification {
  static getAllNotifications(userId, callback) {
    const notificationsRef = ref(db, "notifications/"+userId);
    onValue(notificationsRef, (snapshot) => {
      const notifications = snapshot.val();
      callback(200, notifications);
    });
  }

  static createNotification(userId, notification, callback) {
    if(!userId || !notification.title || !notification.description){
      callback(400, "Too few arguments.");
    }

    notification.read = false;

    const notificationsRef = ref(db, "notifications");
    push(notificationsRef, notification)
      .then(() => {
        callback(201, "Notification created successfully.");
      })
      .catch(() => {
        callback(500, "Internal server error.");
      });
  }  
  
  static deleteNotification(id, callback) {
    const notificationsRef = ref(db, "notifications/" + id);
  
    get(notificationsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          remove(notificationsRef)
            .then(() => {
              callback(200, "Notifications deleted successfully.");
            })
            .catch(() => {
              callback(500, "Error deleting notifications.");
            });
        } else {
          callback(404, "Notifications not found.");
        }
      })
      .catch(() => {
        callback(500, "Error checking notifications exsitence.");
      });
  }
}

export default Notification;
