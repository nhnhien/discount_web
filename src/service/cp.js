import apiClient from '@/config/axios.config';
 
 const getRules = async () => {
   try {
     const res = await apiClient.get('/api/cp');
     return res.data;
   } catch (error) {
     throw new Error(error);
   }
 };
 const createRule = async (rule) => {
  try {
    const res = await apiClient.post('/api/cp', rule);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};
const updateRule = async (ruleId, rule) => {
  try {
    const res = await apiClient.patch(`/api/cp/${ruleId}`, rule);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};
 const getRule = async (ruleId) => {
   try {
     const res = await apiClient.get(`/api/cp/${ruleId}`);
     return res.data;
   } catch (error) {
     throw new Error(error);
   }
 };
 const deleteRule = async (ruleId) => {
   try {
     const res = await apiClient.delete(`/api/cp/${ruleId}`);
     return res.data;
   } catch (error) {
     throw new Error(error);
   }
 };
 export { getRules, getRule, deleteRule, createRule, updateRule };