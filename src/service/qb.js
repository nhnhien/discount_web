import apiClient from '@/config/axios.config';
 
 const getQBs = async () => {
   const res = await apiClient.get('/api/qb');
   return res.data;
 };
 
 const getQB = async (id) => {
   const res = await apiClient.get(`/api/qb/${id}`);
   return res.data;
 };
 
 const createQB = async (data) => {
   const res = await apiClient.post('/api/qb', data);
   return res.data;
 };
 
 const updateQB = async (id, data) => {
   const res = await apiClient.put(`/api/qb/${id}`, data);
   return res.data;
 };
 
 const deleteQB = async (id) => {
   const res = await apiClient.delete(`/api/qb/${id}`);
   return res.data;
 };
 
 const calculatePrice = async (data) => {
   const res = await apiClient.post('/api/qb/calculate-price', data);
   return res.data;
 };
 
 const getQBsByProduct = async (productId, params = {}) => {
   const res = await apiClient.get(`/api/qb/product/${productId}`, { params });
   return res.data;
 };
 
 const getQBsByVariant = async (variantId, params = {}) => {
   const res = await apiClient.get(`/api/qb/variant/${variantId}`, { params });
   return res.data;
 };
 
 const getFilteredQBs = async (filters = {}) => {
   const res = await apiClient.get('/api/qb', { params: filters });
   return res.data;
 };
 
 const applyQBToCart = async (data) => {
   const res = await apiClient.post('/api/qb/apply-to-cart', data);
   return res.data;
 };
 
 export {
   getQBs,
   getQB,
   createQB,
   updateQB,
   deleteQB,
   calculatePrice,
   getQBsByProduct,
   getQBsByVariant,
   getFilteredQBs,
   applyQBToCart,
 };