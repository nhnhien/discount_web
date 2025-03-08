import apiClient from '../config/axios.config';


const getMarket = async () => {
  try {
    const res = await apiClient.get('/api/market');
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export { getMarket };
