import { getDatabase, ref, push, onValue, get, remove } from "firebase/database";
import Notification from "./Notification";

jest.mock("firebase/database");

describe("Notification", () => {
  describe("getAllNotifications", () => {
    it("should call onValue and the callback with notifications", () => {
      const callback = jest.fn();
      const snapshot = {
        val: jest.fn().mockReturnValue({ notification1: { title: "Notification 1" } }),
      };

      ref.mockReturnValueOnce({});
      onValue.mockImplementationOnce((ref, callback) => {
        callback(snapshot);
      });

      Notification.getAllNotifications("user1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "notifications/user1");
      expect(onValue).toHaveBeenCalledWith({}, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(200, { notification1: { title: "Notification 1" } });
    });
  });

  describe("createNotification", () => {
    it("should call push and the callback with success message", () => {
      const callback = jest.fn();

      ref.mockReturnValueOnce({});
      push.mockResolvedValueOnce();

      Notification.createNotification("user1", { title: "New Notification", description: "Notification description" }, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "notifications");
      expect(push).toHaveBeenCalledWith({}, { title: "New Notification", description: "Notification description", read: false });
      expect(callback).toHaveBeenCalledWith(201, "Notification created successfully.");
    });

    it("should call the callback with an error message when there are too few arguments", () => {
      const callback = jest.fn();

      Notification.createNotification("user1", { title: "New Notification" }, callback);

      expect(ref).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(400, "Too few arguments.");
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();

      ref.mockReturnValueOnce({});
      push.mockRejectedValueOnce();

      Notification.createNotification("user1", { title: "New Notification", description: "Notification description" }, callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "notifications");
      expect(push).toHaveBeenCalledWith({}, { title: "New Notification", description: "Notification description", read: false });
      expect(callback).toHaveBeenCalledWith(500, "Internal server error.");
    });
  });

  describe("deleteNotification", () => {
    it("should call get, remove, and the callback with success message", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(true),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);
      remove.mockResolvedValueOnce();

      Notification.deleteNotification("notification1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "notifications/notification1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).toHaveBeenCalledWith({});
      expect(callback).toHaveBeenCalledWith(200, "Notifications deleted successfully.");
    });

    it("should call the callback with an error message when the notification does not exist", () => {
      const callback = jest.fn();
      const snapshot = {
        exists: jest.fn().mockReturnValue(false),
      };

      ref.mockReturnValueOnce({});
      get.mockResolvedValueOnce(snapshot);

      Notification.deleteNotification("notification1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "notifications/notification1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(404, "Notifications not found.");
    });

    it("should call the callback with an error message when an error occurs", () => {
      const callback = jest.fn();

      ref.mockReturnValueOnce({});
      get.mockRejectedValueOnce();

      Notification.deleteNotification("notification1", callback);

      expect(ref).toHaveBeenCalledWith(getDatabase(), "notifications/notification1");
      expect(get).toHaveBeenCalledWith({});
      expect(remove).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(500, "Error checking notifications existence.");
    });
  });
});
