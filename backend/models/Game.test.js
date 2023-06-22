import { getDatabase, ref, push, update, onValue, get, remove } from "firebase/database";
import Game from "./Game";

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

describe("Game", () => {
  beforeEach(() => {
    // Reset mock implementation before each test
    jest.clearAllMocks();
  });

  describe("getAllGames", () => {
    it("should call onValue with the correct arguments and return the games", () => {
      const callback = jest.fn();
      const snapshot = { val: jest.fn().mockReturnValue([{ id: "game1" }, { id: "game2" }]) };
      ref.mockReturnValueOnce({});
      onValue.mockImplementationOnce((ref, callback) => {
        callback(snapshot);
      });

      Game.getAllGames(callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games");
      expect(onValue).toHaveBeenCalledWith({}, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(200, [{ id: "game1" }, { id: "game2" }]);
    });
  });

  describe("getGameById", () => {
    it("should call onValue with the correct arguments and return the game", () => {
      const callback = jest.fn();
      const snapshot = { val: jest.fn().mockReturnValue({ id: "game1" }) };
      ref.mockReturnValueOnce({});
      onValue.mockImplementationOnce((ref, callback) => {
        callback(snapshot);
      });

      Game.getGameById("game1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games/game1");
      expect(onValue).toHaveBeenCalledWith({}, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(200, { id: "game1" });
    });
  });

  describe("createGame", () => {
    it("should call push with the correct arguments and return success message", () => {
      const callback = jest.fn();
      push.mockResolvedValueOnce();

      const game = {
        title: "Game 1",
        description: "This is a game",
        userDetails: "User 1",
        art: "Game art",
      };

      Game.createGame(game, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games");
      expect(push).toHaveBeenCalledWith({}, game);
      expect(callback).toHaveBeenCalledWith(201, "Game created successfully.");
    });

    it("should call the callback with an error message when missing required game data", () => {
      const callback = jest.fn();

      const game = {
        title: "Game 1",
        description: "This is a game",
        userDetails: "User 1",
      };

      Game.createGame(game, callback);

      expect(callback).toHaveBeenCalledWith(400, "Too few arguments.");
      expect(ref).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();
      push.mockRejectedValueOnce();

      const game = {
        title: "Game 1",
        description: "This is a game",
        userDetails: "User 1",
        art: "Game art",
      };

      Game.createGame(game, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games");
      expect(push).toHaveBeenCalledWith({}, game);
      expect(callback).toHaveBeenCalledWith(500, "Internal server error.");
    });
  });

  describe("updateGame", () => {
    it("should call get, update, and the callback with success message", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };
      const updatedData = { description: "Updated description" };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      update.mockResolvedValueOnce();

      Game.updateGame("game1", updatedData, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games/game1");
      expect(get).toHaveBeenCalledWith({});
      expect(update).toHaveBeenCalledWith({}, { description: "Updated description" });
      expect(callback).toHaveBeenCalledWith(200, "Game updated successfully.");
    });

    it("should call the callback with an error message when the game does not exist", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(false),
      };
      const updatedData = { description: "Updated description" };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);

      Game.updateGame("game1", updatedData, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games/game1");
      expect(get).toHaveBeenCalledWith({});
      expect(update).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(404, "Game not found.");
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };
      const updatedData = { description: "Updated description" };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      update.mockRejectedValueOnce();

      Game.updateGame("game1", updatedData, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games/game1");
      expect(get).toHaveBeenCalledWith({});
      expect(update).toHaveBeenCalledWith({}, { description: "Updated description" });
      expect(callback).toHaveBeenCalledWith(404, "Error updating game.");
    });
  });

  describe("deleteGame", () => {
    it("should call get, remove, and the callback with success message", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      remove.mockResolvedValueOnce();

      Game.deleteGame("game1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games/game1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledWith(200, "Game deleted successfully.");
    });

    it("should call the callback with an error message when the game does not exist", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(false),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);

      Game.deleteGame("game1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games/game1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(404, "Game not found.");
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      remove.mockRejectedValueOnce();

      Game.deleteGame("game1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "games/game1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledWith(500, "Error deleting game.");
    });
  });
});
