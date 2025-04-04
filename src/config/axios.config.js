import axios from 'axios';
import { getAuth } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error('Lỗi lấy token Firebase:', err);
      }
    }
    
    

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;