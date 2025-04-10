import apiClient from '../config/axios.config';

export const shippingFeeService = {
  // Lấy danh sách tất cả phí vận chuyển
  getAll: async () => {
    const response = await apiClient.get('/api/shipping-fees');
    return response.data;
  },

  // Tạo mới một phí vận chuyển
  create: async (data) => {
    const response = await apiClient.post('/api/shipping-fees', data);
    return response.data;
  },

  // Cập nhật thông tin phí vận chuyển
  update: async (id, data) => {
    const response = await apiClient.put(`/api/shipping-fees/${id}`, data);
    return response.data;
  },

  // Xoá phí vận chuyển
  remove: async (id) => {
    const response = await apiClient.delete(`/api/shipping-fees/${id}`);
    return response.data;
  },

  // (Tuỳ chọn) Toggle trạng thái kích hoạt
  toggle: async (id, is_active) => {
    const response = await apiClient.patch(`/api/shipping-fees/${id}/toggle`, { is_active });
    return response.data;
  },

  // (Tuỳ chọn) Lấy 1 phí vận chuyển nếu cần
  getById: async (id) => {
    const response = await apiClient.get(`/api/shipping-fees/${id}`);
    return response.data;
  },
};
