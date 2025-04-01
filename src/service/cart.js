import apiClient from '../config/axios.config';

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get('/api/cart');
    return response.data;
  },

  addToCart: async (productData) => {
    const response = await apiClient.post('/api/cart', productData);
    return response.data;
  },

  updateCartItem: async (cartItemId, quantity) => {
    const response = await apiClient.put(`/api/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  removeCartItem: async (cartItemId) => {
    const response = await apiClient.delete(`/api/cart/${cartItemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/api/cart/apply');
    return response.data;
  },

  updateShippingInfo: async (shippingData) => {
    const response = await apiClient.put('/api/cart/shipping', {
      ...shippingData, 
    });
    return response.data;
  },
  

  applyDiscount: async (discountCode) => {
    const response = await apiClient.post('/api/cart/apply', { discount_code: discountCode });
    return response.data;
  },

  removeDiscount: async () => {
    const response = await apiClient.delete('/api/cart/apply');
    return response.data;
  },
};