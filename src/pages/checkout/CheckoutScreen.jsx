import React, { useState, useEffect } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Radio,
  Divider,
  Button,
  Space,
  Modal,
  message,
  Steps,
  Spin,
  List,
  Empty,
  Image,
  Badge,
  Tag,
  Tooltip,
  Alert,
} from 'antd';
import {
  ShoppingOutlined,
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
  TruckOutlined,
  LockOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/service/cart';
import { orderService } from '@/service/order';
import { addressService } from '@/service/address';
import { paymentService } from '@/service/payment';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import vnpayLogo from '../../assets/images/vnpay-logo.png';
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

const CHECKOUT_STEPS = {
  ADDRESS: 0,
  PAYMENT: 1,
  CONFIRMATION: 2,
};

// Hàm format giá tiền
const formatPrice = (price) => {
  const number = parseFloat(price);
  return isNaN(number) ? '0đ' : number.toLocaleString('vi-VN') + 'đ';
};

// Component hiển thị tóm tắt đơn hàng
const OrderSummary = ({
  cart,
  selectedCartItems,
  isLoading,
  currentStep,
  next,
  prev,
  handlePlaceOrder,
  createOrderLoading,
}) => (
  <Card
    className='order-summary-card'
    style={{
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        background: 'linear-gradient(135deg, #1890ff, #096dd9)',
        margin: '-24px -24px 16px -24px',
        padding: '16px 24px',
        borderRadius: '12px 12px 0 0',
      }}
    >
      <Title level={4} style={{ color: 'white', margin: 0 }}>
        <ShoppingOutlined /> Order Information
      </Title>
    </div>

    {isLoading ? (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size='large' />
      </div>
    ) : (
      <>
        {selectedCartItems.length > 0 && (
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
            {selectedCartItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < selectedCartItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginRight: '12px',
                    flexShrink: 0,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <Image
                    src={item.image || '/api/placeholder/50/50'}
                    alt={item.name}
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text ellipsis style={{ fontSize: '14px', fontWeight: 500 }}>
                    {item.name}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type='secondary' style={{ fontSize: '13px' }}>
                      {item.variant_name && (
                        <Tag color='blue' style={{ marginRight: 4, padding: '0 4px' }}>
                          {item.variant_name}
                        </Tag>
                      )}
                      Quantity: {item.quantity}
                    </Text>
                    <Text style={{ fontSize: '14px', fontWeight: 500, color: '#1890ff' }}>
                      {formatPrice(item.unit_price * item.quantity)}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ fontSize: '15px' }}>
          <div className='flex justify-between mb-2'>
            <Text>Subtotal:</Text>
            <Text>{formatPrice(cart?.subtotal || 0)}</Text>
          </div>
          <div className='flex justify-between mb-2'>
            <Text>Shipping Fee:</Text>
            <Text>{formatPrice(cart?.shipping_fee || 0)}</Text>
          </div>
          {cart?.shipping_fee === 0 && cart?.shipping_address?.city && (
            <Alert message='You have received free shipping!' type='success' showIcon style={{ marginTop: 12 }} />
          )}

          {cart?.discount_amount > 0 && (
            <div className='flex justify-between mb-2'>
              <Text>Discount:</Text>
              <Text style={{ color: '#f5222d' }}>-{formatPrice(cart.discount_amount)}</Text>
            </div>
          )}
          <Divider style={{ margin: '12px 0' }} />
          <div className='flex justify-between mb-4'>
            <Text strong style={{ fontSize: '16px' }}>
              Total:
            </Text>
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {formatPrice(cart?.total_amount || 0)}
            </Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            {currentStep > 0 && (
              <Button onClick={prev} icon={<ArrowLeftOutlined />} size='large' style={{ flex: 1 }}>
                Go Back
              </Button>
            )}
            {currentStep === CHECKOUT_STEPS.CONFIRMATION ? (
              <Button
                type='primary'
                onClick={handlePlaceOrder}
                loading={createOrderLoading}
                icon={<CheckCircleOutlined />}
                size='large'
                block={currentStep === 0}
                style={{
                  background: 'linear-gradient(90deg, #1890ff, #096dd9)',
                  flex: currentStep > 0 ? 2 : 1,
                }}
              >
                Place Order
              </Button>
            ) : (
              <Button
                type='primary'
                onClick={next}
                icon={<ArrowRightOutlined />}
                size='large'
                block={currentStep === 0}
                style={{
                  background: 'linear-gradient(90deg, #1890ff, #096dd9)',
                  flex: currentStep > 0 ? 2 : 1,
                }}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </>
    )}
  </Card>
);

// Component hiển thị địa chỉ
const AddressCard = ({ address, selected, onSelect, onDelete }) => (
  <Card
    className='mb-4 hover:shadow-md transition-all duration-300'
    style={{
      borderRadius: '8px',
      border: selected ? '2px solid #1890ff' : '1px solid #f0f0f0',
      cursor: 'pointer',
      background: selected ? '#f0f8ff' : 'white',
    }}
    onClick={onSelect}
    hoverable
  >
    <Radio value={address.id} className='w-full'>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <Text strong style={{ fontSize: '16px' }}>
            {address.full_name}
          </Text>
          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: '6px', color: '#8c8c8c' }} />
            <span style={{ color: '#8c8c8c' }}>{address.phone_number}</span>
          </div>
          {selected && (
            <Tag color='success' style={{ marginLeft: '8px' }}>
              <CheckCircleOutlined /> Selected Address
            </Tag>
          )}
        </div>
        <div style={{ marginTop: '8px', color: '#595959', display: 'flex', alignItems: 'flex-start' }}>
          <EnvironmentOutlined style={{ marginRight: '8px', marginTop: '4px', color: '#1890ff' }} />
          <div>
            {address.address}, {address.city}
          </div>
        </div>
      </div>
    </Radio>
    <Tooltip title='Xoá địa chỉ'>
      <Button
        type='text'
        icon={<DeleteOutlined />}
        danger
        onClick={(e) => {
          e.stopPropagation();
          onDelete(address.id);
        }}
        style={{ position: 'absolute', top: '12px', right: '12px' }}
      />
    </Tooltip>
  </Card>
);

// Component hiển thị phương thức thanh toán
const PaymentMethodCard = ({ value, selected, title, description, icon, onClick }) => (
  <Card
    onClick={onClick}
    style={{
      borderRadius: '8px',
      border: selected ? '2px solid #1890ff' : '1px solid #f0f0f0',
      cursor: 'pointer',
      marginBottom: '16px',
      background: selected ? '#f0f8ff' : 'white',
      transition: 'all 0.3s ease',
    }}
    hoverable
  >
    <Radio value={value}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <div>
          <Text strong style={{ fontSize: '16px' }}>
            {title}
            {selected && (
              <Tag color='success' style={{ marginLeft: '8px', padding: '0 4px' }}>
                <CheckCircleOutlined /> Selected
              </Tag>
            )}
          </Text>
          <div style={{ color: '#8c8c8c', fontSize: '14px' }}>{description}</div>
        </div>
      </div>
    </Radio>
  </Card>
);

// Component hiển thị danh sách sản phẩm
const ProductList = ({ items }) => (
  <div
    style={{
      background: '#f9f9f9',
      padding: '12px',
      borderRadius: '8px',
      maxHeight: '400px',
      overflowY: 'auto',
      marginBottom: '16px',
    }}
  >
    <List
      itemLayout='horizontal'
      dataSource={items}
      renderItem={(item) => (
        <List.Item
          style={{
            padding: '16px 12px',
            borderBottom: '1px solid #f0f0f0',
            background: 'white',
            borderRadius: '6px',
            marginBottom: '8px',
          }}
        >
          <List.Item.Meta
            avatar={
              <div className='relative' style={{ marginRight: '12px' }}>
                <Badge.Ribbon
                  text={
                    item.original_price > 0 && item.unit_price < item.original_price
                      ? `-${Math.round((1 - item.unit_price / item.original_price) * 100)}%`
                      : null
                  }
                  color='#f43f5e'
                  style={{
                    display: item.original_price > 0 && item.unit_price < item.original_price ? 'block' : 'none',
                  }}
                >
                  <Image
                    src={item.image || '/api/placeholder/100/100'}
                    alt={item.name}
                    className='rounded-lg'
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', border: '1px solid #f0f0f0' }}
                    preview={false}
                  />
                </Badge.Ribbon>
              </div>
            }
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: '15px', fontWeight: 500, color: '#1890ff' }}>
                  {formatPrice(item.unit_price * item.quantity)}
                </Text>
              </div>
            }
            description={
              <div style={{ fontSize: '14px' }}>
                <div style={{ marginBottom: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.variant_name && <Tag color='blue'>{item.variant_name}</Tag>}
                  <Tag color='green'>
                    <ClockCircleOutlined /> In Stock
                  </Tag>
                  <Tag color='default'>
                    <Text>Quantity: {item.quantity}</Text>
                  </Tag>
                </div>
                <div>
                  <Space>
                    <Text type='secondary'>Unit Price: {formatPrice(item.unit_price)}</Text>
                    {item.original_price > 0 && item.unit_price < item.original_price && (
                      <Text delete type='secondary'>
                        {formatPrice(item.original_price)}
                      </Text>
                    )}
                  </Space>
                  {item.discount_amount > 0 && (
                    <div>
                      <Text type='secondary' style={{ fontStyle: 'italic', color: '#f5222d' }}>
                        Discount code applied
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            }
          />
        </List.Item>
      )}
    />
  </div>
);

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(CHECKOUT_STEPS.ADDRESS);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const selectedItemIds = location.state?.selectedItems || [];
  const applyDiscount = location.state?.applyDiscount || false;

  // Fetch cart data
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['cart', selectedItemIds, applyDiscount],
    queryFn: () => cartService.getCart(applyDiscount, selectedItemIds),
  });

  // Fetch address data
  const {
    data: addressData,
    isLoading: addressLoading,
    refetch: refetchAddresses,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  });

  const addresses = addressData?.data || [];
  const cart = cartData?.data;
  const selectedCartItems = (cart?.items || []).filter((item) => selectedItemIds.includes(item.id));
  // Thêm useEffect để đồng bộ selectedAddress từ cart khi dữ liệu cart được tải
  useEffect(() => {
    if (cart?.shipping_address_id && !selectedAddress) {
      setSelectedAddress(cart.shipping_address_id);
    }
  }, [cart, selectedAddress]);
  // Thêm vào phần đầu của component, sau khi khai báo state và các hooks
  useEffect(() => {
    // Kiểm tra xem trong cart có thông tin shipping_address_id không
    if (cart?.shipping_address?.id) {
      // Nếu có, đặt selectedAddress thành id của địa chỉ giao hàng
      setSelectedAddress(cart.shipping_address.id);
    }
  }, [cart]);
  // Auto-select the first address if there's only one and none is selected
  // Đoạn code đồng bộ hai chiều
  useEffect(() => {
    if (selectedAddress) {
      // Cập nhật thông tin shipping_address
      cartService
        .updateShippingInfo({ shipping_address_id: selectedAddress })
        .then(() => {
          // Force refetch giỏ hàng sau khi đã chọn địa chỉ
          queryClient.invalidateQueries(['cart', selectedItemIds, applyDiscount]);
        })
        .catch((error) => {
          console.error('Error updating shipping address: ', error);
        });
    }
  }, [selectedAddress, selectedItemIds, applyDiscount, queryClient]);

  // Thêm useEffect mới để đồng bộ từ cart sang selectedAddress
  useEffect(() => {
    if (cart?.shipping_address_id && !selectedAddress) {
      setSelectedAddress(cart.shipping_address_id);
    }
  }, [cart]);

  // Khi người dùng chọn địa chỉ
  const handleSelectAddress = (addressId) => {
    setSelectedAddress(addressId);

    // Cập nhật thông tin shipping_address
    cartService
      .updateShippingInfo({ shipping_address_id: addressId })
      .then(() => {
        // Force refetch giỏ hàng sau khi đã chọn địa chỉ
        queryClient.invalidateQueries(['cart', selectedItemIds, applyDiscount]);
      })
      .catch((error) => {
        console.error('Error updating shipping address: ', error);
      });
  };

  // Navigation between steps
  const next = () => {
    if (currentStep === CHECKOUT_STEPS.ADDRESS && !selectedAddress) {
      message.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    setCurrentStep((prev) => prev + 1);
    // Scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: async (res) => {
      const orderId = res.data.id;
      const totalAmount = res.data.total_amount;

      // Xoá selectedCartItems sau khi tạo đơn hàng thành công
      localStorage.removeItem('selectedCartItems');

      if (paymentMethod === 'vnpay') {
        try {
          const { data } = await paymentService.process(orderId, totalAmount);

          if (data.success && data.paymentUrl) {
            window.location.href = data.paymentUrl;
          } else {
            message.error('Unable to initiate VNPay payment');
          }
        } catch (error) {
          message.error('Connection error to payment gateway');
        }
      } else {
        message.success('Order placed successfully!');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        navigate(`/order-success/${orderId}`);
      }
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Order failed. Please try again later.');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: addressService.deleteAddress,
    onSuccess: () => {
      message.success('Address deleted successfully');
      refetchAddresses();
    },
    onError: () => {
      message.error('Unable to delete address');
    },
  });

  // Handle place order
  const handlePlaceOrder = () => {
    if (!selectedCartItems.length) {
      message.error('No products in the cart');
      return;
    }

    // Thêm kiểm tra địa chỉ
    if (!selectedAddress) {
      message.error('Please select a delivery address');
      return;
    }

    createOrderMutation.mutate({
      shipping_address_id: selectedAddress,
      payment_method: paymentMethod,
      items: selectedCartItems.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
      cart_item_ids: selectedCartItems.map((item) => item.id),
      discount_code: cart?.discount_code || null,
    });
  };

  // Handle address form
  const handleAddAddress = () => {
    form.resetFields();
    setIsAddressModalVisible(true);
  };

  const handleSaveAddress = async () => {
    try {
      const values = await form.validateFields();
      await addressService.createAddress(values);
      message.success('Address added successfully');
      setIsAddressModalVisible(false);
      refetchAddresses();
    } catch (err) {
      message.error('Unable to add address');
    }
  };

  const getSelectedAddress = () => {
    return addresses.find((addr) => addr.id === selectedAddress);
  };

  // Province data for address form

  const fetchProvinces = async () => {
    const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
    return res.data.map((province) => ({
      label: province.name,
      value: province.name, // dùng tên làm value
    }));
  };
  const { data: provinceOptions = [], isLoading: provinceLoading } = useQuery({
    queryKey: ['provinces'],
    queryFn: fetchProvinces,
  });

  // Render các biểu tượng cho phương thức thanh toán
  const renderPaymentIcon = (method) => {
    switch (method) {
      case 'cod':
        return <DollarOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />;
      case 'vnpay':
        return (
          <div
            style={{
              width: '24px',
              height: '24px',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={vnpayLogo}
              alt='VNPay'
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Kiểm tra nếu không có sản phẩm
  if (selectedCartItems.length === 0 && !cartLoading) {
    return (
      <div className='bg-bg-secondary min-h-screen py-10'>
        <div className='container mx-auto px-4 py-6 text-center'>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No products available for checkout. <br />
                <Button type='primary' onClick={() => navigate('/cart')} style={{ marginTop: '16px' }}>
                  Return to Cart
                </Button>
              </span>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-bg-secondary min-h-screen py-6'>
      <div className='container mx-auto px-4 py-6'>
        {/* Header và Steps */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
            <ShoppingOutlined /> Payment
          </Title>

          <Steps current={currentStep} responsive={true} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Step
              title='Address'
              icon={<EnvironmentOutlined />}
              description={selectedAddress ? 'Selected' : 'Select address'}
            />
            <Step
              title='Payment'
              icon={<CreditCardOutlined />}
              description={currentStep > CHECKOUT_STEPS.ADDRESS ? getPaymentMethodLabel(paymentMethod) : ''}
            />
            <Step
              title='Confirm'
              icon={<CheckCircleOutlined />}
              description={currentStep === CHECKOUT_STEPS.CONFIRMATION ? 'Confirm Order' : ''}
            />
          </Steps>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main content */}
          <Col xs={24} md={16}>
            {/* Bước 1: Chọn địa chỉ */}
            {currentStep === CHECKOUT_STEPS.ADDRESS && (
              <Card
                title={
                  <div style={{ fontSize: '18px' }}>
                    <EnvironmentOutlined /> Select Delivery Address
                  </div>
                }
                extra={
                  <Button onClick={handleAddAddress} icon={<PlusOutlined />} type='primary'>
                    Add New Address
                  </Button>
                }
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                }}
              >
                {addressLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size='large' />
                  </div>
                ) : addresses.length ? (
                  <Radio.Group
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className='w-full'
                  >
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        selected={selectedAddress === addr.id}
                        onSelect={() => handleSelectAddress(addr.id)}
                        onDelete={(id) => deleteAddressMutation.mutate(id)}
                      />
                    ))}
                  </Radio.Group>
                ) : (
                  <Empty
                    description={
                      <span>
                        No addresses found. Please add a new address.
                        <br />
                        <Button
                          type='primary'
                          icon={<PlusOutlined />}
                          onClick={handleAddAddress}
                          style={{ marginTop: '16px' }}
                        >
                          Add New Address
                        </Button>
                      </span>
                    }
                    style={{ padding: '32px 0' }}
                  />
                )}
              </Card>
            )}

            {/* Bước 2: Chọn phương thức thanh toán */}
            {currentStep === CHECKOUT_STEPS.PAYMENT && (
              <Card
                title={
                  <div style={{ fontSize: '18px' }}>
                    <CreditCardOutlined /> Payment Method
                  </div>
                }
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Radio.Group
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  value={paymentMethod}
                  style={{ width: '100%' }}
                >
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <PaymentMethodCard
                      value='cod'
                      selected={paymentMethod === 'cod'}
                      title='Cash on Delivery (COD)'
                      description='Pay with cash upon receiving the order'
                      icon={<DollarOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />}
                      onClick={() => setPaymentMethod('cod')}
                    />

                    <PaymentMethodCard
                      value='vnpay'
                      selected={paymentMethod === 'vnpay'}
                      title='VNPay'
                      description='Pay via VNPay gateway with ATM/Visa/MasterCard'
                      icon={
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={vnpayLogo}
                            alt='VNPay'
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      }
                      onClick={() => setPaymentMethod('vnpay')}
                    />
                  </Space>
                </Radio.Group>

                <Alert
                  message='Payment Information'
                  description={
                    <div>
                      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                        <li>The order will be processed after payment confirmation</li>
                        <li>Please do not close the browser during payment processing</li>
                        <li>You will receive a confirmation email once the order is processed</li>
                      </ul>
                    </div>
                  }
                  type='info'
                  showIcon
                  style={{ marginTop: '24px' }}
                />
              </Card>
            )}

            {/* Bước 3: Xác nhận đơn hàng */}
            {currentStep === CHECKOUT_STEPS.CONFIRMATION && (
              <Card
                title={
                  <div style={{ fontSize: '18px' }}>
                    <CheckCircleOutlined /> Confirm Order
                  </div>
                }
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div className='confirmation-section'>
                  {/* Thông tin giao hàng */}
                  <div style={{ marginBottom: '24px' }}>
                    <Title level={5} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Shipping Information
                    </Title>
                    {getSelectedAddress() && (
                      <Card
                        style={{
                          background: '#f9f9f9',
                          borderRadius: '8px',
                          boxShadow: 'none',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text strong style={{ fontSize: '16px' }}>
                              {getSelectedAddress().full_name}
                            </Text>
                            <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                              <PhoneOutlined style={{ marginRight: '6px', color: '#8c8c8c' }} />
                              <span style={{ color: '#8c8c8c' }}>{getSelectedAddress().phone_number}</span>
                            </div>
                          </div>
                          <div style={{ color: '#595959', display: 'flex', alignItems: 'flex-start' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px', marginTop: '4px', color: '#1890ff' }} />
                            <div>
                              {getSelectedAddress().address}, {getSelectedAddress().city}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Phương thức thanh toán */}
                  <div style={{ marginBottom: '24px' }}>
                    <Title level={5} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <CreditCardOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Payment Method
                    </Title>
                    <Card
                      style={{
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        boxShadow: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {renderPaymentIcon(paymentMethod)}
                        <Text strong>
                          {paymentMethod === 'cod'
                            ? 'Cash on Delivery (COD)'
                            : paymentMethod === 'bank_transfer'
                            ? 'Bank Transfer'
                            : 'VNPay'}
                        </Text>
                      </div>
                    </Card>
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div style={{ marginBottom: '24px' }}>
                    <Title level={5} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <ShoppingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Order Details ({selectedCartItems.length} products)
                    </Title>
                    <ProductList items={selectedCartItems} />
                  </div>

                  {/* Tổng kết đơn hàng */}
                  <div style={{ marginBottom: '24px' }}>
                    <Title level={5} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Order Summary
                    </Title>
                    <Card
                      style={{
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        boxShadow: 'none',
                      }}
                    >
                      <div className='flex justify-between mb-2'>
                        <Text>Subtotal:</Text>
                        <Text>{formatPrice(cart?.subtotal || 0)}</Text>
                      </div>
                      {cart?.shipping_address?.city ? (
                        <div className='flex justify-between mb-2'>
                          <Text>Shipping Fee:</Text>
                          <Text>{formatPrice(cart?.shipping_fee || 0)}</Text>
                        </div>
                      ) : (
                        <div className='flex justify-between mb-2'>
                          <Text>Shipping Fee:</Text>
                          <Text type='secondary'>Vui lòng chọn địa chỉ</Text>
                        </div>
                      )}
                      {cart?.shipping_address?.city && cart?.shipping_fee === 0 && (
                        <Alert
                          message='You have received free shipping!'
                          type='success'
                          showIcon
                          style={{ marginTop: 12 }}
                        />
                      )}

                      {cart?.discount_amount > 0 && (
                        <div className='flex justify-between mb-2'>
                          <Text>Discount:</Text>
                          <Text style={{ color: '#f5222d' }}>-{formatPrice(cart.discount_amount)}</Text>
                        </div>
                      )}
                      <Divider style={{ margin: '12px 0' }} />
                      <div className='flex justify-between'>
                        <Text strong style={{ fontSize: '16px' }}>
                          Total:
                        </Text>
                        <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                          {formatPrice(cart?.total_amount || 0)}
                        </Text>
                      </div>
                    </Card>
                  </div>

                  {/* Thông tin thêm */}
                  <Alert
                    message='Order Notes'
                    description={
                      <ul style={{ paddingLeft: '20px', margin: '0' }}>
                        <li>Orders will be delivered within 2-3 business days</li>
                        <li>You can check your order status in "My Orders"</li>
                        <li>Contact hotline 1900xxxx for further assistance</li>
                      </ul>
                    }
                    type='info'
                    showIcon
                  />
                </div>
              </Card>
            )}
          </Col>

          {/* Order Summary (Bên phải) */}
          <Col xs={24} md={8}>
            <div className='sticky top-6'>
              <OrderSummary
                cart={cart}
                selectedCartItems={selectedCartItems}
                isLoading={cartLoading}
                currentStep={currentStep}
                next={next}
                prev={prev}
                handlePlaceOrder={handlePlaceOrder}
                createOrderLoading={createOrderMutation.isLoading}
              />

              {/* Thông tin thêm */}
              {currentStep !== CHECKOUT_STEPS.CONFIRMATION && (
                <Card
                  style={{
                    marginTop: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <TruckOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '8px' }} />
                      <Text strong>Fast delivery</Text>
                    </div>
                    <Text type='secondary'>Delivery within 2–3 business days</Text>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <SafetyOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '8px' }} />
                      <Text strong>Quality assurance</Text>
                    </div>
                    <Text type='secondary'>Genuine products, quality-checked before delivery</Text>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <LockOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '8px' }} />
                      <Text strong>Secure payment</Text>
                    </div>
                    <Text type='secondary'>Your payment information is protected</Text>
                  </div>
                </Card>
              )}
            </div>
          </Col>
        </Row>

        {/* Modal thêm địa chỉ */}
        <Modal
          title={
            <div style={{ fontSize: '18px' }}>
              <PlusOutlined /> Add New Address
            </div>
          }
          open={isAddressModalVisible}
          onOk={handleSaveAddress}
          onCancel={() => setIsAddressModalVisible(false)}
          okText='Thêm địa chỉ'
          cancelText='Huỷ'
          bodyStyle={{ padding: '24px' }}
          confirmLoading={false}
        >
          <Form form={form} layout='vertical'>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='full_name'
                  label='Full Name'
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input
                    size='large'
                    placeholder='Nguyễn Văn A'
                    prefix={<UserOutlined style={{ color: '#d9d9d9' }} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='phone_number'
                  label='Phone Number'
                  rules={[
                    { required: true, message: 'Please enter your phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Invalid phone number' },
                  ]}
                >
                  <Input
                    size='large'
                    placeholder='0901234567'
                    prefix={<PhoneOutlined style={{ color: '#d9d9d9' }} />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name='city'
              label='Province/City'
              rules={[{ required: true, message: 'Please select a province/city' }]}
            >
              <Select
                size='large'
                placeholder='Chọn tỉnh/thành phố'
                loading={provinceLoading}
                options={provinceOptions}
                showSearch
                filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>

            <Form.Item
              name='address'
              label='Specific Address'
              rules={[{ required: true, message: 'Please enter a specific address' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder='Số nhà, tên đường, phường/xã, quận/huyện...'
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

// Helper function để lấy nhãn phương thức thanh toán
const getPaymentMethodLabel = (method) => {
  switch (method) {
    case 'cod':
      return 'Thanh toán khi nhận hàng';
    case 'vnpay':
      return 'VNPay';
    default:
      return method;
  }
};

export default CheckoutScreen;
