import apiClient from '../config/axios.config';
<<<<<<< HEAD
 
 const getMarket = async () => {
   try {
     const res = await apiClient.get('/api/market');
     return res.data;
   } catch (error) {
     throw new Error(error);
   }
 };
 
 export { getMarket };
=======

const getMarket = async () => {
  try {
    const res = await apiClient.get('/api/market');
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export { getMarket };
>>>>>>> 578b5de (update: UI admin)
