import apiClient from '../config/axios.config';

const getProduct = async () => {
  try {
    const res = await apiClient.get('/api/product');
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const getProductApplyCP = async (options = {}) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId = '', userId } = options;
    const params = new URLSearchParams();

    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    if (userId) params.append('userId', userId); // ✅ BỔ SUNG DÒNG NÀY

    const res = await apiClient.get(`/api/product?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể tải sản phẩm');
  }
};



const getProductById = async (productId, userId) => {
  try {
    const query = userId ? `?userId=${userId}` : '';
    const res = await apiClient.get(`/api/product/${productId}${query}`);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const getProductApplyCPById = async (productId, userId) => {
  try {
    const res = await apiClient.get(`/api/product/${productId}?userId=${userId}`);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const createProduct = async (product) => {
  try {
    const res = await apiClient.post('/api/product', product);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const editProduct = async (productId, product) => {
  try {
    const res = await apiClient.patch(`/api/product/${productId}`, product);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteProduct = async (productId) => {
  try {
    const res = await apiClient.delete(`/api/product/${productId}`);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export {
  getProduct,
  getProductById,
  createProduct,
  editProduct,
  deleteProduct,
  getProductApplyCP,
  getProductApplyCPById,
};