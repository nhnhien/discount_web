import apiClient from '../config/axios.config';
<<<<<<< HEAD
 
 const getCategory = async () => {
   try {
     const res = await apiClient.get('/api/category');
     return res.data;
   } catch (error) {
     throw new Error(error);
   }
 };
 
 export { getCategory };
=======

const getCategory = async () => {
  try {
    const res = await apiClient.get('/api/category');
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export { getCategory };
>>>>>>> 578b5de (update: UI admin)
