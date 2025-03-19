import Loading from '@/components/loading/Loading';
 import { getProduct } from '@/service/product';
 import { useQuery } from '@tanstack/react-query';
 import { Table, Tag, Tooltip } from 'antd';
 import React from 'react';
 
 const ProductListPreview = ({ customers }) => {
   const { data, isLoading } = useQuery({
     queryKey: ['products'],
     queryFn: () => getProduct(),
   });
 
   const columns = [
     {
       title: 'Hình ảnh',
       dataIndex: 'image_url',
       key: 'image_url',
       render: (url) => <img src={url} alt='product' className='w-14 h-14 object-cover rounded shadow' />,
     },
     {
       title: 'Tên sản phẩm',
       dataIndex: 'name',
       key: 'name',
       render: (text) => <span className='font-medium'>{text}</span>,
     },
     {
       title: 'Giá gốc',
       dataIndex: 'original_price',
       key: 'original_price',
       render: (price) => <span className='text-gray-500 line-through'>{Number(price).toLocaleString()}đ</span>,
     },
     {
       title: 'Giảm giá',
       dataIndex: 'discountPercentage',
       key: 'discountPercentage',
       render: (discount, record) =>
         discount > 0 ? (
           <Tooltip title={`Áp dụng theo rule: ${record.discountRule || 'Không rõ'}`}>
             <Tag color='red' className='text-sm'>
               -{discount}%
             </Tag>
           </Tooltip>
         ) : (
           <span className='text-gray-400'>Không giảm</span>
         ),
     },
     {
       title: 'Giá cuối',
       dataIndex: 'final_price',
       key: 'final_price',
       render: (price) => <span className='text-red-500 font-bold'>{Number(price).toLocaleString()}đ</span>,
     },
     {
       title: 'Kho',
       dataIndex: 'stock_quantity',
       key: 'stock_quantity',
       render: (qty) => <span className='text-blue-500'>{qty}</span>,
     },
   ];
 
   return (
     <div className='p-4 bg-white rounded-lg shadow'>
       {isLoading ? <Loading /> : <Table columns={columns} dataSource={data?.data} rowKey='id' pagination={false} />}
     </div>
   );
 };
 
 export default ProductListPreview;