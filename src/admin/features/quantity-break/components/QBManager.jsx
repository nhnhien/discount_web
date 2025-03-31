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
 import { getQBs } from '@/service/qb';
 import { deleteQB } from '@/service/qb';
 
 const { confirm } = Modal;
 
 const QBManager = () => {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { data, isLoading } = useQuery({ queryKey: ['quantityBreaks'], queryFn: getQBs });
 
   const mutation = useMutation({
     mutationFn: deleteQB,
     onSuccess: () => {
       message.success('Xóa pricing rule thành công!');
       queryClient.invalidateQueries(['quantityBreaks']);
     },
     onError: () => {
       message.error('Xóa pricing rule thất bại!');
     },
   });
 
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedRule, setSelectedRule] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
 
   const showDeleteConfirm = (id) => {
     confirm({
       title: 'Bạn có chắc muốn xóa pricing rule này?',
       icon: <ExclamationCircleOutlined />,
       okText: 'Xóa',
       okType: 'danger',
       cancelText: 'Hủy',
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
       title: 'Tiêu đề',
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
       title: 'Số lượng tối thiểu',
       dataIndex: 'qb_rules',
       key: 'minimum_quantity',
       render: (rules) => {
         if (!rules || !rules.length) return 'N/A';
         const sortedRules = [...rules].sort((a, b) => a.quantity - b.quantity);
         return sortedRules[0].quantity;
       },
     },
     {
       title: 'Mức giảm lớn nhất',
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
       title: 'Số mức giá',
       dataIndex: 'qb_rules',
       key: 'tiers',
       render: (rules) => {
         if (!rules || !rules.length) return '0';
         return <Tag color='blue'>{rules.length} mức</Tag>;
       },
     },
     {
       title: 'Thời gian áp dụng',
       key: 'time_range',
       render: (_, record) => {
         const startDate = new Date(record.start_date).toLocaleDateString('vi-VN');
         const endDate = record.end_date ? new Date(record.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn';
         return (
           <span>
             {startDate} → {endDate}
           </span>
         );
       },
     },
     {
       title: 'Trạng thái',
       key: 'status',
       render: (_, record) => {
         const active = isRuleActive(record);
         return <Tag color={active ? 'green' : 'red'}>{active ? 'Đang áp dụng' : 'Hết hạn'}</Tag>;
       },
     },
     {
       title: 'Hành động',
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
           <h2 className='text-2xl font-bold text-gray-800'>Quản lý Giá theo Số lượng</h2>
           <p className='text-gray-500 mt-1'>Thiết lập các mức giá giảm dựa trên số lượng sản phẩm</p>
         </div>
         <Button
           type='primary'
           size='large'
           icon={<PlusOutlined />}
           className='bg-blue-500 hover:bg-blue-600'
           onClick={handleAddRule}
         >
           Thêm Mức Giá Mới
         </Button>
       </div>
 
       <div className='mb-5'>
         <Input
           placeholder='Tìm kiếm pricing rule...'
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
         pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} mục` }}
         className='shadow-sm border rounded-lg'
       />
 
       <Modal
         title={<h3 className='text-lg font-bold'>Chi tiết Pricing Rule</h3>}
         open={isModalOpen}
         onCancel={() => setIsModalOpen(false)}
         width={600}
         footer={[
           <Button key='close' size='large' onClick={() => setIsModalOpen(false)}>
             Đóng
           </Button>,
         ]}
       >
         {selectedRule && (
           <div className='space-y-4'>
             <div className='bg-gray-50 p-4 rounded-lg'>
               <p className='font-semibold text-lg text-gray-800'>{selectedRule.title}</p>
               <p className='text-gray-600 mt-1'>{selectedRule.description || 'Không có mô tả'}</p>
             </div>
 
             <div>
               <h4 className='font-semibold mb-2 text-gray-700'>Thông tin cơ bản</h4>
               <div className='grid grid-cols-2 gap-3'>
                 <div>
                   <span className='text-gray-500'>Ngày bắt đầu:</span>
                   <p>{new Date(selectedRule.start_date).toLocaleDateString('vi-VN')}</p>
                 </div>
                 <div>
                   <span className='text-gray-500'>Ngày kết thúc:</span>
                   <p>
                     {selectedRule.end_date
                       ? new Date(selectedRule.end_date).toLocaleDateString('vi-VN')
                       : 'Không giới hạn'}
                   </p>
                 </div>
                 <div>
                   <span className='text-gray-500'>Trạng thái:</span>
                   <p>
                     <Tag color={isRuleActive(selectedRule) ? 'green' : 'red'}>
                       {isRuleActive(selectedRule) ? 'Đang áp dụng' : 'Hết hạn'}
                     </Tag>
                   </p>
                 </div>
                 <div>
                   <span className='text-gray-500'>Ngày tạo:</span>
                   <p>{new Date(selectedRule.createdAt).toLocaleString('vi-VN')}</p>
                 </div>
               </div>
             </div>
 
             <div>
               <h4 className='font-semibold mb-2 text-gray-700'>Các mức giảm giá</h4>
               <Table
                 dataSource={selectedRule.qb_rules}
                 pagination={false}
                 size='small'
                 rowKey='quantity'
                 columns={[
                   {
                     title: 'Từ số lượng',
                     dataIndex: 'quantity',
                     key: 'quantity',
                     render: (value) => <span className='font-medium'>{value}</span>,
                   },
                   {
                     title: 'Loại giảm giá',
                     dataIndex: 'discount_type',
                     key: 'discount_type',
                     render: (type) => (
                       <Tag color={type === 'percentage' ? 'green' : 'blue'}>
                         {type === 'percentage' ? 'Phần trăm' : 'Giảm trực tiếp'}
                       </Tag>
                     ),
                   },
                   {
                     title: 'Giá trị',
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
                 <h4 className='font-semibold mb-2 text-gray-700'>Sản phẩm áp dụng</h4>
                 <div className='flex flex-wrap gap-2'>
                   {selectedRule.products.map((product) => (
                     <Tag key={product.id}>{product.name}</Tag>
                   ))}
                 </div>
               </div>
             )}
 
             {selectedRule.variants && selectedRule.variants.length > 0 && (
               <div>
                 <h4 className='font-semibold mb-2 text-gray-700'>Biến thể áp dụng</h4>
                 <div className='flex flex-wrap gap-2'>
                   {selectedRule.variants.map((variant) => (
                     <Tag key={variant.id}>{variant.sku}</Tag>
                   ))}
                 </div>
               </div>
             )}
 
             {selectedRule.customers && selectedRule.customers.length > 0 && (
               <div>
                 <h4 className='font-semibold mb-2 text-gray-700'>Khách hàng áp dụng</h4>
                 <div className='flex flex-wrap gap-2'>
                   {selectedRule.customers.map((customer) => (
                     <Tag key={customer.id}>{customer.name}</Tag>
                   ))}
                 </div>
               </div>
             )}
 
             {selectedRule.markets && selectedRule.markets.length > 0 && (
               <div>
                 <h4 className='font-semibold mb-2 text-gray-700'>Thị trường áp dụng</h4>
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