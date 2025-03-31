import { createSlice } from '@reduxjs/toolkit';
 
 const initialState = {
   id: null,
   items: [],
   item_count: 0,
   subtotal: 0,
   shipping_fee: 0,
   discount_amount: 0,
   discount_code: null,
   total_amount: 0,
   shipping_address: null,
   note: '',
   created_at: null,
   loading: 'idle',
   error: null,
 };
 
 const cartSlice = createSlice({
   name: 'cart',
   initialState,
   reducers: {
     setCart: (state, action) => {
       return {
         ...state,
         ...action.payload,
         loading: 'succeeded',
         error: null,
       };
     },
 
     startLoading: (state) => {
       state.loading = 'pending';
     },
 
     loadingSuccess: (state) => {
       state.loading = 'succeeded';
       state.error = null;
     },
 
     loadingFailed: (state, action) => {
       state.loading = 'failed';
       state.error = action.payload;
     },
     clearError: (state) => {
       state.error = null;
     },
     resetCart: () => initialState,
   },
 });
 
 export const { setCart, startLoading, loadingSuccess, loadingFailed, clearError, resetCart } = cartSlice.actions;
 
 export const selectCart = (state) => state?.cart;
 export const selectCartItems = (state) => state.cart.items;
 export const selectCartItemCount = (state) => state.cart.item_count;
 export const selectCartSubtotal = (state) => state.cart.subtotal;
 export const selectCartDiscount = (state) => state.cart.discount_amount;
 export const selectCartTotal = (state) => state.cart.total_amount;
 export const selectCartLoading = (state) => state.cart.loading === 'pending';
 export const selectCartError = (state) => state.cart.error;
 export const selectShippingAddress = (state) => state.cart.shipping_address;
 export const selectCartNote = (state) => state.cart.note;
 
 export default cartSlice.reducer;