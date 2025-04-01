import apiClient from '@/config/axios.config';

export const orderService = {
  createOrder: async (orderData) => {
    const res = await apiClient.post('/api/order', orderData);
    return res.data;
  },

  getOrders: async (params) => {
    const res = await apiClient.get('/api/order', { params });
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await apiClient.get(`/api/order/${id}`);
    return res.data;
  },

  getUserAddresses: async () => {
    const res = await apiClient.get('/api/user/addresses');
    return res.data;
  },
};