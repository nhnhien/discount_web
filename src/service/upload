import apiClient from '../config/axios.config';

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export { uploadImage };
