import apiClient from '../config/axios.config';

const getProduct = async () => {
  try {
    const res = await apiClient.get('/api/product');
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};
const getProductApplyCP = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId = '' } = options;
    const params = new URLSearchParams();

    if (userId) params.append('userId', userId);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);

    const queryString = params.toString();
    const res = await apiClient.get(`/api/product?${queryString}`);
    return res.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể tải sản phẩm');
  }
};

const getProductById = async (productId) => {
  try {
    const res = await apiClient.get(`/api/product/${productId}`);
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

export { getProduct, getProductById, createProduct, editProduct, deleteProduct, getProductApplyCP };
