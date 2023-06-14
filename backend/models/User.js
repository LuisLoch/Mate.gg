import { getDatabase, ref, push, update, onValue, get } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import dbconfig from "../dbconfig.mjs";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class User {
  static getAllUsers(callback) {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      callback(users);
    });
  }

  static getUserById(id, callback) {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      const user = Object.values(users).find((user) => user.id === id);

      callback(user);
    });
  }

  static createUser(user, callback) {
    if(!user.name || !user.birth_date || !user.email){
      const error = {
        message: "Too few arguments.",
        statusCode: 400,
      };
      return callback(error);
    }
      
    const newUser = {
      id: uuidv4(),
      ...user,
    };

    const usersRef = ref(db, "users");
    push(usersRef, newUser)
      .then(() => {
        callback(newUser);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  static updateUser(id, updatedData, callback) {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      const user = Object.values(users).find((user) => user.id === id);
      const userId = Object.keys(users).find((key) => users[key].id === id);
      let error = null;
  
      if (!user) {
        error = {
          message: "User not found.",
          statusCode: 400,
        };
        return callback(error);
      }
  
      const updatedUser = {
        ...user,
        ...updatedData,
      };
  
      const filteredUser = Object.fromEntries(
        Object.entries(updatedUser).filter(([_, value]) => value !== undefined)
      );
  
      const userRef = ref(db, `users/${userId}`);
      update(userRef, filteredUser)
        .then(() => {
          callback(filteredUser);
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
  
  static deleteUser(id, callback) {
    const usersRef = ref(db, "users");
    let error = null;
  
    get(usersRef)
      .then((snapshot) => {
        const users = snapshot.val();
        const userKey = Object.keys(users).find((key) => users[key].id === id);
  
        // Verifica se o usuário existe
        if (!userKey) {
          error = {
            message: "User not found.",
            statusCode: 400,
          };
          return callback(error);
        }
  
        const deletedUser = users[userKey];
  
        let updatedUsers = { ...users };
        delete updatedUsers[userKey];
  
        // Atualiza os dados no banco de dados
        set(usersRef, updatedUsers)
          .then(() => {
            callback(deletedUser);
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

export default User;
