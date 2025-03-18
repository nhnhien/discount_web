import React, { useState } from 'react';
 import { useForm, Controller } from 'react-hook-form';
 import { Input, DatePicker, Button, Radio, Card, Form, Modal, Select, Tag } from 'antd';
 import dayjs from 'dayjs';
 import { useQuery } from '@tanstack/react-query';
 import { getMarket } from '@/service/market';
 import { getProduct } from '@/service/product';
 import { getCustomer } from '@/service/user';
 
 const CPEditor = ({ initialData = {}, onSubmit }) => {
   const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
   const [isProductModalVisible, setIsProductModalVisible] = useState(false);
   const [applyTo, setApplyTo] = useState(initialData.applyTo || 'product');
 
   const { data: markets } = useQuery({ queryKey: ['markets'], queryFn: getMarket });
   const { data: products } = useQuery({ queryKey: ['products'], queryFn: getProduct });
   const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: getCustomer });
 
   const { control, handleSubmit, watch, setValue } = useForm({
     defaultValues: {
       title: initialData.title || '',
       priority: initialData.priority || '0',
       discount_type: initialData.discount_type || 'percentage',
       discount_value: initialData.discount_value || '',
       start_date: initialData.start_date ? dayjs(initialData.start_date) : null,
       end_date: initialData.end_date ? dayjs(initialData.end_date) : null,
       customerType: initialData.customerType || 'all',
       selectedCustomers: initialData.selectedCustomers || [],
       marketType: initialData.marketType || 'all',
       selectedMarkets: initialData.selectedMarkets || [],
       productType: initialData.productType || 'product',
       selectedProducts: initialData.selectedProducts || [],
     },
   });
 
   const selectedCustomers = watch('selectedCustomers');
   const selectedProducts = watch('selectedProducts');
   const discountType = watch('discount_type');
   const marketType = watch('marketType');
 
   return (
     <div className='p-6 rounded-lg max-w-[1100px] mx-auto h-[80vh]'>
       <h2 className='text-2xl font-semibold mb-6'>{initialData.id ? 'Chỉnh sửa' : 'Tạo mới'} Custom Pricing</h2>
       <Form layout='vertical' onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
         <div className='grid grid-cols-2 gap-6'>
           <label className='ml-4 font-medium text-base'>Thông tin chung</label>
           <Card className='w-full space-y-4 p-4 shadow-sm'>
             <Controller
               name='title'
               control={control}
               render={({ field }) => (
                 <Form.Item label='Tên giảm giá' required>
                   <Input {...field} placeholder='Nhập tên chương trình' />
                 </Form.Item>
               )}
             />
 
             <Controller
               name='priority'
               control={control}
               render={({ field }) => (
                 <Form.Item label='Priority' required>
                   <Input {...field} type='number' min={0} />
                 </Form.Item>
               )}
             />
 
             <div className='grid grid-cols-2 gap-4'>
               <Controller
                 name='start_date'
                 control={control}
                 render={({ field }) => (
                   <Form.Item label='Ngày bắt đầu' required>
                     <DatePicker
                       {...field}
                       className='w-full'
                       showTime
                       format='DD/MM/YYYY HH:mm'
                       disabledDate={(current) => current && current < dayjs().startOf('day')}
                     />
                   </Form.Item>
                 )}
               />
 
               <Controller
                 name='end_date'
                 control={control}
                 render={({ field }) => (
                   <Form.Item label='Ngày kết thúc' required>
                     <DatePicker
                       {...field}
                       className='w-full'
                       showTime
                       format='DD/MM/YYYY HH:mm'
                       disabledDate={(current) => current && current < watch('start_date')}
                     />
                   </Form.Item>
                 )}
               />
             </div>
           </Card>
         </div>
 
         <div className='grid grid-cols-2 gap-6'>
           <label className='ml-4 font-medium text-base'>Loại giảm giá</label>
           <Card className='w-full p-4 shadow-sm space-y-4'>
             <Controller
               name='discount_type'
               control={control}
               render={({ field }) => (
                 <Radio.Group {...field} className='flex flex-col space-y-3'>
                   <Radio value='percentage'>Giảm giá theo phần trăm</Radio>
                   <Radio value='fixed'>Áp dụng mức giá cố định</Radio>
                 </Radio.Group>
               )}
             />
 
             <div className='pt-4'>
               <Controller
                 name='discount_value'
                 control={control}
                 render={({ field }) => (
                   <Form.Item label='Giá trị' required>
                     <Input
                       {...field}
                       type='number'
                       min={0}
                       placeholder={`Nhập ${discountType === 'percentage' ? 'phần trăm' : 'số tiền'}`}
                       addonAfter={discountType === 'percentage' ? '%' : 'VND'}
                     />
                   </Form.Item>
                 )}
               />
             </div>
           </Card>
         </div>
 
         <div className='grid grid-cols-2 gap-6'>
           <label className='ml-4 font-medium text-base'>Chọn thị trường</label>
           <Card className='w-full p-4 shadow-sm space-y-4'>
             <Controller
               name='marketType'
               control={control}
               render={({ field }) => (
                 <Radio.Group {...field} className='flex flex-col space-y-3'>
                   <Radio value='all'>Tất cả thị trường</Radio>
                   <Radio value='specific'>Thị trường cụ thể</Radio>
                 </Radio.Group>
               )}
             />
 
             <div className='pt-4'>
               {marketType === 'specific' && (
                 <Controller
                   name='selectedMarkets'
                   control={control}
                   render={({ field }) => (
                     <Select
                       mode='multiple'
                       placeholder='Chọn thị trường'
                       options={markets?.data?.map((m) => ({ label: m.name, value: m.id }))}
                       {...field}
                     />
                   )}
                 />
               )}
             </div>
           </Card>
         </div>
 
         <div className='grid grid-cols-2 gap-6'>
           <label className='ml-4 font-medium text-base'>Áp dụng cho khách hàng</label>
           <Card className='w-full p-4 shadow-sm'>
             <Controller
               name='customerType'
               control={control}
               render={({ field }) => (
                 <>
                   <Radio.Group {...field} className='flex flex-col space-y-3'>
                     <Radio value='all'>Tất cả khách hàng</Radio>
                     <Radio value='logged-in'>Khách đã đăng nhập</Radio>
                     <Radio value='not-logged-in'>Khách vãng lai</Radio>
                     <Radio value='specific'>Chọn khách hàng cụ thể</Radio>
                   </Radio.Group>
 
                   {field.value === 'specific' && (
                     <div className='mt-4'>
                       <Button type='dashed' onClick={() => setIsCustomerModalVisible(true)}>
                         + Chọn khách hàng
                       </Button>
                       <div className='mt-2'>
                         {selectedCustomers.map((id) => {
                           const customer = customers.data?.find((c) => c.id === id);
                           return customer ? (
                             <Tag
                               key={id}
                               className='m-1'
                               closable
                               onClose={() => {
                                 setValue(
                                   'selectedCustomers',
                                   selectedCustomers.filter((cId) => cId !== id),
                                 );
                               }}
                             >
                               {customer.name}
                             </Tag>
                           ) : null;
                         })}
                       </div>
                     </div>
                   )}
                 </>
               )}
             />
           </Card>
         </div>
         <div className='grid grid-cols-2 gap-6'>
           <label className='ml-4 font-medium text-base'>Áp dụng cho sản phẩm</label>
           <Card className='w-full p-4 shadow-sm'>
             <Controller
               name='productType'
               control={control}
               render={({ field }) => (
                 <Radio.Group {...field} className='flex flex-col space-y-3'>
                   <Radio value='product'>Tất cả sản phẩm</Radio>
                   <Radio value='variant'>Phiên bản cụ thể</Radio>
                   <Radio value='collection'>Bộ sưu tập</Radio>
                   <Radio value='tags'>Theo tags</Radio>
                 </Radio.Group>
               )}
             />
 
             {(applyTo === 'variant' || applyTo === 'product') && (
               <div className='mt-4'>
                 <Button type='dashed' onClick={() => setIsProductModalVisible(true)}>
                   + Chọn sản phẩm
                 </Button>
                 <div className='mt-2'>
                   {selectedProducts.map((id) => {
                     const product = products.data?.find((p) => p.id === id);
                     return product ? (
                       <Tag
                         key={id}
                         className='m-1'
                         closable
                         onClose={() => {
                           setValue(
                             'selectedProducts',
                             selectedProducts.filter((pId) => pId !== id),
                           );
                         }}
                       >
                         {product.name}
                       </Tag>
                     ) : null;
                   })}
                 </div>
               </div>
             )}
           </Card>
         </div>
 
         <CustomerModal
           control={control}
           customers={customers}
           isVisible={isCustomerModalVisible}
           onClose={() => setIsCustomerModalVisible(false)}
           selectedCustomers={selectedCustomers}
         />
         <ProductModal
           control={control}
           products={products}
           isVisible={isProductModalVisible}
           onClose={() => setIsProductModalVisible(false)}
           selectedProducts={selectedProducts}
         />
 
         {/* Submit Button */}
         <div className='flex justify-end gap-4 my-8'>
           <Button type='primary' htmlType='submit' size='large' className='min-w-[120px]'>
             {initialData.id ? 'Cập nhật' : 'Tạo mới'}
           </Button>
         </div>
       </Form>
     </div>
   );
 };
 
 const CustomerModal = ({ control, customers, isVisible, onClose, selectedCustomers }) => {
   return (
     <Modal
       title='Chọn khách hàng'
       visible={isVisible}
       onCancel={onClose}
       footer={[
         <Button key='submit' type='primary' onClick={onClose}>
           Xác nhận
         </Button>,
       ]}
       width={800}
     >
       <Controller
         name='selectedCustomers'
         control={control}
         render={({ field }) => (
           <Select
             mode='multiple'
             placeholder='Tìm kiếm khách hàng'
             value={selectedCustomers}
             optionFilterProp='children'
             className='w-full'
             options={customers?.data?.map((c) => ({ label: c.name, value: c.id }))}
             filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
             {...field}
           />
         )}
       />
     </Modal>
   );
 };
 
 const ProductModal = ({ control, products, isVisible, onClose, selectedProducts }) => {
   return (
     <Modal
       title='Chọn sản phẩm'
       visible={isVisible}
       onCancel={onClose}
       footer={[
         <Button key='submit' type='primary' onClick={onClose}>
           Xác nhận
         </Button>,
       ]}
       width={800}
     >
       <Controller
         name='selectedProducts'
         control={control}
         render={({ field }) => (
           <Select
             mode='multiple'
             placeholder='Tìm kiếm sản phẩm'
             value={selectedProducts}
             optionFilterProp='children'
             className='w-full'
             options={products?.data?.map((p) => ({ label: p.name, value: p.id }))}
             filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
             {...field}
           />
         )}
       />
     </Modal>
   );
 };
 
 export default CPEditor;