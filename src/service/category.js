import apiClient from '../config/axios.config';

const getCategory = async () => {
  try {
    const res = await apiClient.get('/api/category');
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export { getCategory };
