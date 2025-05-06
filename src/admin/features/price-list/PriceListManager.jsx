import React, { useMemo } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getRules, deleteRule, toggleRuleActive  } from '@/service/cp';
import { Switch } from 'antd';

const PriceListManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['price-list-rules'], // ✅ key khác hoàn toàn
    queryFn: () => getRules(true), // lấy price list
  });
  
  // ✅ Lọc chỉ lấy Price List (is_price_list = true)
  const priceLists = useMemo(() => {
    return data?.data?.filter((rule) => rule.is_price_list) || [];
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      message.success('Price List deleted successfully');
      queryClient.invalidateQueries(['price-list-rules']); // ✅ đúng key
    },
    onError: (err) => {
      message.error(`Delete failed: ${err.message}`);
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => toggleRuleActive(id, is_active),
    onSuccess: () => {
      message.success('Status updated successfully');
      queryClient.invalidateQueries(['price-list-rules']);
    },
    onError: () => {
      message.error('Failed to update status');
    },
  });
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className='font-medium'>{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <span className='italic text-gray-400'>None</span>,
    },
    {
      title: 'Discount',
      dataIndex: 'discount_value',
      key: 'discount',
      render: (_, record) => {
        if (
          (record.discount_type === 'percentage' || record.discount_type === 'fixed price') &&
          Number(record.discount_value) > 0
        ) {
          return record.discount_type === 'percentage' ? (
            <Tag color='green'>-{record.discount_value}%</Tag>
          ) : (
            <Tag color='blue'>
              -{Number(record.discount_value || 0).toLocaleString()}₫
            </Tag>
          );
        }
        return <Tag color='default'>Custom by product</Tag>;
      },
    },
    
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (val) =>
        val ? dayjs(val).format('DD/MM/YYYY') : <span className='text-gray-400'>---</span>,
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (val) =>
        val ? dayjs(val).format('DD/MM/YYYY') : <span className='text-gray-400'>No limit</span>,
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
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/discount/pl/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title='Are you sure you want to delete this Price List?'
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText='Delete'
            cancelText='Cancel'
          >
            <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isLoading}>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold'>Price List Management</h2>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/discount/pl/create')}
        >
          Tạo mới
        </Button>
      </div>

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={priceLists}
        rowKey='id'
        bordered
      />
    </div>
  );
};

export default PriceListManager;
