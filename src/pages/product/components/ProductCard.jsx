import React from 'react';
 import { Card, Button } from 'antd';
 import { ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
 
 const ProductCard = ({ product }) => {
   return (
     <Card
       hoverable
       className='relative shadow-lg rounded-xl overflow-hidden'
       cover={<img alt={product.name} src={product.image} className='h-64 object-cover w-full' />}
     >
       <div className='p-4 text-center'>
         <h3 className='text-lg font-semibold'>{product.name}</h3>
         <p className='text-gray-500'>{product.price} đ</p>
         <div className='flex justify-center gap-4 mt-4'>
           <Button type='primary' icon={<ShoppingCartOutlined />} className='bg-blue-500 hover:bg-blue-600'>
             Thêm vào giỏ
           </Button>
           <Button icon={<HeartOutlined />} className='border-gray-300 hover:border-red-500 hover:text-red-500'>
             Yêu thích
           </Button>
         </div>
       </div>
     </Card>
   );
 };
 
 export default ProductCard;