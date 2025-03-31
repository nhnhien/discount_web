import apiClient from '../config/axios.config';
 
 export const cartService = {
   getCart: async (userId) => {
     try {
       const response = await apiClient.get(`/api/cart?userId=${userId}`);
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 
   addToCart: async (productData) => {
     try {
       const response = await apiClient.post('api/cart', productData);
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 
   updateCartItem: async (cartItemId, quantity) => {
     try {
       const response = await apiClient.put(`api/cart/items/${cartItemId}`, { quantity });
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 
   removeCartItem: async (cartItemId) => {
     try {
       const response = await apiClient.delete(`api/cart/items/${cartItemId}`);
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 
   clearCart: async () => {
     try {
       const response = await apiClient.post('api/cart/clear');
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 
   updateShippingInfo: async (shippingData) => {
     try {
       const response = await apiClient.put('api/cart/shipping', shippingData);
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 
   applyDiscount: async (discountCode) => {
     try {
       const response = await apiClient.post('/cart/discount', { discount_code: discountCode });
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 
   removeDiscount: async () => {
     try {
       const response = await apiClient.delete('/cart/discount');
       return response.data;
     } catch (error) {
       throw new Error(error);
     }
   },
 };