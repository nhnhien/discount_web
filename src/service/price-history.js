import apiClient from '@/config/axios.config';
 
 // Lấy lịch sử giá của một sản phẩm
 const getProductPriceHistory = async (productId) => {
   const res = await apiClient.get(`/api/price-history/products/${productId}`);
   return res.data;
 };
 
 // Lấy lịch sử giá của một biến thể
 const getVariantPriceHistory = async (variantId) => {
   const res = await apiClient.get(`/api/price-history/variants/${variantId}`);
   return res.data;
 };
 
 // Lấy tất cả lịch sử giá (thường dùng cho admin)
 const getAllPriceHistory = async (params = {}) => {
   const res = await apiClient.get('/api/price-history', { params });
   return res.data;
 };
 
 export { getProductPriceHistory, getVariantPriceHistory, getAllPriceHistory };