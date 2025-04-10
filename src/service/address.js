import apiClient from '@/config/axios.config';

export const addressService = {
  getAddresses: async () => {
    const res = await apiClient.get('/api/address');
    return res.data;
  },
  createAddress: async (data) => {
    const res = await apiClient.post('/api/address', data);
    return res.data;
  },
  updateAddress: async (id, data) => {
    const res = await apiClient.put(`/api/address/${id}`, data);
    return res.data;
  },
  deleteAddress: async (id) => {
    const res = await apiClient.delete(`/api/address/${id}`);
    return res.data;
  },
  getAllCities: async () => {
    const res = await apiClient.get('/api/address/admin/cities');
    return res.data.data; // trả về chỉ danh sách các khu vực (city)
  },
};