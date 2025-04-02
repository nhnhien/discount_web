import apiClient from '@/config/axios.config';

const getCustomer = async () => {
  try {
    const res = await apiClient.get('/api/user/customer');
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách khách hàng');
  }
};

const deactivateUser = async (id) => {
  try {
    const res = await apiClient.patch(`/api/user/${id}/deactivate`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi khóa tài khoản');
  }
};
const reactivateUser = async (id) => {
  const res = await apiClient.patch(`/api/user/${id}/reactivate`);
  return res.data;
};
const updateProfile = async (id, data) => {
  const res = await apiClient.patch(`/api/user/${id}`, data);
  return res.data;
};
const syncUser = async (idToken) => {
  try {
    const res = await apiClient.post(
      '/api/user/sync',
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return res.data.user;
  } catch (error) {
    console.error('❌ syncUser error:', error);
    throw new Error(error.response?.data?.message || 'Không thể đồng bộ người dùng');
  }
};

export { getCustomer, deactivateUser, reactivateUser, updateProfile, syncUser };