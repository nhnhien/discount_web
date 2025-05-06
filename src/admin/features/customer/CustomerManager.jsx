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
      message.success('Account deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => {
      message.error('Failed to deactivate account');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => {
      message.success('Account reactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => {
      message.error('Failed to reactivate account');
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
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} alt={record.name} />
          <div>
            <Typography.Text strong>{record.name || 'Unknown'}</Typography.Text>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active) =>
        is_active ? <Tag color="green">Active</Tag> : <Tag color="red">Deactivated</Tag>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.is_active ? (
            <Popconfirm
              title="Are you sure you want to deactivate this account?"
              onConfirm={() => handleDeactivate(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger type="primary">
                Deactivate
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Do you want to reactivate this account?"
              onConfirm={() => handleReactivate(record.id)}
              okText="Reactivate"
              cancelText="Cancel"
            >
              <Button type="default">Reactivate</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Customer Management</h2>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
          Refresh
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