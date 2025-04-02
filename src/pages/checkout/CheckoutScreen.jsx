import React, { useState } from 'react';
import {
  Typography, Row, Col, Card, Form, Input, Select, Radio,
  Divider, Button, Space, Modal, message, Steps, Spin, List, Empty, Image, Badge, Tag
} from 'antd';
import {
  ShoppingOutlined, PlusOutlined, DeleteOutlined,
  DollarOutlined, CreditCardOutlined, EnvironmentOutlined,
  CheckCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  SafetyOutlined, TruckOutlined, LockOutlined, GiftOutlined,
  InfoCircleOutlined, ClockCircleOutlined, HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/service/cart';
import { orderService } from '@/service/order';
import { addressService } from '@/service/address';
import { paymentService } from '@/service/payment';

const { Title, Text, Paragraph } = Typography;
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
    onSuccess: async (res) => {
      const orderId = res.data.id;
      const totalAmount = res.data.total_amount;
      console.log('[VNPay] orderId:', orderId, 'totalAmount:', totalAmount);

      if (paymentMethod === 'vnpay') {
        try {
          const { data } = await paymentService.process(orderId, totalAmount);
          console.log('[VNPay paymentUrl]', data);

          if (data.success && data.paymentUrl) {
            window.location.href = data.paymentUrl;
          } else {
            message.error('Không thể khởi tạo thanh toán VNPay');
          }
        } catch (error) {
          message.error('Lỗi kết nối tới cổng thanh toán');
        }
      } else {
        message.success('Đặt hàng thành công');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        navigate(`/order-success/${orderId}`);
      }
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Đặt hàng thất bại');
    },
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

  // Helper function to format prices
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('vi-VN') + 'đ';
  };

  const getSelectedAddress = () => {
    return addresses.find(addr => addr.id === selectedAddress);
  };

  // Function to get payment method label
  const getPaymentMethodLabel = (method) => {
    switch(method) {
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'vnpay': return 'VNPay';
      default: return method;
    }
  };

  return (
    <div style={{ background: '#f7f9fc', minHeight: '100vh', padding: '24px 0' }}>
      <div className='container mx-auto px-4 py-6'>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
            <ShoppingOutlined /> Thanh toán
          </Title>

          <Steps 
            current={currentStep} 
            responsive={false}
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <Step 
              title="Địa chỉ" 
              icon={<EnvironmentOutlined />} 
            />
            <Step 
              title="Thanh toán" 
              icon={<CreditCardOutlined />} 
            />
            <Step 
              title="Xác nhận" 
              icon={<CheckCircleOutlined />} 
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
                              {addr.address}, {addr.city}
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
                        marginBottom: '16px',
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
                    
                    <Card 
                      onClick={() => setPaymentMethod('vnpay')}
                      style={{ 
                        borderRadius: '8px',
                        border: paymentMethod === 'vnpay' ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        cursor: 'pointer',
                        background: paymentMethod === 'vnpay' ? '#f0f8ff' : 'white'
                      }}
                      hoverable
                    >
                      <Radio value="vnpay">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img 
                              src="/logo-vnpay.png" 
                              alt="VNPay" 
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }} 
                            />
                          </div>
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>VNPay</Text>
                            <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                              Thanh toán qua cổng VNPay với thẻ ATM/Visa/Master
                            </div>
                          </div>
                        </div>
                      </Radio>
                    </Card>
                  </Space>
                </Radio.Group>

                <div style={{ marginTop: '24px', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoCircleOutlined style={{ color: '#1890ff', marginRight: '8px', marginTop: '3px' }} />
                    <div>
                      <Text strong>Lưu ý:</Text>
                      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                        <li>Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán</li>
                        <li>Vui lòng không đóng trình duyệt khi đang trong quá trình thanh toán</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                      ) : paymentMethod === 'bank_transfer' ? (
                        <>
                          <CreditCardOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#52c41a' }} />
                          <Text>Chuyển khoản ngân hàng</Text>
                        </>
                      ) : (
                        <>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img 
                              src="/logo-vnpay.png" 
                              alt="VNPay" 
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }} 
                            />
                          </div>
                          <Text>VNPay</Text>
                        </>
                      )}
                    </div>
                  </Card>
                  
                  <Title level={5}>Sản phẩm</Title>
                  <div style={{ 
                    background: '#f9f9f9', 
                    padding: '12px', 
                    borderRadius: '8px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    marginBottom: '16px'
                  }}>
                    <List
                      itemLayout="horizontal"
                      dataSource={cart?.items || []}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '12px 8px', borderBottom: '1px solid #f0f0f0' }}>
                          <List.Item.Meta
                            avatar={
                              <div className='relative'>
                                <Image
                                  src={item.image_url || "/api/placeholder/100/100"}
                                  alt={item.product_name}
                                  className='rounded-lg'
                                  width={80}
                                  height={80}
                                  style={{ objectFit: 'cover' }}
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
                            title={
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Text strong>{item.product_name}</Text>
                                <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                                  {formatPrice(item.unit_price)} x {item.quantity}
                                </Text>
                              </div>
                            }
                            description={
                              <div>
                                <div style={{ marginBottom: '4px' }}>
                                  {item.variant_name && (
                                    <Tag color="blue" style={{ marginRight: '4px' }}>
                                      {item.variant_name}
                                    </Tag>
                                  )}
                                  <Tag color="green">
                                    <ClockCircleOutlined /> Còn hàng
                                  </Tag>
                                </div>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                  Số lượng: {item.quantity}
                                </Text>
                              </div>
                            }
                          />
                          <div style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px', marginLeft: '8px' }}>
                            {formatPrice(item.unit_price * item.quantity)}
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                  
                  {paymentMethod === 'bank_transfer' && (
                    <div style={{ background: '#fffbe6', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #ffe58f' }}>
                      <Title level={5} style={{ color: '#fa8c16' }}>
                        <InfoCircleOutlined style={{ marginRight: '8px' }} />
                        Thông tin chuyển khoản
                      </Title>
                      <Paragraph style={{ margin: '0 0 8px 0' }}>
                        Vui lòng chuyển khoản với nội dung: <Text strong>DH-{(Math.random() * 1000000).toFixed(0)}</Text>
                      </Paragraph>
                      <ul style={{ paddingLeft: '20px', margin: '0' }}>
                        <li>Ngân hàng: <Text strong>Vietcombank</Text></li>
                        <li>Số tài khoản: <Text strong>1234567890</Text></li>
                        <li>Chủ tài khoản: <Text strong>CÔNG TY TNHH ABC</Text></li>
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </Col>

          <Col xs={24} md={8}>
            <div className="sticky top-6">
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
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                      {cart.items && cart.items.length > 0 && (
                        <div style={{ padding: '0 0 16px' }}>
                          {cart.items.map((item, index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '8px 0',
                              borderBottom: index < cart.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginRight: '12px',
                                flexShrink: 0
                              }}>
                                <Image
                                  src={item.image_url || "/api/placeholder/40/40"}
                                  alt={item.product_name}
                                  width={40}
                                  height={40}
                                  style={{ objectFit: 'cover' }}
                                  preview={false}
                                />
                              </div>
                              <div style={{ 
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  {item.product_name} x {item.quantity}
                                </Text>
                              </div>
                              <div style={{ 
                                marginLeft: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#1890ff'
                              }}>
                                {formatPrice(item.unit_price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Divider style={{ margin: '16px 0' }} />
                    
                    <div style={{ fontSize: '16px' }}>
                      <div className='flex justify-between mb-2'>
                        <Text>Tạm tính</Text>
                        <Text>{formatPrice(cart.subtotal)}</Text>
                      </div>
                      <div className='flex justify-between mb-2'>
                        <Text>Phí vận chuyển</Text>
                        <Text>{formatPrice(cart.shipping_fee)}</Text>
                      </div>
                      {cart.discount_amount > 0 && (
                        <div className='flex justify-between mb-2'>
                          <Text>Giảm giá</Text>
                          <Text style={{ color: '#f5222d' }}>-{formatPrice(cart.discount_amount)}</Text>
                        </div>
                      )}
                      <Divider style={{ margin: '12px 0' }} />
                      <div className='flex justify-between mb-4'>
                        <Text strong style={{ fontSize: '18px' }}>Tổng cộng</Text>
                        <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                          {formatPrice(cart.total_amount)}
                        </Text>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        {currentStep > 0 && (
                          <Button 
                            onClick={prev} 
                            icon={<ArrowLeftOutlined />}
                            size="large"
                            style={{ flex: 1 }}
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
                              flex: currentStep > 0 ? 2 : 1
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
                              flex: currentStep > 0 ? 2 : 1
                            }}
                          >
                            Tiếp tục
                          </Button>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                      <div className='mt-6 space-y-3'>
                        <div className='flex items-center text-gray-600'>
                          <SafetyOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                          <Typography.Text className='text-sm'>Thanh toán an toàn & bảo mật</Typography.Text>
                        </div>

                        <div className='flex items-center text-gray-600'>
                          <TruckOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                          <Typography.Text className='text-sm'>Giao hàng nhanh toàn quốc</Typography.Text>
                        </div>

                        <div className='flex items-center text-gray-600'>
                          <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                          <Typography.Text className='text-sm'>Đổi trả miễn phí trong 7 ngày</Typography.Text>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </Col>
        </Row>

        {/* Modal thêm địa chỉ */}
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