import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },
    logoutSuccess: (state) => {
      (state.currentUser = null), (state.isLoggedIn = false);
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;


export default authSlice.reducer;
