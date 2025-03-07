import apiClient from '../config/axios.config';

const getProduct = async () => {
  try {
    const res = await apiClient.get('/api/product');
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export { getProduct };