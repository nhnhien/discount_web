import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomer, deactivateUser, reactivateUser } from '@/service/user';
import { Table, Tag, Space, Button, Popconfirm, message, Avatar, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const CustomerManager = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomer,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      message.success('Đã khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => {
      message.error('Không thể khóa tài khoản');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => {
      message.success('Đã kích hoạt lại tài khoản');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => {
      message.error('Không thể kích hoạt lại tài khoản');
    },
  });

  const handleDeactivate = (id) => {
    deactivateMutation.mutate(id);
  };

  const handleReactivate = (id) => {
    reactivateMutation.mutate(id);
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} alt={record.name} />
          <div>
            <Typography.Text strong>{record.name || 'Không rõ'}</Typography.Text>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active) =>
        is_active ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Đã bị khóa</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.is_active ? (
            <Popconfirm
              title="Bạn có chắc muốn khóa tài khoản này?"
              onConfirm={() => handleDeactivate(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger type="primary">
                Khóa
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn kích hoạt lại tài khoản này?"
              onConfirm={() => handleReactivate(record.id)}
              okText="Kích hoạt"
              cancelText="Hủy"
            >
              <Button type="default">Kích hoạt</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý khách hàng</h2>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
          Làm mới
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default CustomerManager;