import 'firebase/database';
import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import dbconfig from "../dbconfig.js";
import User from "./User";
import firebase from 'firebase/app';

jest.mock("firebase/database", () => {
  const database = {
    ref: jest.fn(),
    push: jest.fn().mockResolvedValue(),
    update: jest.fn().mockResolvedValue(),
    onValue: jest.fn(),
    get: jest.fn().mockResolvedValue(),
    remove: jest.fn().mockResolvedValue(),
  };

  return {
    getDatabase: jest.fn(() => ({})),
    ref: jest.fn(() => database.ref),
    push: database.push,
    update: database.update,
    onValue: database.onValue,
    get: database.get,
    remove: database.remove,
    database: jest.fn(() => ({ ref: database.ref })),
  };
});

describe("User", () => {
  const callback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("Deve retornar todos os usuários", () => {
      const snapshot = { val: jest.fn(() => ({ user1: { name: "User 1" } })) };
      onValue.mockImplementationOnce((ref, callback) => callback(snapshot));

      User.getAllUsers(callback);

      expect(ref).toHaveBeenCalledWith({}, "users");
      expect(onValue).toHaveBeenCalledWith(ref({}, "users"), expect.any(Function));
      expect(callback).toHaveBeenCalledWith(200, { user1: { name: "User 1" } });
    });
  });

  describe("getUserById", () => {
    it("Deve retornar um usuário pelo ID", () => {
      const snapshot = { val: jest.fn(() => ({ name: "User 1" })) };
      onValue.mockImplementationOnce((ref, callback) => callback(snapshot));

      User.getUserById("user1", callback);

      expect(ref).toHaveBeenCalledWith({}, "users/user1");
      expect(onValue).toHaveBeenCalledWith(ref({}, "users/user1"), expect.any(Function));
      expect(callback).toHaveBeenCalledWith(200, { name: "User 1" });
    });
  });

  describe("createUser", () => {
    it("Deve criar um usuário com sucesso", async () => {
      push.mockResolvedValueOnce();

      const user = {
        name: "User 1",
        birth_date: "01/01/2000",
        email: "user@example.com",
        password: "password123",
      };

      await User.createUser(user, callback);

      expect(ref).toHaveBeenCalledWith({}, "users");
      expect(push).toHaveBeenCalledWith(ref({}, "users"), user);
      expect(callback).toHaveBeenCalledWith(201, "User created successfully.");
    });

    it("Deve retornar erro quando faltam argumentos", async () => {
      const user = {}; // Faltando argumentos
  
      // Simular uma rejeição da promessa retornada pela função push
      push.mockRejectedValueOnce();
  
      await User.createUser(user, callback);
  
      expect(ref).toHaveBeenCalledWith({}, "users");
      expect(push).toHaveBeenCalledWith(ref({}, "users"), user);
      expect(callback).toHaveBeenCalledWith(400, "Too few arguments.");
    });
  });

  describe("updateUser", () => {
    const callback = jest.fn();
  
    it("Deve atualizar um usuário existente", async () => {
      const id = 'user-id';
      const updatedData = { name: 'John Doe' };

      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
        val: jest.fn().mockReturnValue({}),
      };
      get.mockResolvedValue(snapshot);

      const existingUser = {};
      const updatedUser = { ...existingUser, ...updatedData };
      const filteredUser = { ...updatedData };
      Object.fromEntries = jest.fn().mockReturnValue(filteredUser);

      const userRef = ref(dbconfig, `users/${id}`);
      update.mockResolvedValue(); // Certifique-se de que o mock esteja resolvendo corretamente

      const callback = jest.fn().mockImplementation((status, message) => {
        expect(status).toBe(200);
        expect(message).toBe("User updated successfully.");
      });

      await User.updateUser(id, updatedData, callback);

      expect(ref).toHaveBeenCalledWith(dbconfig, `users/${id}`);
      expect(get).toHaveBeenCalledWith(userRef);
      expect(snapshot.exists).toHaveBeenCalled();
      expect(snapshot.val).toHaveBeenCalled();
      expect(Object.fromEntries).toHaveBeenCalledWith(
        Object.entries(updatedUser).filter(([_, value]) => value !== undefined)
      );

      // Aguardar a resolução da função update antes de verificar o callback
      await update.mock.results[0].value;

      expect(update).toHaveBeenCalledWith(userRef, filteredUser);
      expect(callback).toHaveBeenCalledWith(200, "User updated successfully.");
    });

    it("Deve retornar erro quando o usuário não existe", async () => {
      const snapshot = { exists: jest.fn(() => false) };
      get.mockResolvedValueOnce(snapshot);

      const updatedData = { email: "user@example.com" };

      await User.updateUser("user1", updatedData, callback);

      expect(ref).toHaveBeenCalledWith({}, "users/user1");
      expect(get).toHaveBeenCalledWith(ref({}, "users/user1"));
      expect(callback).toHaveBeenCalledWith(404, "User not found.");
    });
  });

  describe("deleteUser", () => {
    it("Deve excluir um usuário existente", async () => {
      const snapshot = { exists: jest.fn(() => true) };
      get.mockResolvedValueOnce(snapshot);
      remove.mockResolvedValueOnce();
    
      const callback = jest.fn().mockImplementation((status, message) => {
        expect(status).toBe(200);
        expect(message).toBe("User deleted successfully.");
      });
    
      await User.deleteUser("user1", (status, message) => {
        callback(status, message); // Chamar o objeto callback dentro da função de callback assíncrona
      });
    
      expect(ref).toHaveBeenCalledWith({}, "users/user1");
      expect(get).toHaveBeenCalledWith(ref({}, "users/user1"));
      expect(remove).toHaveBeenCalledWith(ref({}, "users/user1"));
      console.log('Before remove');
      expect(callback).toHaveBeenCalledWith(200, "User deleted successfully.");
      console.log('After remove');
    });
    

    it("Deve retornar erro quando o usuário não existe", async () => {
      const snapshot = { exists: jest.fn(() => false) };
      get.mockResolvedValueOnce(snapshot);

      await User.deleteUser("user1", callback);

      expect(ref).toHaveBeenCalledWith({}, "users/user1");
      expect(get).toHaveBeenCalledWith(ref({}, "users/user1"));
      expect(callback).toHaveBeenCalledWith(404, "User not found.");
    });

    it("Deve retornar erro ao verificar a existência do usuário", async () => {
      get.mockRejectedValueOnce();

      await User.deleteUser("user1", callback);

      expect(ref).toHaveBeenCalledWith({}, "users/user1");
      expect(get).toHaveBeenCalledWith(ref({}, "users/user1"));
      expect(callback).toHaveBeenCalledWith(500, "Error checking user existence.");
    });
  });
});