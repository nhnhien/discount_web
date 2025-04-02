import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/service/order';
import { 
  List, 
  Card, 
  Typography, 
  Spin, 
  Empty, 
  Tag, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Divider,
  Badge,
  Timeline
} from 'antd';
import { 
  ShoppingOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  DollarOutlined, 
  RightOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  InboxOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  ShoppingCartOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

// Helper function to get status color and icon
const getStatusDetails = (status) => {
  const statusMap = {
    'pending': { 
      color: 'orange', 
      icon: <ClockCircleOutlined />, 
      text: 'Đang xử lý',
      description: 'Đơn hàng đang được xử lý'
    },
    'processing': { 
      color: 'blue', 
      icon: <LoadingOutlined />, 
      text: 'Đang chuẩn bị',
      description: 'Đơn hàng đang được chuẩn bị'
    },
    'shipping': { 
      color: 'cyan', 
      icon: <TruckOutlined />, 
      text: 'Đang giao hàng',
      description: 'Đơn hàng đang được vận chuyển'
    },
    'delivered': { 
      color: 'green', 
      icon: <CheckCircleOutlined />, 
      text: 'Đã giao hàng',
      description: 'Đơn hàng đã được giao thành công'
    },
    'cancelled': { 
      color: 'red', 
      icon: <ExclamationCircleOutlined />, 
      text: 'Đã hủy',
      description: 'Đơn hàng đã bị hủy'
    },
    'completed': { 
      color: 'green', 
      icon: <FileDoneOutlined />, 
      text: 'Hoàn thành',
      description: 'Đơn hàng đã hoàn thành'
    },
  };

  return statusMap[status.toLowerCase()] || { 
    color: 'default', 
    icon: <ClockCircleOutlined />, 
    text: status,
    description: 'Trạng thái đơn hàng'
  };
};

// Helper function to format payment method display
const formatPaymentMethod = (method) => {
  const methodMap = {
    'cod': 'Thanh toán khi nhận hàng (COD)',
    'bank_transfer': 'Chuyển khoản ngân hàng',
    'credit_card': 'Thẻ tín dụng/ghi nợ',
    'momo': 'Ví điện tử MoMo',
    'zalopay': 'ZaloPay'
  };

  return methodMap[method] || method;
};

// Helper function to format prices
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('vi-VN') + 'đ';
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const OrdersScreen = () => {
  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders,
  });

  const orders = ordersData?.data || [];

  // Count orders by status
  const orderCounts = orders.reduce((acc, order) => {
    const status = order.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <ShoppingCartOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
        <Spin size="large" />
        <div className="mt-4 text-gray-600 text-lg">Đang tải thông tin đơn hàng của bạn...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ExclamationCircleOutlined style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 24 }} />
        <Title level={3}>Không thể tải thông tin đơn hàng</Title>
        <Text className="text-gray-600">
          Đã xảy ra lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau.
        </Text>
        <div className="mt-6">
          <Button type="primary">Thử lại</Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Title level={3} className="mb-8 flex items-center">
          <ShoppingOutlined className="mr-3" />
          Lịch sử đơn hàng
        </Title>
        
        <Card className="rounded-xl shadow-sm text-center py-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: 120 }}
            description={
              <div className="mt-4">
                <Title level={4} className="font-normal text-gray-600">
                  Bạn chưa có đơn hàng nào
                </Title>
                <Text className="text-gray-500 block mb-6">
                  Hãy tiếp tục mua sắm để tìm những sản phẩm phù hợp với bạn
                </Text>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShoppingOutlined />}
                  className="mt-2"
                >
                  Mua sắm ngay
                </Button>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Title level={2} className="mb-6 flex items-center">
          <ShoppingOutlined className="mr-3" />
          Lịch sử đơn hàng
          <Badge count={orders.length} className="ml-3" style={{ backgroundColor: '#1890ff' }} />
        </Title>

        {/* Order summary statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl shadow-sm border-0 h-full">
              <Statistic 
                title="Tổng đơn hàng" 
                value={orders.length} 
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl shadow-sm border-0 h-full">
              <Statistic 
                title="Đang xử lý" 
                value={orderCounts['pending'] || 0} 
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl shadow-sm border-0 h-full">
              <Statistic 
                title="Đang giao hàng" 
                value={orderCounts['shipping'] || 0} 
                prefix={<TruckOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl shadow-sm border-0 h-full">
              <Statistic 
                title="Hoàn thành" 
                value={orderCounts['completed'] || 0} 
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <List
          itemLayout="vertical"
          dataSource={orders}
          renderItem={(order) => {
            const statusDetails = getStatusDetails(order.status);
            return (
              <List.Item
                key={order.id}
                className="mb-6 last:mb-0"
              >
                <Card
                  className="rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow duration-300"
                  bodyStyle={{ padding: '24px' }}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-3">
                        <ShoppingOutlined className="text-blue-500 text-lg mr-2" />
                        <Title level={4} style={{ margin: 0 }}>
                          Đơn hàng #{order.order_number}
                        </Title>
                        <Tag 
                          icon={statusDetails.icon} 
                          color={statusDetails.color}
                          className="ml-3 px-2 py-1"
                        >
                          {statusDetails.text}
                        </Tag>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center">
                          <CalendarOutlined className="text-gray-400 mr-2" />
                          <Text className="text-gray-600">Ngày đặt: {formatDate(order.created_at || new Date())}</Text>
                        </div>
                        
                        <div className="flex items-center">
                          <InboxOutlined className="text-gray-400 mr-2" />
                          <Text className="text-gray-600">Số sản phẩm: {order.items?.length || '-'}</Text>
                        </div>
                        
                        <div className="flex items-center">
                          <CreditCardOutlined className="text-gray-400 mr-2" />
                          <Text className="text-gray-600">Thanh toán: {formatPaymentMethod(order.payment_method)}</Text>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarOutlined className="text-gray-400 mr-2" />
                          <Text className="text-gray-600">Tổng cộng: <span className="font-medium text-blue-600">{formatPrice(order.total_amount)}</span></Text>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end">
                      <Button 
                        type="primary" 
                        ghost
                        icon={<RightOutlined />}
                        className="mb-2 flex items-center"
                        size="large"
                      >
                        <Link to={`/order-success/${order.id}`}>
                          Xem chi tiết
                        </Link>
                      </Button>
                      
                      {order.status === 'delivered' && (
                        <Button 
                          type="dashed" 
                          className="flex items-center"
                        >
                          Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {order.items && order.items.length > 0 && (
                    <>
                      <Divider style={{ margin: '16px 0' }} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.product_name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <ShoppingOutlined style={{ fontSize: 24 }} />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <Text className="font-medium line-clamp-1" title={item.product_name}>
                                {item.product_name}
                              </Text>
                              <div className="flex justify-between mt-1">
                                <Text type="secondary" className="text-xs">
                                  SL: {item.quantity}
                                </Text>
                                <Text className="text-xs text-blue-600">
                                  {formatPrice(item.unit_price)}
                                </Text>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center">
                            <Button type="link">
                              +{order.items.length - 3} sản phẩm khác
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Show tracking information if available */}
                  {order.status === 'shipping' && order.tracking_info && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Title level={5} className="flex items-center">
                        <TruckOutlined className="mr-2" />
                        Thông tin vận chuyển
                      </Title>
                      <Timeline>
                        {order.tracking_info.map((info, index) => (
                          <Timeline.Item 
                            key={index}
                            color={index === 0 ? 'blue' : 'gray'}
                          >
                            <Text>{info.status}</Text>
                            <div className="text-gray-500 text-xs">{formatDate(info.timestamp)}</div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </div>
                  )}
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default OrdersScreen;