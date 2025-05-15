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
    // Khi login, merge guest và user wishlist (nếu có)
    mergeWishlistOnLogin: (state, action) => {
      // action.payload = { guestWishlist, userWishlist }
      const { guestWishlist = [], userWishlist = [] } = action.payload || {};
      const map = new Map();
      [...userWishlist, ...guestWishlist, ...state].forEach(item => {
        const key = `${item.productId}_${item.variantId ?? 'null'}`;
        if (!map.has(key)) map.set(key, item);
      });
      return Array.from(map.values());
    },
    // Khi logout, clear wishlist hoặc chuyển về guest wishlist nếu muốn
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  mergeWishlistOnLogin,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
