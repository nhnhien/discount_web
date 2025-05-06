import { useMutation } from '@tanstack/react-query';

import { message } from 'antd';
import { uploadImage } from '../service/upload';

export const useUploadMutation = () => {
  return useMutation({
    mutationFn: uploadImage,
    onSuccess: (data, variables, context) => {
      message.success('Image uploaded successfully!');
    },
    onError: (error) => {
      message.error('Failed to upload image!');
      console.error('Upload Error:', error);
    },
  });
};
