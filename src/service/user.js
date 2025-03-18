import apiClient from '@/config/axios.config';
 const getCustomer = async () => {
   try {
     const res = await apiClient.get('/api/user/customer');
     return res.data;
   } catch (error) {
     throw new Error(error);
   }
 };
 export { getCustomer };