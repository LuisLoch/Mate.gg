import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/userService";

const initialState = {
  user: {},
  userGames: {},
  error: false,
  success: false,
  loading: false,
  message: null,
};

//Get user details for edititting
export const profile = createAsyncThunk(
  "user/profile",
  async (user, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;

    const data = await userService.profile(user, token);

    return data;
  }
);

//Update user details
export const updateProfile = createAsyncThunk(
  "user/update",
  async (user, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    
    console.log("userSlice data:");

    for (const pair of user.entries()) {
      console.log(pair[0], pair[1]);
    }

    const data = await userService.updateProfile(user, token);


    if (data.errors) {
      return thunkAPI.rejectWithValue(data.errors[0]);
    }

    return data;
  }
);

//Update or define a user game
export const updateUserGame = createAsyncThunk(
  "user/updateGame",
  async (game, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;

    console.log("userSlice data: ", game);

    const data = await userService.updateUserGame(game, token);

    if (data.errors) {
      return thunkAPI.rejectWithValue(data.errors[0]);
    }

    return data;
  }
);

//Get user details
export const getUserDetails = createAsyncThunk(
  "user/get",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;

    const data = await userService.getUserDetails(id, token);

    return data;
  }
);

//Get user games
export const getUserGames = createAsyncThunk(
  "user/getGames",
  async (id, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;

    const data = await userService.getUserGames(id, token);

    return data;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(profile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(profile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = action.payload;
        state.message = "Dados atualizados com sucesso!";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = {};
      })
      .addCase(updateUserGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserGame.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.userGames = action.payload; //Deve ser implementado para que o payload traga todos os games, não somente o game atualizado
        state.message = "Dados atualizados com sucesso!";
      })
      .addCase(updateUserGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(getUserGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserGames.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.userGames = action.payload;
      });
  },
});

export const { resetMessage } = userSlice.actions;
export default userSlice.reducer;