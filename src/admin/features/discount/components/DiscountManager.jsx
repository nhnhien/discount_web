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
} from '@/service/discount';

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
      message.success('Đã xoá mã giảm giá');
      queryClient.invalidateQueries(['discounts']);
    },
    onError: () => {
      message.error('Không thể xoá mã giảm giá');
    },
  });

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'discount_code',
      key: 'code',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Loại',
      dataIndex: 'discount_type',
      key: 'type',
      render: (type) => {
        const map = {
          percentage: 'Phần trăm',
          fixed: 'Giảm cố định',
          free_shipping: 'Miễn phí vận chuyển',
        };
        return map[type] || type;
      },
    },
    {
      title: 'Giá trị',
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
      title: 'Thời gian',
      key: 'date',
      render: (_, record) => (
        <span>
          {record.start_date?.slice(0, 10)} → {record.end_date?.slice(0, 10)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'status',
      render: (isActive) =>
        isActive ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng áp dụng</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/discount/edit/${record.id}`)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xoá?"
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
        title={<Title level={4}>Quản lý mã giảm giá</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/discount/create')}
          >
            Tạo mới
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