import apiClient from '../config/axios.config';

export const cartService = {
  getCart: async (applyDiscount = false, selectedItemIds = []) => {
    const query = new URLSearchParams();

    if (applyDiscount) query.append('apply_discount', 'true');
    if (selectedItemIds?.length) query.append('selected_item_ids', selectedItemIds.join(','));

    const url = query.toString() ? `/api/cart?${query.toString()}` : '/api/cart';
    const response = await apiClient.get(url);
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
    const response = await apiClient.delete('/api/cart');
    return response.data;
  },

  updateShippingInfo: async (shippingData) => {
    const response = await apiClient.put('/api/cart/shipping', shippingData);
    return response.data;
  },

  applyDiscount: async ({ discount_code, selected_item_ids = [] }) => {
    if (!discount_code) {
      throw new Error('Vui lòng nhập mã giảm giá');
    }
    if (!selected_item_ids.length) {
      throw new Error('Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá');
    }

    const response = await apiClient.post('/api/cart/apply', {
      discount_code,
      selected_item_ids,
    });

    return response.data;
  },

  removeDiscount: async (selected_item_ids = []) => {
    const response = await apiClient.post('/api/cart/remove-discount', {
      selected_item_ids,
    });
    return response.data;
  },
  
  
};
