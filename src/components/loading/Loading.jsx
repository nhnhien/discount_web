import React from 'react';
 import { Spin } from 'antd';
 import { LoadingOutlined } from '@ant-design/icons';
 
 const Loading = ({ size = 'large' }) => {
   return (
     <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
       <div className='bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center'>
         <Spin indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />} className='text-blue-500' />
       </div>
     </div>
   );
 };
 
 export default Loading;