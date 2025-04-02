import apiClient from '@/config/axios.config';

export const orderService = {
  // Tạo đơn hàng (dành cho frontend người dùng)
  createOrder: async (orderData) => {
    const res = await apiClient.post('/api/order', orderData);
    return res.data;
  },

  // Lấy danh sách đơn hàng (có hỗ trợ lọc, tìm kiếm, phân trang)
  getOrders: async (params) => {
    const res = await apiClient.get('/api/order', { params });
    return res.data;
  },

  // Lấy chi tiết 1 đơn hàng
  getOrderById: async (id) => {
    const res = await apiClient.get(`/api/order/${id}`);
    return res.data;
  },

  // Cập nhật trạng thái đơn hàng (admin)
  updateOrderStatus: async (id, data) => {
    const res = await apiClient.patch(`/api/order/${id}/status`, data);
    return res.data;
  },
  

  // Cập nhật trạng thái thanh toán (admin)
  updatePaymentStatus: async (id, data) => {
    const res = await apiClient.patch(`/api/order/${id}/payment`, data); 
    return res.data;
  },

  // Cập nhật thông tin giao hàng (admin)
  updateDelivery: async (id, data) => {
    const res = await apiClient.patch(`/api/order/${id}/delivery`, data);
    return res.data;
  },
  

  // Hủy đơn hàng (admin hoặc người dùng)
  cancelOrder: async (id, reason) => {
    const res = await apiClient.post(`/api/order/${id}/cancel`, { reason });
    return res.data;
  },

  // Lấy thống kê đơn hàng (admin dashboard)
  getOrderStatistics: async (params) => {
    const res = await apiClient.get('/api/order/statistics', { params });
    return res.data;
  },

  // Dành cho client - lấy địa chỉ người dùng
  getUserAddresses: async () => {
    const res = await apiClient.get('/api/user/addresses');
    return res.data;
  },
};