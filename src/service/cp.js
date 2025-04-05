import apiClient from '@/config/axios.config';

const getRules = async (isPriceList = false) => {
  const res = await apiClient.get('/api/cp', {
    params: { is_price_list: isPriceList ? 1 : 0 },
  });
  return res.data;
};


const createRule = async (rule, isPriceList = false) => {
  const res = await apiClient.post('/api/cp', { ...rule, is_price_list: isPriceList });
  return res.data;
};

const updateRule = async (id, rule, isPriceList = false) => {
  const res = await apiClient.patch(`/api/cp/${id}`, { ...rule, is_price_list: isPriceList });
  return res.data;
};


const getRule = async (id) => {
  const res = await apiClient.get(`/api/cp/${id}`);
  return res.data;
};

const deleteRule = async (id) => {
  const res = await apiClient.delete(`/api/cp/${id}`);
  return res.data;
};

export { getRules, getRule, deleteRule, createRule, updateRule };
