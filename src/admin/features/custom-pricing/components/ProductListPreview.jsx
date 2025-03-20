import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { calculateCPPrice } from '@/utils/caculation';
 
const ProductListPreview = ({ products, productSelected, discountValue, discountType }) => {
  console.log('🚀 ~ ProductListPreview ~ discountType:', discountType);
  const filteredProducts = products?.filter((p) => productSelected.includes(p.id)) || [];
 
   const columns = [
     {
      title: 'Sản phẩm',
       key: 'product',
       render: (_, record) => (
         <div className='flex items-center gap-3'>
           <img src={record.image_url} alt={record.name} className='w-14 h-14 object-cover rounded shadow' />
           <span className='font-medium'>{record.name}</span>
         </div>
       ),
     },
     {
       title: 'Giá gốc',
       dataIndex: 'original_price',
       key: 'original_price',
       render: (price) => <span className='text-gray-500 line-through'>{Number(price).toLocaleString()}đ</span>,
     },
     {
       title: 'Giảm giá',
       key: 'discount',
       render: (_, record) =>
         discountValue > 0 ? (
           <Tooltip title={`Giảm: ${discountValue} ${discountType === 'percentage' ? '%' : 'đ'}`}>
             <Tag color='red' className='text-sm'>
             -{discountValue}
               {discountType === 'percentage' ? '%' : 'đ'}
             </Tag>
           </Tooltip>
         ) : (
           <span className='text-gray-400'>Không giảm</span>
         ),
     },
     {
       title: 'Giá cuối',
       key: 'final_price',
       render: (_, record) => {
        const finalPrice = calculateCPPrice(record.original_price, discountValue, discountType);
        return <span className='text-red-500 font-bold'>{Number(finalPrice).toLocaleString()}đ</span>;
      },     },
     {
       title: 'Kho',
       dataIndex: 'stock_quantity',
       key: 'stock_quantity',
       render: (qty) => <span className='text-blue-500'>{qty}</span>,
     },
   ];
 
   return (
     <div className='p-4 bg-white rounded-lg shadow'>
        <Table columns={columns} dataSource={filteredProducts} rowKey='id' pagination={false} />
     </div>
   );
 };
 
 export default ProductListPreview;