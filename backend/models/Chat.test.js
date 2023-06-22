import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import Chat from "./Chat";

// Mock Firebase methods
jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  onValue: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe("Chat", () => {
  beforeEach(() => {
    // Reset mock implementation before each test
    jest.clearAllMocks();
  });

  describe("getChatById", () => {
    it("should call onValue with the correct arguments and return the chat", () => {
      const callback = jest.fn();
      const snapshot = { val: jest.fn().mockReturnValue({ id: "chat1", messages: [] }) };
      ref.mockReturnValueOnce({});
      onValue.mockImplementationOnce((ref, callback) => {
        callback(snapshot);
      });

      Chat.getChatById("chat1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats/chat1");
      expect(onValue).toHaveBeenCalledWith({}, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(200, { id: "chat1", messages: [] });
    });
  });

  describe("createChat", () => {
    it("should call push with the correct arguments and return success message", () => {
      const callback = jest.fn();
      push.mockResolvedValueOnce();

      const chat = {
        usersIds: ["user1", "user2"],
        messages: [],
      };

      Chat.createChat(chat, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats");
      expect(push).toHaveBeenCalledWith({}, chat);
      expect(callback).toHaveBeenCalledWith(201, "Chat created successfully.");
    });

    it("should call the callback with an error message when missing required chat data", () => {
      const callback = jest.fn();

      const chat = {
        usersIds: ["user1", "user2"],
      };

      Chat.createChat(chat, callback);

      expect(callback).toHaveBeenCalledWith(400, "Too few arguments.");
      expect(ref).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();
      push.mockRejectedValueOnce();

      const chat = {
        usersIds: ["user1", "user2"],
        messages: [],
      };

      Chat.createChat(chat, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats");
      expect(push).toHaveBeenCalledWith({}, chat);
      expect(callback).toHaveBeenCalledWith(500, "Internal server error.");
    });
  });

  describe("updateChat", () => {
    it("should call get, update, and the callback with the updated chat", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
        val: jest.fn().mockReturnValue({ id: "chat1", messages: [] }),
      };
      const updatedChat = { messages: [{ text: "Hello" }] };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      update.mockResolvedValueOnce();

      Chat.updateChat("chat1", updatedChat, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats/chat1");
      expect(get).toHaveBeenCalledWith({});
      expect(update).toHaveBeenCalledWith({}, { id: "chat1", messages: [{ text: "Hello" }] });
      expect(callback).toHaveBeenCalledWith(200, "Chat updated successfully.");
    });

    it("should call the callback with an error message when the chat does not exist", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(false),
      };
      const updatedChat = { messages: [{ text: "Hello" }] };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);

      Chat.updateChat("chat1", updatedChat, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats/chat1");
      expect(get).toHaveBeenCalledWith({});
      expect(update).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(404, "Chat not found.");
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };
      const updatedChat = { messages: [{ text: "Hello" }] };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      update.mockRejectedValueOnce();

      Chat.updateChat("chat1", updatedChat, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats/chat1");
      expect(get).toHaveBeenCalledWith({});
      expect(update).toHaveBeenCalledWith({}, { id: "chat1", messages: [{ text: "Hello" }] });
      expect(callback).toHaveBeenCalledWith(404, "Error updating chat.");
    });
  });

  describe("deleteChat", () => {
    it("should call get, remove, and the callback with success message", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      remove.mockResolvedValueOnce();

      Chat.deleteChat("chat1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats/chat1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledWith(200, "Chat deleted successfully.");
    });

    it("should call the callback with an error message when the chat does not exist", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(false),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);

      Chat.deleteChat("chat1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats/chat1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(404, "Chat not found.");
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      remove.mockRejectedValueOnce();

      Chat.deleteChat("chat1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "chats/chat1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledWith(500, "Error deleting chat.");
    });
  });
});
