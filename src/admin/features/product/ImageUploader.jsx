import React, { useState } from 'react';
 import { Upload, Button } from 'antd';
 import { UploadOutlined } from '@ant-design/icons';
 import { useUploadMutation } from '../../../hooks/useUploadMutation';
 
 const ImageUploader = ({ value, onChange }) => {
   const [uploading, setUploading] = useState(false);
   const uploadMutation = useUploadMutation();
 
   const handleUpload = async ({ file }) => {
     setUploading(true);
     try {
       const data = await uploadMutation.mutateAsync(file);
       onChange(data.url);
     } catch (error) {
       console.error(error);
     } finally {
       setUploading(false);
     }
   };
 
   return (
     <Upload
       listType='picture-card'
       customRequest={handleUpload}
       showUploadList={{ showRemoveIcon: true }}
       accept='image/*'
       fileList={value ? [{ uid: '-1', name: 'image.png', url: typeof value === 'string' ? value : undefined }] : []}
     >
       <Button icon={<UploadOutlined />} loading={uploading} />
     </Upload>
   );
 };
 
 export default ImageUploader;