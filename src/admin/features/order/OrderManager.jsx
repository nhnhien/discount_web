import React, { useState } from 'react';
import {
  Table,
  Drawer,
  Button,
  Tag,
  Typography,
  Tooltip,
  Space,
  Select,
  Input,
  Modal,
  message,
  Divider,
  List,
  Descriptions,
  Spin,
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  DeliveredProcedureOutlined,
  CreditCardOutlined,
  TruckOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/service/order';
import { formatVND } from '@/utils/format';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

const statusColors = {
  pending: 'default',
  confirmed: 'processing',
  processing: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'purple',
};

const paymentColors = {
  pending: 'default',
  paid: 'green',
  failed: 'red',
};

const deliveryStatusOptions = ['preparing', 'shipped', 'delivered', 'failed'];
const paymentStatusOptions = ['pending', 'paid', 'failed'];

const OrderManager = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-orders', { search, status: statusFilter }],
    queryFn: () =>
      orderService.getOrders({
        search,
        status: statusFilter,
        page: 1,
        limit: 100,
      }),
  });

  const orders = data?.data || [];

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }) => orderService.updatePaymentStatus(id, data),
    onSuccess: () => {
      message.success('Status updated successfully');
      queryClient.invalidateQueries(['admin-orders']);
    },
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: ({ id, data }) => orderService.updateDelivery(id, data),
    onSuccess: () => {
      message.success('Delivery status updated successfully');
      queryClient.invalidateQueries(['admin-orders']);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ id, reason }) => orderService.cancelOrder(id, reason),
    onSuccess: () => {
      message.success('Order cancelled successfully');
      queryClient.invalidateQueries(['admin-orders']);
    },
  });

  const handleUpdateStatus = (orderId, currentStatus) => {
    confirm({
      title: 'Confirm order?',
      icon: <DeliveredProcedureOutlined />,
      content: `Change order status from "${currentStatus}" to "confirmed"?`,
      onOk: () => {
        orderService
          .updateOrderStatus(orderId, {
            status: 'confirmed',
            notes: 'Confirmed by admin',
          })
          .then(() => {
            message.success('Status updated successfully');
            queryClient.invalidateQueries(['admin-orders']);
          });
      },
    });
  };

  const handleUpdatePayment = (order) => {
    confirm({
      title: 'Update payment status',
      icon: <CreditCardOutlined />,
      content: (
        <Select
          defaultValue={order.payment_status}
          style={{ width: '100%', marginTop: 10 }}
          onChange={(value) => (order._nextPaymentStatus = value)}
        >
          {paymentStatusOptions.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      ),
      onOk: () => {
        if (order._nextPaymentStatus) {
          updatePaymentMutation.mutate({
            id: order.id,
            data: { payment_status: order._nextPaymentStatus },
          });
        }
      },
    });
  };

  const handleUpdateDelivery = (order) => {
    confirm({
      title: 'Update delivery status',
      icon: <TruckOutlined />,
      content: (
        <Select
          defaultValue={order.delivery?.status}
          style={{ width: '100%', marginTop: 10 }}
          onChange={(value) => (order._nextDeliveryStatus = value)}
        >
          {deliveryStatusOptions.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      ),
      onOk: () => {
        if (order._nextDeliveryStatus) {
          updateDeliveryMutation.mutate({
            id: order.id,
            data: { status: order._nextDeliveryStatus },
          });
        }
      },
    });
  };

  const handleCancelOrder = (order) => {
    confirm({
      title: 'Cancel order',
      icon: <StopOutlined />,
      content: (
        <Input.TextArea
          rows={3}
          placeholder="Cancellation reason"
          onChange={(e) => (order._cancelReason = e.target.value)}
        />
      ),
      okType: 'danger',
      okText: 'Cancel order',
      onOk: () => {
        cancelOrderMutation.mutate({
          id: order.id,
          reason: order._cancelReason || 'Cancelled by admin',
        });
      },
    });
  };

  const showDetails = (order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      render: (_, record) => (
        <>
          <Text>{record.customer?.name}</Text>
          <div className="text-gray-400 text-xs">{record.customer?.email}</div>
        </>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      render: (val) => formatVND(val),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      render: (status) => <Tag color={paymentColors[status]}>{status}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} onClick={() => showDetails(record)} />
          </Tooltip>
          {record.status === 'pending' && (
            <Button icon={<DeliveredProcedureOutlined />} onClick={() => handleUpdateStatus(record.id, record.status)} />
          )}
          <Button icon={<CreditCardOutlined />} onClick={() => handleUpdatePayment(record)} />
          <Button icon={<TruckOutlined />} onClick={() => handleUpdateDelivery(record)} />
          {record.status !== 'cancelled' && (
            <Button danger icon={<StopOutlined />} onClick={() => handleCancelOrder(record)} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between flex-wrap gap-3 mb-4">
        <Title level={4}>Order Management</Title>
        <Space>
          <Search
            placeholder="Search orders"
            allowClear
            onSearch={setSearch}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 150 }}
          >
            {Object.keys(statusColors).map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      )}

      <Drawer
        open={detailsVisible}
        title={`Order Details ${selectedOrder?.order_number}`}
        onClose={() => setDetailsVisible(false)}
        width={600}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedOrder.status]}>{selectedOrder.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment">
                <Tag color={paymentColors[selectedOrder.payment_status]}>{selectedOrder.payment_status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {dayjs(selectedOrder.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                {formatVND(selectedOrder.total_amount)}
              </Descriptions.Item>
              {selectedOrder.discount_amount > 0 && (
                <Descriptions.Item label="Discount">
                  {formatVND(selectedOrder.discount_amount)} ({selectedOrder.discount?.discount_code})
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left">Products</Divider>
            <List
              dataSource={selectedOrder.items}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${item.product_name}${item.variant_name ? ` - ${item.variant_name}` : ''}`}
                    description={`x${item.quantity}`}
                  />
                  <div>{formatVND(item.unit_price * item.quantity)}</div>
                </List.Item>
              )}
            />

            <Divider orientation="left">Shipping</Divider>
            <div>
              <Text strong>{selectedOrder.shippingAddress?.full_name}</Text>
              <div>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</div>
              <div>📞 {selectedOrder.shippingAddress?.phone_number}</div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default OrderManager;