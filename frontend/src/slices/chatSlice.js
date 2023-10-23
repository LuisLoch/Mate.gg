import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../services/chatService";

const initialState = {
  chat: {}
};

//Get all user chats
export const getChats = createAsyncThunk(
  "chat/getChats",
  async (user, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;

    const data = await chatService.getChats(user, token);

    return data;
  }
);


export const chatSlice = createSlice({
  name: "chat",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chat = action.payload;
      });
  },
});

export default chatSlice.reducer;