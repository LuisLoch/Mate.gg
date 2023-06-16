import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import dbconfig from "../dbconfig.js";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class Chat {
  static getChatById(id, callback) {
    const chatRef = ref(db, "chats/"+id);
    onValue(chatRef, (snapshot) => {
      const chat = snapshot.val();
      callback(200, chat);
    });
  }

  static createChat(chat, callback) {
    if(!chat.usersIds || !chat.messages){
      callback(400, "Too few arguments.");
    }

    const chatsRef = ref(db, "chats");
    push(chatsRef, chat)
      .then(() => {
        callback(201, "Chat created successfully.");
      })
      .catch(() => {
        callback(500, "Internal server error.");
      });
  }

  static updateChat(id, updatedData, callback) {
    const chatRef = ref(db, "chats/" + id);
  
    get(chatRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const existingChat = snapshot.val();
          const updatedChat = {
            ...existingChat,
            ...updatedData,
          };
  
          const filteredChat = Object.fromEntries(
            Object.entries(updatedChat).filter(([_, value]) => value !== undefined)
          );
  
          update(chatRef, filteredChat)
            .then(() => {
              callback(200, "Chat updated successfully.");
            })
            .catch(() => {
              callback(404, "Error updating chat.");
            });
        } else {
          callback(404, "Chat not found.");
        }
      })
      .catch(() => {
        callback(500, "Error checking chat existence.");
      });
  }
  
  
  static deleteChat(id, callback) {
    const chatRef = ref(db, "chats/" + id);
  
    get(chatRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          remove(chatRef)
            .then(() => {
              callback(200, "Chat deleted successfully.");
            })
            .catch(() => {
              callback(500, "Error deleting chat.");
            });
        } else {
          callback(404, "Chat not found.");
        }
      })
      .catch(() => {
        callback(500, "Error checking chat exsitence.");
      });
  }
}

export default Chat;
