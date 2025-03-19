import apiClient from '../config/axios.config';

const getProduct = async (customerIds) => {
  try {
    const res = await apiClient.get(`/api/product/?customerIds=${customerIds}`);
    return res.data;
  } catch (error) {
    throw new Error(error);
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

const editProduct = async (product, productId) => {
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


export { getProduct, getProductById, createProduct, editProduct, deleteProduct };
