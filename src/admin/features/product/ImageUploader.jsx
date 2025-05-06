import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useUploadMutation } from '../../../hooks/useUploadMutation';

const ImageUploader = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = useUploadMutation();

  const handleUpload = async ({ file }) => {
    setUploading(true);
    try {
      const data = await uploadMutation.mutateAsync(file);
      onChange(data.url); // gán url ảnh
    } catch (error) {
      console.error(error);
      message.error('Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      listType="picture-card"
      customRequest={handleUpload}
      accept="image/*"
      showUploadList={{ showRemoveIcon: true }}
      fileList={
        value
          ? [
              {
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: typeof value === 'string' ? value : undefined,
              },
            ]
          : []
      }
      onRemove={() => {
        onChange(''); // xoá ảnh trong form
        message.success('Đã xoá ảnh');
      }}
    >
      {!value && <Button icon={<UploadOutlined />} loading={uploading} />}
    </Upload>
  );
};

export default ImageUploader;
