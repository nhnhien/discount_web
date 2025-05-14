import React, { useState } from 'react';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { Table, Button, Modal, message, Tag, Input, Tooltip, Space, Badge } from 'antd';
 import {
   EditOutlined,
   DeleteOutlined,
   EyeOutlined,
   PlusOutlined,
   ExclamationCircleOutlined,
   InfoCircleOutlined,
 } from '@ant-design/icons';
 import { useNavigate } from 'react-router-dom';
 import { getQBs, deleteQB, toggleRuleActive } from '@/service/qb';
 import { Switch } from 'antd';

 const { confirm } = Modal;
 
 const QBManager = () => {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { data, isLoading } = useQuery({ queryKey: ['quantityBreaks'], queryFn: getQBs });
 
   const mutation = useMutation({
     mutationFn: deleteQB,
     onSuccess: () => {
       message.success('Pricing rule deleted successfully!');
       queryClient.invalidateQueries(['quantityBreaks']);
     },
     onError: () => {
       message.error('Failed to delete pricing rule!');
     },
   });
   const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => toggleRuleActive(id, is_active),
    onSuccess: () => {
      message.success('Status updated successfully');
      queryClient.invalidateQueries(['quantityBreaks']);
    },
    onError: () => {
      message.error('Failed to update status');
    },
  });
  
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedRule, setSelectedRule] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
 
   const showDeleteConfirm = (id) => {
     confirm({
       title: 'Are you sure you want to delete this pricing rule?',
       icon: <ExclamationCircleOutlined />,
       okText: 'Delete',
       okType: 'danger',
       cancelText: 'Cancel',
       onOk() {
         mutation.mutate(id);
       },
     });
   };
 
   const showDetails = (rule) => {
     setSelectedRule(rule);
     setIsModalOpen(true);
   };
 
   const handleAddRule = () => {
     navigate('/admin/discount/qb/create');
   };
 
   const filteredData = data?.data.filter((rule) => rule.title.toLowerCase().includes(searchTerm.toLowerCase()));
 
   const isRuleActive = (rule) => {
     const now = new Date();
     const startDate = new Date(rule.start_date);
     const endDate = rule.end_date ? new Date(rule.end_date) : null;
 
     return startDate <= now && (!endDate || endDate >= now);
   };
 
   const columns = [
     {
       title: 'Title',
       dataIndex: 'title',
       key: 'title',
       render: (text, record) => (
         <span className='font-semibold'>
           {text}
           {isRuleActive(record) ? (
             <Badge status='success' className='ml-2' />
           ) : (
             <Badge status='error' className='ml-2' />
           )}
         </span>
       ),
     },
     {
       title: 'Minimum Quantity',
       dataIndex: 'qb_rules',
       key: 'minimum_quantity',
       render: (rules) => {
         if (!rules || !rules.length) return 'N/A';
         const sortedRules = [...rules].sort((a, b) => a.quantity - b.quantity);
         return sortedRules[0].quantity;
       },
     },
     {
       title: 'Maximum Discount',
       dataIndex: 'qb_rules',
       key: 'max_discount',
       render: (rules) => {
         if (!rules || !rules.length) return 'N/A';
         const maxDiscount = [...rules].reduce(
           (max, rule) => {
             let discount = rule.discount_type === 'percentage' ? `${rule.value}%` : `${rule.value}₫`;
             return rule.value > max.value ? { value: rule.value, display: discount } : max;
           },
           { value: 0, display: '0' },
         );
         return maxDiscount.display;
       },
     },
     {
       title: 'Number of Price Tiers',
       dataIndex: 'qb_rules',
       key: 'tiers',
       render: (rules) => {
         if (!rules || !rules.length) return '0';
         return <Tag color='blue'>{rules.length} tiers</Tag>;
       },
     },
     {
       title: 'Application Period',
       key: 'time_range',
       render: (_, record) => {
         const startDate = new Date(record.start_date).toLocaleDateString('en-US');
         const endDate = record.end_date ? new Date(record.end_date).toLocaleDateString('en-US') : 'No limit';
         return (
           <span>
             {startDate} → {endDate}
           </span>
         );
       },
     },
     {
       title: 'Status',
       key: 'status',
       render: (_, record) => {
         const active = isRuleActive(record);
         return <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Expired'}</Tag>;
       },
     },
     {
      title: 'Activation',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) => toggleMutation.mutate({ id: record.id, is_active: checked })}
        />
      ),
    },
     {
       title: 'Actions',
       key: 'action',
       render: (_, record) => (
         <Space>
           <Tooltip title='Xem chi tiết'>
             <Button
               type='primary'
               icon={<EyeOutlined />}
               onClick={() => showDetails(record)}
               className='bg-blue-500 hover:bg-blue-600'
             />
           </Tooltip>
           <Tooltip title='Chỉnh sửa'>
             <Button
               type='default'
               icon={<EditOutlined />}
               onClick={() => navigate(`/admin/discount/qb/edit/${record.id}`)}
             />
           </Tooltip>
           <Tooltip title='Xóa'>
             <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)} />
           </Tooltip>
         </Space>
       ),
     },
   ];
 
   return (
     <div className='p-6 bg-white shadow-md rounded-lg'>
       <div className='flex justify-between items-center mb-6'>
         <div>
           <h2 className='text-2xl font-bold text-gray-800'>Quantity-Based Pricing Management</h2>
           <p className='text-gray-500 mt-1'>Set up discount tiers based on product quantity</p>
         </div>
         <Button
           type='primary'
           size='large'
           icon={<PlusOutlined />}
           className='bg-blue-500 hover:bg-blue-600'
           onClick={handleAddRule}
         >
           Add New Price Tier
         </Button>
       </div>
 
       <div className='mb-5'>
         <Input
           placeholder='Search pricing rules...'
           prefix={<InfoCircleOutlined className='text-gray-400' />}
           className='rounded-lg py-2'
           allowClear
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>
 
       <Table
         dataSource={filteredData || []}
         columns={columns}
         rowKey='id'
         loading={isLoading}
         pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} items` }}
         className='shadow-sm border rounded-lg'
       />
 
       <Modal
         title={<h3 className='text-lg font-bold'>Pricing Rule Details</h3>}
         open={isModalOpen}
         onCancel={() => setIsModalOpen(false)}
         width={600}
         footer={[
           <Button key='close' size='large' onClick={() => setIsModalOpen(false)}>
             Close
           </Button>,
         ]}
       >
         {selectedRule && (
           <div className='space-y-4'>
             <div className='bg-gray-50 p-4 rounded-lg'>
               <p className='font-semibold text-lg text-gray-800'>{selectedRule.title}</p>
               <p className='text-gray-600 mt-1'>{selectedRule.description || 'No description'}</p>
             </div>
 
             <div>
               <h4 className='font-semibold mb-2 text-gray-700'>Basic Information</h4>
               <div className='grid grid-cols-2 gap-3'>
                 <div>
                   <span className='text-gray-500'>Start Date:</span>
                   <p>{new Date(selectedRule.start_date).toLocaleDateString('vi-VN')}</p>
                 </div>
                 <div>
                   <span className='text-gray-500'>End Date:</span>
                   <p>
                     {selectedRule.end_date
                       ? new Date(selectedRule.end_date).toLocaleDateString('vi-VN')
                       : 'No limit'}
                   </p>
                 </div>
                 <div>
                   <span className='text-gray-500'>Status:</span>
                   <p>
                     <Tag color={isRuleActive(selectedRule) ? 'green' : 'red'}>
                       {isRuleActive(selectedRule) ? 'Active' : 'Expired'}
                     </Tag>
                   </p>
                 </div>
                 <div>
                   <span className='text-gray-500'>Created Date:</span>
                   <p>{new Date(selectedRule.createdAt).toLocaleString('vi-VN')}</p>
                 </div>
               </div>
             </div>
 
             <div>
               <h4 className='font-semibold mb-2 text-gray-700'>Discount Levels</h4>
               <Table
                 dataSource={selectedRule.qb_rules}
                 pagination={false}
                 size='small'
                 rowKey='quantity'
                 columns={[
                   {
                     title: 'From Quantity',
                     dataIndex: 'quantity',
                     key: 'quantity',
                     render: (value) => <span className='font-medium'>{value}</span>,
                   },
                   {
                     title: 'Discount Type',
                     dataIndex: 'discount_type',
                     key: 'discount_type',
                     render: (type) => (
                       <Tag color={type === 'percentage' ? 'green' : 'blue'}>
                         {type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                       </Tag>
                     ),
                   },
                   {
                     title: 'Value',
                     dataIndex: 'value',
                     key: 'value',
                     render: (value, record) => (
                       <span className='font-medium'>
                         {record.discount_type === 'percentage' ? `${value}%` : `${value.toLocaleString()}₫`}
                       </span>
                     ),
                   },
                 ]}
               />
             </div>
 
             {selectedRule.products && selectedRule.products.length > 0 && (
               <div>
                 <h4 className='font-semibold mb-2 text-gray-700'>Applied Products</h4>
                 <div className='flex flex-wrap gap-2'>
                   {selectedRule.products.map((product) => (
                     <Tag key={product.id}>{product.name}</Tag>
                   ))}
                 </div>
               </div>
             )}
 
             {selectedRule.variants && selectedRule.variants.length > 0 && (
               <div>
                 <h4 className='font-semibold mb-2 text-gray-700'>Applied Variants</h4>
                 <div className='flex flex-wrap gap-2'>
                   {selectedRule.variants.map((variant) => (
                     <Tag key={variant.id}>{variant.sku}</Tag>
                   ))}
                 </div>
               </div>
             )}
 
             {selectedRule.customers && selectedRule.customers.length > 0 && (
               <div>
                 <h4 className='font-semibold mb-2 text-gray-700'>Applied Customers</h4>
                 <div className='flex flex-wrap gap-2'>
                   {selectedRule.customers.map((customer) => (
                     <Tag key={customer.id}>{customer.name}</Tag>
                   ))}
                 </div>
               </div>
             )}
 
             {selectedRule.markets && selectedRule.markets.length > 0 && (
               <div>
                 <h4 className='font-semibold mb-2 text-gray-700'>Applied Markets</h4>
                 <div className='flex flex-wrap gap-2'>
                   {selectedRule.markets.map((market) => (
                     <Tag key={market.id}>{market.name}</Tag>
                   ))}
                 </div>
               </div>
             )}
           </div>
         )}
       </Modal>
     </div>
   );
 };
 
 export default QBManager;