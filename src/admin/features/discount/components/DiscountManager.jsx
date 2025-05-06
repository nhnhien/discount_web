import React from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Space,
  Popconfirm,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getAllDiscounts,
  deleteDiscount,
  toggleDiscountActive
} from '@/service/discount';
import { Switch } from 'antd';

const { Title } = Typography;

const DiscountManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: getAllDiscounts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      message.success('Discount code deleted successfully');
      queryClient.invalidateQueries(['discounts']);
    },
    onError: () => {
      message.error('Failed to delete discount code');
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => toggleDiscountActive(id, is_active),
    onSuccess: () => {
      message.success('Status updated successfully');
      queryClient.invalidateQueries(['discounts']);
    },
    onError: () => {
      message.error('Failed to update status');
    },
  });
  
  const columns = [
    {
      title: 'Code',
      dataIndex: 'discount_code',
      key: 'code',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'discount_type',
      key: 'type',
      render: (type) => {
        const map = {
          percentage: 'Percentage',
          fixed: 'Fixed Amount',
          free_shipping: 'Free Shipping',
        };
        return map[type] || type;
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (val, record) =>
        record.discount_type === 'percentage'
          ? `${val}%`
          : record.discount_type === 'fixed'
          ? `${val.toLocaleString('vi-VN')}đ`
          : '-',
    },
    {
      title: 'Time',
      key: 'date',
      render: (_, record) => (
        <span>
          {record.start_date?.slice(0, 10)} → {record.end_date?.slice(0, 10)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'status',
      render: (isActive) =>
        isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: 'Activation',
      dataIndex: 'is_active',
      key: 'toggle',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) =>
            toggleMutation.mutate({ id: record.id, is_active: checked })
          }
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
            onClick={() => navigate(`/admin/discount/edit/${record.id}`)}
          />
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Card
        title={<Title level={4}>Discount Code Management</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/discount/create')}
          >
            Create New
          </Button>
        }
        bordered={false}
        className="shadow-sm rounded-lg"
      >
<Table
  loading={isLoading}
  dataSource={Array.isArray(data) ? data : []} // thêm protection vẫn tốt
  columns={columns}
  rowKey="id"
  pagination={{ pageSize: 10 }}
/>



      </Card>
    </div>
  );
};

export default DiscountManager;