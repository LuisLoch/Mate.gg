import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import gameService from "../services/gameService";

const initialState = {
  games: [],
  userInfo: [],
  error: false,
  success: false,
  loading: false,
  message: null,
};

//Get all available games
export const listGames = createAsyncThunk(
  "game/list",
  async (_) => {
    const data = await gameService.getGames();

    return data;
  }
);

//Get a game userInfo to create/list users
export const userInfo = createAsyncThunk(
  "game/userInfo",
  async (game) => {
    const data = await gameService.getGameUserInfo(game); //DEVE PEGAR A USERINFO DE TODOS OS GAMES

    return data;
  }
);

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listGames.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.games = action.payload;
      })
      .addCase(userInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.userInfo = action.payload;
      })
  },
});

export const { resetMessage } = gameSlice.actions;
export default gameSlice.reducer;