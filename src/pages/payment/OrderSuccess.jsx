import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Result,
  Button,
  Spin,
  Typography,
  List,
  Avatar,
  Divider,
  Card,
  Tag,
} from 'antd';
import {
  SmileOutlined,
  ShoppingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/service/order';

const { Title, Text } = Typography;

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
  });

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <Spin size="large" />
        <div className="mt-4">Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <Result
        status="error"
        title="Không tìm thấy đơn hàng"
        subTitle="Đơn hàng có thể đã bị xoá hoặc không tồn tại."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Result
        icon={<SmileOutlined />}
        status="success"
        title="Cảm ơn bạn đã đặt hàng!"
        subTitle={`Mã đơn hàng: ${order.order_number || `#${order.id}`}`}
        extra={[
          <Button key="home" type="primary" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </Button>,
          <Button key="orders" onClick={() => navigate('/orders')}>
            Xem đơn hàng của tôi
          </Button>,
        ]}
      />

      <Card className="mt-6" title="Thông tin đơn hàng" bordered>
        <div className="mb-4">
          <Text strong>Tên người nhận:</Text> {order.shippingAddress?.full_name}
        </div>
        <div className="mb-4">
          <Text strong>Số điện thoại:</Text> {order.shippingAddress?.phone_number}
        </div>
        <div className="mb-4">
          <Text strong>Địa chỉ giao hàng:</Text> {order.shippingAddress?.address}, {order.shippingAddress?.city}
        </div>
        <div className="mb-4">
          <Text strong>Phương thức thanh toán:</Text>{' '}
          <Tag color="blue">{order.payment_method}</Tag>
        </div>
        <div className="mb-4">
          <Text strong>Trạng thái đơn hàng:</Text>{' '}
          <Tag color="green">{order.status}</Tag>
        </div>
      </Card>

      <Card className="mt-6" title="Sản phẩm đã đặt">
        <List
          itemLayout="horizontal"
          dataSource={order.items || []}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size={64}
                    src={item.variant?.image || item.product?.image}
                  />
                }
                title={item.product_name}
                description={`Số lượng: ${item.quantity} | SKU: ${item.sku || 'Không có'}`}
              />
              <div>
                {parseInt(item.unit_price).toLocaleString()}₫
              </div>
            </List.Item>
          )}
        />
        <Divider />
        <div className="flex justify-between px-4">
          <Text strong>Tổng tiền:</Text>
          <Text strong className="text-blue-600 text-lg">
            {parseInt(order.total_amount).toLocaleString()}₫
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default OrderSuccess;