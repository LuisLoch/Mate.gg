import firebase from 'firebase/app';
import 'firebase/database';
import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import dbconfig from "../dbconfig.js";
import User from "./User";

firebase.initializeApp(dbconfig);


jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  onValue: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

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
    it("Deve atualizar um usuário existente", async () => {
      const snapshot = {
        exists: jest.fn(() => true),
        val: jest.fn(() => ({ name: "User 1" }))
      };
  
      const onValueMock = jest.fn((ref, callback) => {
        callback(snapshot);
      });
  
      jest.spyOn(firebase.database(), "onValue").mockImplementation(onValueMock);;
  
      const updatedData = { name: "User 1", email: "user@example.com" };
  
      await User.updateUser("user1", updatedData, callback);
  
      expect(ref).toHaveBeenCalledWith(db, "users/user1");
      expect(onValueMock).toHaveBeenCalledWith(
        ref(db, "users/user1"),
        expect.any(Function)
      );
      expect(update).toHaveBeenCalledWith(ref(db, "users/user1"), {
        name: "User 1",
        email: "user@example.com"
      });
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

    it("Deve retornar erro ao verificar a existência do usuário", async () => {
      get.mockRejectedValueOnce();

      const updatedData = { email: "user@example.com" };

      await User.updateUser("user1", updatedData, callback);

      expect(ref).toHaveBeenCalledWith({}, "users/user1");
      expect(get).toHaveBeenCalledWith(ref({}, "users/user1"));
      expect(callback).toHaveBeenCalledWith(500, "Error checking user existence.");
    });
  });

  describe("deleteUser", () => {
    it("Deve excluir um usuário existente", async () => {
      const snapshot = { exists: jest.fn(() => true) };
      get.mockResolvedValueOnce(snapshot);
      remove.mockResolvedValueOnce();

      await User.deleteUser("user1", callback);

      expect(ref).toHaveBeenCalledWith({}, "users/user1");
      expect(get).toHaveBeenCalledWith(ref({}, "users/user1"));
      expect(remove).toHaveBeenCalledWith(ref({}, "users/user1"));
      expect(callback).toHaveBeenCalledWith(200, "User deleted successfully.");
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
