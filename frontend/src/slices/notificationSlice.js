import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "../services/notificationService";

const initialState = {
  notifications: [],
  error: false,
  success: false,
  loading: false,
  message: null,
};

//get user notifications
export const listNotifications = createAsyncThunk(
  "notification/list",
  async (id) => {
    const data = await notificationService.listNotifications(id);

    return data;
  }
);

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    resetNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.notifications = action.payload;
      })
  },
});

export const { resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;