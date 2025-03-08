import { useMutation } from '@tanstack/react-query';

import { message } from 'antd';
import { uploadImage } from '../service/upload';

export const useUploadMutation = () => {
  return useMutation({
    mutationFn: uploadImage,
    onSuccess: (data, variables, context) => {
      message.success('Ảnh đã được tải lên thành công!');
    },
    onError: (error) => {
      message.error('Có lỗi khi tải ảnh lên!');
      console.error('Upload Error:', error);
    },
  });
};
