import { createSlice } from '@reduxjs/toolkit';
import i18n from '@/i18n/i18n';
 
 const initialState = {
   language: 'en',
 };
 
 const languageSlice = createSlice({
   name: 'language',
   initialState,
   reducers: {
     setLanguage: (state, action) => {
       state.language = action.payload;
     },
   },
 });
 
 export const { setLanguage } = languageSlice.actions;
 export default languageSlice.reducer;