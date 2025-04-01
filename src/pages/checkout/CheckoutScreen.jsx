import React, { useState } from 'react';
import {
  Typography, Row, Col, Card, Form, Input, Select, Radio,
  Divider, Button, Space, Modal, message, Steps, Spin, List, Empty, Avatar, Image, Badge
} from 'antd';
import {
  ShoppingOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  DollarOutlined, CreditCardOutlined, EnvironmentOutlined,
  CheckCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/service/cart';
import { orderService } from '@/service/order';
import { addressService } from '@/service/address';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const CHECKOUT_STEPS = {
  ADDRESS: 0,
  PAYMENT: 1,
  CONFIRMATION: 2,
};

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(CHECKOUT_STEPS.ADDRESS);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  });

  const { data: addressData, isLoading: addressLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  });

  const addresses = addressData?.data || [];
  const cart = cartData?.data;

  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (res) => {
      message.success('Đặt hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate(`/order-success/${res.data.id}`);
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Đặt hàng thất bại');
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: addressService.deleteAddress,
    onSuccess: () => {
      message.success('Xoá địa chỉ thành công');
      refetchAddresses();
    },
    onError: () => {
      message.error('Không thể xoá địa chỉ');
    },
  });

  const next = () => {
    if (currentStep === CHECKOUT_STEPS.ADDRESS && !selectedAddress) {
      message.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handlePlaceOrder = () => {
    if (!cart?.items?.length) return;
    createOrderMutation.mutate({
      shipping_address_id: selectedAddress,
      payment_method: paymentMethod,
      items: cart.items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      }))
    });
  };

  const handleAddAddress = () => {
    form.resetFields();
    setIsAddressModalVisible(true);
  };

  const handleSaveAddress = async () => {
    try {
      const values = await form.validateFields();
      await addressService.createAddress(values);
      message.success('Thêm địa chỉ thành công');
      setIsAddressModalVisible(false);
      refetchAddresses();
    } catch (err) {
      message.error('Không thể thêm địa chỉ');
    }
  };

  const provinces = [
    { value: 'HN', label: 'Hà Nội' },
    { value: 'HCM', label: 'Hồ Chí Minh' },
  ];

  const getStepColor = (stepIndex) => {
    if (stepIndex < currentStep) return '#1890ff'; 
    if (stepIndex === currentStep) return '#1890ff'; 
    return '#f0f0f0'; 
  };
  
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('vi-VN') + 'đ';
  };

  const getSelectedAddress = () => {
    return addresses.find(addr => addr.id === selectedAddress);
  };

  const renderOrderSummaryCard = () => (
    <Card 
      className="order-summary-card"
      style={{ 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        background: 'linear-gradient(135deg, #1890ff, #096dd9)',
        margin: '-24px -24px 16px -24px',
        padding: '16px 24px',
        borderRadius: '12px 12px 0 0'
      }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          <ShoppingOutlined /> Thông tin đơn hàng
        </Title>
      </div>
      
      {cartLoading || !cart ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={cart?.items || []}
            renderItem={(item) => (
              <List.Item style={{ padding: '12px 0' }}>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      shape="square" 
                      size={64} 
                                                    src={item.image || "/api/placeholder/64/64"} 
                    />
                  }
                  title={
                    <Text strong style={{ fontSize: '16px' }}>{item.product_name}</Text>
                  }
                  description={
                    <>
                      <Text type="secondary">Số lượng: {item.quantity}</Text>
                      <br />
                      <Text type="secondary">
                        {item.variant_name ? `Phân loại: ${item.variant_name}` : ''}
                      </Text>
                    </>
                  }
                />
                <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                                {formatPrice(item.unit_price)}
                </div>
              </List.Item>
            )}
            style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              margin: '0 -8px 16px -8px',
              padding: '0 8px'
            }}
          />
          
          <Divider style={{ margin: '16px 0' }} />
          
          <div style={{ fontSize: '16px' }}>
            <div className='flex justify-between mb-2'>
              <Text>Tạm tính</Text>
              <Text>                      {formatPrice(cart.subtotal)}</Text>
            </div>
            <div className='flex justify-between mb-2'>
              <Text>Phí vận chuyển</Text>
              <Text>                      {formatPrice(cart.shipping_fee)}</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div className='flex justify-between mb-4'>
              <Text strong style={{ fontSize: '18px' }}>Tổng cộng</Text>
              <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                                      {formatPrice(cart.total_amount)}
              </Text>
            </div>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              {currentStep > 0 && (
                <Button 
                  onClick={prev} 
                  icon={<ArrowLeftOutlined />}
                  size="large"
                >
                  Quay lại
                </Button>
              )}
              {currentStep === CHECKOUT_STEPS.CONFIRMATION ? (
                <Button 
                  type='primary' 
                  onClick={handlePlaceOrder} 
                  loading={createOrderMutation.isLoading}
                  icon={<CheckCircleOutlined />}
                  size="large"
                  style={{ 
                    background: 'linear-gradient(90deg, #1890ff, #096dd9)',
                    width: currentStep > 0 ? 'auto' : '100%' 
                  }}
                >
                  Đặt hàng
                </Button>
              ) : (
                <Button 
                  type='primary' 
                  onClick={next}
                  icon={<ArrowRightOutlined />}
                  size="large"
                  style={{ 
                    background: 'linear-gradient(90deg, #1890ff, #096dd9)',
                    width: currentStep > 0 ? 'auto' : '100%' 
                  }}
                >
                  Tiếp tục
                </Button>
              )}
            </Space>
          </div>
        </>
      )}
    </Card>
  );

  return (
    <div style={{ 
      background: '#f7f9fc', 
      minHeight: '100vh', 
      padding: '24px 0' 
    }}>
      <div className='container mx-auto px-4 py-6'>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px' 
        }}>
          <Title level={2} style={{ 
            marginBottom: '24px',
            color: '#1890ff'
          }}>
            <ShoppingOutlined /> Thanh toán
          </Title>

          <Steps 
            current={currentStep} 
            className='mb-8'
            responsive={false}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <Step 
              title="Địa chỉ" 
              icon={<EnvironmentOutlined />} 
              style={{ color: getStepColor(0) }}
            />
            <Step 
              title="Thanh toán" 
              icon={<CreditCardOutlined />} 
              style={{ color: getStepColor(1) }}
            />
            <Step 
              title="Xác nhận" 
              icon={<CheckCircleOutlined />} 
              style={{ color: getStepColor(2) }}
            />
          </Steps>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            {currentStep === CHECKOUT_STEPS.ADDRESS && (
              <Card
                title={
                  <div style={{ fontSize: '18px' }}>
                    <EnvironmentOutlined /> Chọn địa chỉ giao hàng
                  </div>
                }
                extra={
                  <Button 
                    onClick={handleAddAddress} 
                    icon={<PlusOutlined />}
                    type="primary"
                    ghost
                  >
                    Thêm địa chỉ
                  </Button>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.05)'
                }}
              >
                {addressLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                  </div>
                ) : addresses.length ? (
                  <Radio.Group
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-full"
                  >
                    {addresses.map((addr, index) => (
                      <Card
                        key={addr.id}
                        className='mb-4'
                        style={{ 
                          borderRadius: '8px',
                          border: selectedAddress === addr.id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          background: selectedAddress === addr.id ? '#f0f8ff' : 'white'
                        }}
                        onClick={() => setSelectedAddress(addr.id)}
                        hoverable
                      >
                        <Radio value={addr.id} className='w-full'>
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>{addr.full_name}</Text> 
                            <span style={{ marginLeft: '8px', color: '#8c8c8c' }}>
                              <DollarOutlined /> {addr.phone_number}
                            </span>
                            <div style={{ marginTop: '8px', color: '#595959' }}>
                              <EnvironmentOutlined style={{ marginRight: '8px' }} />
                              {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                            </div>
                          </div>
                        </Radio>
                        <Button
                          type='text'
                          icon={<DeleteOutlined />}
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddressMutation.mutate(addr.id);
                          }}
                          style={{ position: 'absolute', top: '12px', right: '12px' }}
                        />
                      </Card>
                    ))}
                  </Radio.Group>
                ) : (
                  <Empty 
                    description="Chưa có địa chỉ nào. Vui lòng thêm." 
                    style={{ padding: '32px 0' }}
                  />
                )}
              </Card>
            )}

            {currentStep === CHECKOUT_STEPS.PAYMENT && (
              <Card 
                title={
                  <div style={{ fontSize: '18px' }}>
                    <CreditCardOutlined /> Phương thức thanh toán
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.05)'
                }}
              >
                <Radio.Group 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  value={paymentMethod}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Card 
                      onClick={() => setPaymentMethod('cod')}
                      style={{ 
                        borderRadius: '8px',
                        border: paymentMethod === 'cod' ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        background: paymentMethod === 'cod' ? '#f0f8ff' : 'white'
                      }}
                      hoverable
                    >
                      <Radio value="cod">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <DollarOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>Thanh toán khi nhận hàng (COD)</Text>
                            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                              Thanh toán bằng tiền mặt khi nhận được hàng
                            </div>
                          </div>
                        </div>
                      </Radio>
                    </Card>
                    
                    <Card 
                      onClick={() => setPaymentMethod('bank_transfer')}
                      style={{ 
                        borderRadius: '8px',
                        border: paymentMethod === 'bank_transfer' ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        cursor: 'pointer',
                        background: paymentMethod === 'bank_transfer' ? '#f0f8ff' : 'white'
                      }}
                      hoverable
                    >
                      <Radio value="bank_transfer">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCardOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#52c41a' }} />
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>Chuyển khoản ngân hàng</Text>
                            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                              Chuyển khoản qua tài khoản ngân hàng
                            </div>
                          </div>
                        </div>
                      </Radio>
                    </Card>
                  </Space>
                </Radio.Group>
              </Card>
            )}

            {currentStep === CHECKOUT_STEPS.CONFIRMATION && (
              <Card 
                title={
                  <div style={{ fontSize: '18px' }}>
                    <CheckCircleOutlined /> Xác nhận đơn hàng
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div className="confirmation-section">
                  <Title level={5}>Thông tin giao hàng</Title>
                  {getSelectedAddress() && (
                    <Card style={{ marginBottom: '24px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <div>
                        <Text strong style={{ fontSize: '16px' }}>{getSelectedAddress().full_name}</Text> 
                        <span style={{ marginLeft: '8px', color: '#8c8c8c' }}>
                          <DollarOutlined /> {getSelectedAddress().phone_number}
                        </span>
                        <div style={{ marginTop: '8px', color: '#595959' }}>
                          <EnvironmentOutlined style={{ marginRight: '8px' }} />
                          {getSelectedAddress().address}, {getSelectedAddress().city}
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  <Title level={5}>Phương thức thanh toán</Title>
                  <Card style={{ marginBottom: '24px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {paymentMethod === 'cod' ? (
                        <>
                          <DollarOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />
                          <Text>Thanh toán khi nhận hàng (COD)</Text>
                        </>
                      ) : (
                        <>
                          <CreditCardOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#52c41a' }} />
                          <Text>Chuyển khoản ngân hàng</Text>
                        </>
                      )}
                    </div>
                  </Card>
                  
                  <Title level={5}>Sản phẩm</Title>
                  <List
                    itemLayout="horizontal"
                    dataSource={cart?.items || []}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <div className='relative'>
<Image 
  src={item.image || '/no-image.png'}
  alt={item.product_name}
  width={64}
  height={64}
  style={{ objectFit: 'cover', borderRadius: 8 }}
  preview={false}
/>
                        {item.discount_amount > 0 && (
                          <Badge.Ribbon
                            text={`-${Math.round((item.discount_amount / (item.unit_price * item.quantity)) * 100)}%`}
                            color='#f43f5e'
                            className='absolute top-0 right-0'
                          />
                        )}
                      </div>
                          }
                          title={<Text strong>{item.product_name}</Text>}
                          description={`Số lượng: ${item.quantity}`}
                        />
                        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          {item.unit_price?.toLocaleString()}₫
                        </div>
                      </List.Item>
                    )}
                    style={{ 
                      background: '#f9f9f9', 
                      padding: '12px', 
                      borderRadius: '8px' 
                    }}
                  />
                </div>
              </Card>
            )}
          </Col>

          <Col xs={24} md={8}>
            {renderOrderSummaryCard()}
          </Col>
        </Row>

        <Modal
          title={
            <div style={{ fontSize: '18px' }}>
              <PlusOutlined /> Thêm địa chỉ mới
            </div>
          }
          open={isAddressModalVisible}
          onOk={handleSaveAddress}
          onCancel={() => setIsAddressModalVisible(false)}
          okText="Thêm địa chỉ"
          cancelText="Huỷ"
          bodyStyle={{ padding: '24px' }}
        >
          <Form form={form} layout='vertical'>
            <Form.Item name='full_name' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input size="large" placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name='phone_number' label='Số điện thoại' rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
              <Input size="large" placeholder="0901234567" />
            </Form.Item>
            <Form.Item name='city' label='Tỉnh/Thành phố' rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}>
              <Select size="large" placeholder="Chọn tỉnh/thành phố">
                {provinces.map(p => (
                  <Option key={p.value} value={p.label}>{p.label}</Option>
                ))}
              </Select>
            </Form.Item>
  
            <Form.Item name='address' label='Địa chỉ cụ thể' rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}>
              <Input.TextArea rows={3} placeholder="Số nhà, tên đường..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default CheckoutScreen;