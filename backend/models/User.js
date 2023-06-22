import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import dbconfig from "../dbconfig.js";

const db = getDatabase(); // Obtém a referência do banco de dados do Firebase

class User {
  static getAllUsers(callback) {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      callback(200, users);
    });
  }

  static getUserById(id, callback) {
    const userRef = ref(db, "users/"+id);
    onValue(userRef, (snapshot) => {
      const user = snapshot.val();
      callback(200, user);
    });
  }

  static createUser(user, callback) {
    if(!user.name || !user.birth_date || !user.email || !user.password){
      callback(400, "Too few arguments.");
    }

    const usersRef = ref(db, "users");
    push(usersRef, user)
      .then(() => {
        callback(201, "User created successfully.");
      })
      .catch(() => {
        callback(500, "Internal server error.");
      });
  }

  static updateUser(id, updatedData, callback) {
    const userRef = ref(db, "users/" + id);
  
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const existingUser = snapshot.val();
          const updatedUser = {
            ...existingUser,
            ...updatedData,
          };
  
          const filteredUser = Object.fromEntries(
            Object.entries(updatedUser).filter(([_, value]) => value !== undefined)
          );
  
          update(userRef, filteredUser)
            .then(() => {
              callback(200, "User updated successfully.");
            })
            .catch(() => {
              callback(404, "Error updating user.");
            });
        } else {
          callback(404, "User not found.");
        }
      })
      .catch(() => {
        callback(500, "Error checking user existence.");
      });
  }
  
  
  
  
  static deleteUser(id, callback) {
    const userRef = ref(db, "users/" + id);
  
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          remove(userRef)
            .then(() => {
              callback(200, "User deleted successfully.");
            })
            .catch(() => {
              callback(500, "Error deleting user.");
            });
        } else {
          callback(404, "User not found.");
        }
      })
      .catch(() => {
        callback(500, "Error checking user exsitence.");
      });
  }
}

export default User;
