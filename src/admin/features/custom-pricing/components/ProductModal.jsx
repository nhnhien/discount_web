import { Button, Modal, Select } from 'antd';
 import { Controller } from 'react-hook-form';
 
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
         name='selected_products'
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
 
 export default ProductModal;