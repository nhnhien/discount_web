import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRules, deleteRule } from '@/service/cp';
import { Table, Button, Modal, message, Tag, Input } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { confirm } = Modal;

const CPManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['cp-rules'], // ✅ tách biệt key
    queryFn: () => getRules(false), // lấy custom pricing
  });
  
  
  const mutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      message.success('Xóa rule thành công!');
      queryClient.invalidateQueries(['cp-rules']); // ✅ đúng key
    },
    onError: () => {
      message.error('Xóa rule thất bại!');
    },
  });
  

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Bạn có chắc muốn xóa rule này?',
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
    navigate('/admin/discount/cp/create');
  };

  const filteredData = data?.data.filter((rule) => rule.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns = [
    {
      title: 'Giảm giá',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className='font-semibold'>{text}</span>,
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
      dataIndex: 'discount_value',
      key: 'discount_value',
      render: (value, record) => (record.discount_type === 'percentage' ? `${value}%` : `${value}₫`),
    },
    {
      title: 'Thời gian',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (_, record) => (
        <span>
          {record.start_date} → {record.end_date}
        </span>
      ),
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => <span>{new Date(createdAt).toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <div className='flex space-x-2'>
          <Button
            type='primary'
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            className='bg-blue-500 hover:bg-blue-600'
          />
          <Button
            type='default'
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/discount/cp/edit/${record.id}`)}
          />
          <Button type='danger' icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className='p-6 bg-white shadow-md rounded-lg'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold text-gray-800'>Quản lý Rules</h2>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          className='bg-blue-500 hover:bg-blue-600'
          onClick={handleAddRule}
        >
          Thêm Rule
        </Button>
      </div>

      <Input
        placeholder='Tìm kiếm rule...'
        className='mb-4'
        allowClear
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table
        dataSource={filteredData || []}
        columns={columns}
        rowKey='id'
        loading={isLoading}
        pagination={{ total: filteredData?.length, pageSize: 10 }}
      />

      <Modal
        title='Chi tiết Rule'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key='close' onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedRule && (
          <div className='space-y-2'>
            <p>
              <strong>Tiêu đề:</strong> {selectedRule.title}
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedRule.description}
            </p>
            <p>
              <strong>Loại giảm giá:</strong>{' '}
              {selectedRule.discount_type === 'percentage' ? 'Phần trăm' : 'Giảm trực tiếp'}
            </p>
            <p>
              <strong>Giá trị:</strong>{' '}
              {selectedRule.discount_type === 'percentage'
                ? `${selectedRule.discount_value}%`
                : `${selectedRule.discount_value}₫`}
            </p>
            <p>
              <strong>Thời gian:</strong> {selectedRule.start_date} → {selectedRule.end_date}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CPManager;
