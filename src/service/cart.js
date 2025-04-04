import apiClient from '../config/axios.config';

export const cartService = {
 
  getCart: async (applyDiscount = false, selectedItemIds = []) => {
    let url = `/api/cart`;
    const query = new URLSearchParams();
    
    // Luôn truyền apply_discount nếu được chỉ định
    if (applyDiscount) {
      query.append('apply_discount', 'true');
    }
    
    // Luôn truyền selected_item_ids nếu có
    if (selectedItemIds && selectedItemIds.length > 0) {
      query.append('selected_item_ids', selectedItemIds.join(','));
    }
    
    // Chỉ thêm query string nếu có tham số
    if (query.toString()) {
      url += `?${query.toString()}`;
    }
    
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
    const response = await apiClient.put('/api/cart/shipping', {
      ...shippingData, 
    });
    return response.data;
  },
  

  applyDiscount: async ({ discount_code, selected_item_ids }) => {
    if (!selected_item_ids || selected_item_ids.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá');
    }
    
    const response = await apiClient.post('/api/cart/apply', {
      discount_code,
      selected_item_ids,
    });
    return response.data;
  },
  
  

  removeDiscount: async () => {
    const response = await apiClient.delete('/api/cart/apply');
    return response.data;
  },
};