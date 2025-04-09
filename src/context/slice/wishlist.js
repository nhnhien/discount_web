import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const { productId, variantId = null } = action.payload;
      const exists = state.find(
        (item) => item.productId === productId && item.variantId === variantId
      );
      if (!exists) {
        state.push({ productId, variantId });
      }
    },
    removeFromWishlist: (state, action) => {
      const { productId, variantId = null } = action.payload;
      return state.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      );
    },
    toggleWishlist: (state, action) => {
      const { productId, variantId = null } = action.payload;
      const exists = state.find(
        (item) => item.productId === productId && item.variantId === variantId
      );
      if (exists) {
        return state.filter(
          (item) => !(item.productId === productId && item.variantId === variantId)
        );
      } else {
        return [...state, { productId, variantId }];
      }
    },
    clearWishlist: () => [],
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
