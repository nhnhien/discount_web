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

<<<<<<< HEAD
export default authSlice.reducer;
=======
export default authSlice.reducer;
>>>>>>> 578b5de (update: UI admin)
