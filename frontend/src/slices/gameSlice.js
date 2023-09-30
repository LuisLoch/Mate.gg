import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import gameService from "../services/gameService";

const initialState = {
  games: [],
  userInfo: [],
};

//Get all available games
export const getGames = createAsyncThunk(
  "game/list",
  async (_) => {
    const data = await gameService.getGames();

    return data;
  }
);

//Get a game userInfo to create/list users
export const gameUserInfo = createAsyncThunk(
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
      .addCase(getGames.fulfilled, (state, action) => {
        state.games = action.payload;
      })
      .addCase(gameUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload;
      })
  },
});

export const { resetMessage } = gameSlice.actions;
export default gameSlice.reducer;