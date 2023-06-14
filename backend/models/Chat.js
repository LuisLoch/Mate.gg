import { getDatabase, ref, push, update, onValue, get } from "firebase/database";
import dbconfig from "../dbconfig.mjs";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class Chat {
  static getChat(id, callback) {
    const chatsRef = ref(db, "chats");
    onValue(chatsRef, (snapshot) => {
      const chats = snapshot.val();
      const chat = chats[id];

      callback(chat);
    });
  }

  static createChat(chat, callback) {
    if(!chat.fields){
      const error = {
        message: "Too few arguments.",
        statusCode: 400,
      };
      return callback(error);
    }

    const chatsRef = ref(db, "chats");
    push(chatsRef, chat)
      .then(() => {
        callback(chat);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  static updateChat(id, updatedData, callback) {
    const chatsRef = ref(db, "chats");
    onValue(chatsRef, (snapshot) => {
      const chats = snapshot.val();
      const chat = Object.values(chats).find((chat) => chat.id === id);
      const chatId = Object.keys(chats).find((key) => chats[key].id === id);
      let error = null;
  
      if (!chat) {
        error = {
          message: "Chat not found.",
          statusCode: 400,
        };
        return callback(error);
      }
  
      const updatedChat = {
        ...chat,
        ...updatedData,
      };
  
      const filteredChat = Object.fromEntries(
        Object.entries(updatedChat).filter(([_, value]) => value !== undefined)
      );
  
      const chatRef = ref(db, `chats/${chatId}`);
      update(chatRef, filteredChat)
        .then(() => {
          callback(filteredChat);
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
  
  static deleteChat(id, callback) {
    const chatsRef = ref(db, "chats");
    let error = null;
  
    get(chatsRef)
      .then((snapshot) => {
        const chats = snapshot.val();
        const chatKey = Object.keys(chats).find((key) => chats[key].id === id);
  
        // Verifica se o usuário existe
        if (!chatKey) {
          error = {
            message: "Chat not found.",
            statusCode: 400,
          };
          return callback(error);
        }
  
        const deletedChat = chats[chatKey];
  
        let updatedChats = { ...chats };
        delete updatedChats[chatKey];
  
        // Atualiza os dados no banco de dados
        set(chatsRef, updatedChats)
          .then(() => {
            callback(deletedChat);
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

export default Chat;