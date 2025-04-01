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
      state.currentUser = null;
      state.isLoggedIn = false;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

export const { loginSuccess, logoutSuccess, setCurrentUser } = authSlice.actions;
export default authSlice.reducer;