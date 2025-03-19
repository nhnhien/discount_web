import { Button, Modal, Select } from 'antd';
 import { Controller } from 'react-hook-form';
 
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
         name='selected_customers'
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
 
 export default CustomerModal;