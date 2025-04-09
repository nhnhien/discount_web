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
  Steps,
  Timeline,
  Statistic,
  Row,
  Col,
  Space,
  Skeleton,
  Badge,
  Image,
  Empty
} from 'antd';
import {
  SmileOutlined,
  ShoppingOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ShopOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  PrinterOutlined,
  RollbackOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/service/order';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
  });

  const order = data?.data;

  // Xác định trạng thái của đơn hàng để hiển thị Steps
  const getOrderStatus = () => {
    if (!order) return 0;
    
    const statusMap = {
      'pending': 0,
      'processing': 1, 
      'shipping': 2,
      'completed': 3,
      'cancelled': -1
    };
    
    return statusMap[order.status.toLowerCase()] || 0;
  };

  // Helper để lấy màu cho trạng thái
  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'orange',
      'processing': 'blue',
      'shipping': 'cyan',
      'completed': 'green',
      'cancelled': 'red'
    };
    
    return colorMap[status?.toLowerCase()] || 'default';
  };

  // Helper để lấy icon cho trạng thái
  const getStatusIcon = (status) => {
    const iconMap = {
      'pending': <ClockCircleOutlined />,
      'processing': <ShopOutlined />,
      'shipping': <CarOutlined />,
      'completed': <CheckCircleOutlined />,
      'cancelled': <RollbackOutlined />
    };
    
    return iconMap[status?.toLowerCase()] || <ClockCircleOutlined />;
  };

  // Tính tổng số sản phẩm
  const getTotalItems = () => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="shadow-sm rounded-lg overflow-hidden">
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">
              <Paragraph>Đang tải thông tin đơn hàng...</Paragraph>
              <Skeleton active paragraph={{ rows: 4 }} className="mt-8" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="shadow-sm rounded-lg overflow-hidden">
          <Result
            status="error"
            title="Không tìm thấy đơn hàng"
            subTitle="Đơn hàng có thể đã bị xoá hoặc không tồn tại."
            extra={
              <Space>
                <Button type="primary" size="large" onClick={() => navigate('/')} icon={<HomeOutlined />}>
                  Về trang chủ
                </Button>
                <Button onClick={() => navigate('/orders')} icon={<ShoppingOutlined />}>
                  Đơn hàng của tôi
                </Button>
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Thông báo thành công */}
      <Card className="mb-6 shadow-sm rounded-lg overflow-hidden border-t-4 border-green-500">
        <Result
          icon={<SmileOutlined className="text-green-500" />}
          status="success"
          title={
            <div className="text-green-600 text-2xl">
              Đặt hàng thành công!
            </div>
          }
          subTitle={
            <div className="text-gray-600">
              <p className="mb-2">Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi</p>
              <Badge status="processing" color="green" text={
                <span className="font-medium">
                  Mã đơn hàng: <span className="text-blue-600">{order.order_number || `#${order.id}`}</span>
                </span>
              } />
            </div>
          }
          extra={
            <Space size="middle" wrap>
              <Button
                key="home"
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/')}
                className="min-w-[160px]"
              >
                Tiếp tục mua sắm
              </Button>
              <Button
                key="orders"
                size="large" 
                icon={<ShopOutlined />}
                onClick={() => navigate('/orders')}
                className="min-w-[160px]"
              >
                Xem đơn hàng của tôi
              </Button>
              <Button
                key="print"
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
              >
                In đơn hàng
              </Button>
            </Space>
          }
        />
      </Card>

      {/* Tiến trình đơn hàng */}
      <Card 
        className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg"
        title={
          <div className="flex items-center text-gray-800">
            <ClockCircleOutlined className="mr-2" /> Trạng thái đơn hàng
          </div>
        }
      >
        <Steps
          current={getOrderStatus()}
          status={order.status.toLowerCase() === 'cancelled' ? 'error' : 'process'}
          responsive
          className="px-4 py-4"
        >
          <Step title="Đặt hàng" description={formatDate(order.created_at)} icon={<ShoppingOutlined />} />
          <Step title="Xử lý" description="Đang chuẩn bị" icon={<ShopOutlined />} />
          <Step title="Vận chuyển" description="Đang giao hàng" icon={<CarOutlined />} />
          <Step title="Hoàn thành" description="Giao hàng thành công" icon={<CheckCircleOutlined />} />
        </Steps>

        <Divider className="my-4" />
        
        <div className="px-4 py-2">
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} sm={12}>
              <div className="flex items-center">
                <CalendarOutlined className="text-gray-500 mr-2" />
                <span>
                  <Text type="secondary">Ngày đặt hàng:</Text>{' '}
                  <Text strong>{formatDate(order.created_at)}</Text>
                </span>
              </div>
            </Col>
            <Col xs={24} sm={12} className="text-left sm:text-right">
              <Tag 
                icon={getStatusIcon(order.status)} 
                color={getStatusColor(order.status)}
                className="px-3 py-1 text-sm"
              >
                {order.status.toUpperCase()}
              </Tag>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Thông tin đơn hàng và giao hàng */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <div className="flex items-center text-gray-800">
                <UserOutlined className="mr-2" /> Thông tin giao hàng
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300 h-full rounded-lg"
          >
            <div className="space-y-4">
              <div className="flex items-start">
                <UserOutlined className="text-blue-500 mr-3 mt-1" />
                <div>
                  <div className="text-gray-500 text-sm mb-1">Người nhận</div>
                  <div className="font-medium">{order.shippingAddress?.full_name || 'Không có thông tin'}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <PhoneOutlined className="text-green-500 mr-3 mt-1" />
                <div>
                  <div className="text-gray-500 text-sm mb-1">Số điện thoại</div>
                  <div className="font-medium">{order.shippingAddress?.phone_number || 'Không có thông tin'}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <EnvironmentOutlined className="text-red-500 mr-3 mt-1" />
                <div>
                  <div className="text-gray-500 text-sm mb-1">Địa chỉ</div>
                  <div className="font-medium">
                    {order.shippingAddress?.address}{order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarOutlined className="text-orange-500 mr-3 mt-1" />
                <div>
                  <div className="text-gray-500 text-sm mb-1">Phương thức thanh toán</div>
                  <Tag color="blue">{order.payment_method}</Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title={
              <div className="flex items-center text-gray-800">
                <ShoppingOutlined className="mr-2" /> Tóm tắt đơn hàng
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300 h-full rounded-lg"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title={<span className="text-gray-600">Tổng sản phẩm</span>} 
                  value={getTotalItems()} 
                  prefix={<GiftOutlined />} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title={<span className="text-gray-600">Tổng tiền</span>} 
                  value={parseInt(order.total_amount).toLocaleString() + '₫'} 
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Col>
            </Row>
            
            <Divider className="my-4" />
            
            <Timeline
              items={[
                {
                  children: (
                    <div className="flex justify-between items-center w-full">
                      <span>Tạm tính</span>
                      <span>{parseInt(order.sub_total || order.total_amount).toLocaleString()}₫</span>
                    </div>
                  )
                },
                {
                  children: (
                    <div className="flex justify-between items-center w-full">
                      <span>Phí vận chuyển</span>
                      <span>{parseInt(order.shipping_fee || 0).toLocaleString()}₫</span>
                    </div>
                  )
                },
                {
                  children: (
                    <div className="flex justify-between items-center w-full">
                      <span>Giảm giá</span>
                      <span>-{parseInt(order.discount || 0).toLocaleString()}₫</span>
                    </div>
                  )
                },
                {
                  color: 'blue',
                  children: (
                    <div className="flex justify-between items-center w-full font-medium">
                      <span>Tổng thanh toán</span>
                      <span className="text-blue-600 text-lg">{parseInt(order.total_amount).toLocaleString()}₫</span>
                    </div>
                  )
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Chi tiết sản phẩm */}
      <Card 
        className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg"
        title={
          <div className="flex items-center text-gray-800">
            <ShoppingOutlined className="mr-2" /> Chi tiết sản phẩm đã đặt
          </div>
        }
      >
        {order.items && order.items.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={order.items}
            renderItem={(item) => (
              <List.Item className="hover:bg-gray-50 rounded-md px-2 py-4 transition-colors duration-200">
                <List.Item.Meta
                  avatar={
                    <div className="relative">
                      <Badge count={item.quantity} showZero offset={[-5, 5]}>
                        <Avatar
                          shape="square"
                          size={80}
                          src={item.variant?.image || item.product?.image}
                          className="shadow-sm rounded-md overflow-hidden"
                          icon={<ShoppingOutlined />}
                        />
                      </Badge>
                    </div>
                  }
                  title={
                    <div className="font-medium">
                      {item.product_name}
                      {item.variant_name && <Tag className="ml-2">{item.variant_name}</Tag>}
                    </div>
                  }
                  description={
                    <div className="text-gray-500 space-y-1 mt-1">
                      <div>Số lượng: {item.quantity}</div>
                      {item.sku && <div>SKU: {item.sku}</div>}
                    </div>
                  }
                />
                <div className="text-right">
                  <div className="text-lg font-medium text-blue-600">
                    {parseInt(item.unit_price).toLocaleString()}₫
                  </div>
                  <div className="text-gray-500 text-sm">
                    {(item.quantity > 1) && `${parseInt(item.unit_price).toLocaleString()}₫ × ${item.quantity}`}
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Không có sản phẩm nào" />
        )}
        
        <Divider />
        
        <div className="flex justify-end p-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm max-w-xs w-full">
            <div className="flex justify-between mb-2">
              <Text>Tạm tính:</Text>
              <Text>{parseInt(order.sub_total || order.total_amount).toLocaleString()}₫</Text>
            </div>
            {order.shipping_fee ? (
              <div className="flex justify-between mb-2">
                <Text>Phí vận chuyển:</Text>
                <Text>{parseInt(order.shipping_fee).toLocaleString()}₫</Text>
              </div>
            ) : null}
            {order.discount ? (
              <div className="flex justify-between mb-2">
                <Text>Giảm giá:</Text>
                <Text>-{parseInt(order.discount).toLocaleString()}₫</Text>
              </div>
            ) : null}
            <Divider className="my-2" />
            <div className="flex justify-between">
              <Text strong>Tổng tiền:</Text>
              <Text strong className="text-blue-600 text-xl">
                {parseInt(order.total_amount).toLocaleString()}₫
              </Text>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Ghi chú và thông tin khác */}
      {order.note && (
        <Card
          className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg"
          title={
            <div className="flex items-center text-gray-800">
              <InfoCircleOutlined className="mr-2" /> Ghi chú đơn hàng
            </div>
          }
        >
          <Paragraph className="italic text-gray-600">"{order.note}"</Paragraph>
        </Card>
      )}
      
      {/* Nút quay lại */}
      <div className="mt-8 text-center">
        <Space>
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
          <Button icon={<ShoppingOutlined />} onClick={() => navigate('/orders')}>
            Xem đơn hàng của tôi
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default OrderSuccess;