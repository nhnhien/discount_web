import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Checkbox,
  Divider,
  Row,
  Col,
  Card,
  Input,
  message,
  Spin,
  Empty,
  Badge,
  Tooltip,
  Image,
  Tag,
  Progress,
} from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  MessageOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  LockOutlined,
  GiftOutlined,
  TruckOutlined,
  HeartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as discountService from '@/service/discount';
import { useRef } from 'react';
import { cartService } from '@/service/cart';
import { useTranslation } from 'react-i18next';
import { addToWishlist, removeFromWishlist } from '@/context/slice/wishlist';
import ProductsScreen from '/src/pages/product/components/ProductScreen.jsx';

const CartScreen = () => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userId = currentUser?.id;
  const queryClient = useQueryClient();
  const hasAppliedDiscount = useRef(false);
  const cartQueryKey = ['cart', userId];
  const [discountApplied, setDiscountApplied] = useState(false);
  const [availableCodes, setAvailableCodes] = useState([]);
  const { t } = useTranslation();
  const [wantApplyDiscount, setWantApplyDiscount] = useState(false); // Thêm state điều khiển
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist) || [];

  const [progressPercent, setProgressPercent] = useState(0);

  const {
    data: cartResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cart', userId, { apply_discount: wantApplyDiscount, selected_item_ids: selectedItems.join(',') }],
    queryFn: () => cartService.getCart(wantApplyDiscount, selectedItems),
    enabled: !!userId,
  });

  const cart = cartResponse?.data || {};
  const items = cart.items || [];
  // Tính toán lại theo selectedItems
  const selectedCartItems = items.filter((item) => selectedItems.includes(item.id));
  const selectedSubtotal = selectedCartItems.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);

  // Sử dụng discount_amount từ API nếu có mã giảm giá
  const discountAmount = cart.discount_code ? parseFloat(cart.discount_amount || 0) : 0;

  // Tính tổng cộng sau khi trừ giảm giá
  const finalTotal = Math.max(selectedSubtotal - discountAmount, 0);

  const handleQuantityChange = async (itemId, change) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    try {
      await cartService.updateCartItem(itemId, newQuantity);
      queryClient.invalidateQueries(['cart']);
    } catch (err) {
      message.error('Error updating quantity');
    }
  };
  const handleToggleWishlist = (productId, variantId = null) => {
    const isWishlisted = wishlist.some((item) => item.productId === productId && item.variantId === variantId);

    const payload = { productId, variantId };

    if (isWishlisted) {
      dispatch(removeFromWishlist(payload));
      message.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(payload));
      message.success('Added to wishlist');
    }
  };
  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeCartItem(itemId);
      message.success('Item removed from cart');
      queryClient.invalidateQueries(['cart']);
    } catch (err) {
      message.error('Error removing item');
    }
  };

  const handleApplyCoupon = async (code = couponCode) => {
    if (!code) {
      message.warning('Please enter a discount code');
      return;
    }

    if (selectedItems.length === 0) {
      message.warning('Please select at least one product to apply discount');
      return;
    }

    try {
      const result = await cartService.applyDiscount({
        discount_code: code,
        selected_item_ids: selectedItems,
      });

      if (result?.success) {
        message.success(result.message || 'Discount code applied successfully');
        setDiscountApplied(true);
        setWantApplyDiscount(true);
        queryClient.invalidateQueries(['cart', userId, { apply_discount: true, selected_item_ids: selectedItems }]);
      } else {
        message.error(result?.message || 'Failed to apply discount code');
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Error applying discount');
    }
  };

  useEffect(() => {
    if (cart?.discount_code && !discountApplied) {
      setCouponCode(cart.discount_code); // ✅ Gán lại input nếu cart có sẵn mã
    }
  }, [cart]);

  useEffect(() => {
    if (userId) {
      discountService
        .getAvailableDiscounts(userId)
        .then((res) => {
          if (res?.success) {
            // ⚠️ Chỉ hiển thị các mã còn lượt sử dụng hoặc không giới hạn
            const validCodes = res.data.filter((d) => d.remaining_uses === null || d.remaining_uses > 0);
            setAvailableCodes(validCodes);
          }
        })
        .catch((err) => {
          console.error('Lỗi khi lấy danh sách mã:', err.message);
        });
    }
  }, [userId]);

  useEffect(() => {
    if (cart?.discount_code && availableCodes.length > 0 && !discountApplied) {
      const isValid = availableCodes.some((d) => d.discount_code === cart.discount_code);
      if (!isValid) {
        handleRemoveCoupon(); // Gỡ mã
        message.warning(`Code ${cart.discount_code} is no longer valid and has been removed`);
      }
    }
  }, [cart?.discount_code, availableCodes]);

  const handleUpdateNote = async () => {
    if (!orderNote || orderNote.trim() === '') return;

    try {
      await cartService.updateShippingInfo({ note: orderNote.trim() });
      message.success('Order note saved');
      queryClient.invalidateQueries(['cart']);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save order note');
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await cartService.removeDiscount(selectedItems);
      message.success('Discount code removed');
      setCouponCode('');
      setDiscountApplied(false);
      setWantApplyDiscount(false); // Không áp lại mã giảm giá

      // 🔥 Invalidate đúng key
      queryClient.invalidateQueries([
        'cart',
        userId,
        { apply_discount: false, selected_item_ids: selectedItems.join(',') },
      ]);
    } catch (err) {
      message.error('Failed to remove discount code');
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems((cartResponse?.data?.items || []).map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  useEffect(() => {
    if (cartResponse?.data) {
      const subtotal = parseFloat(cartResponse.data.subtotal) || 0;
      const freeShippingThreshold = 500000; // Ngưỡng miễn phí vận chuyển (500,000đ)
      const percent = Math.min(Math.round((subtotal / freeShippingThreshold) * 100), 100);

      let startPercent = 0;
      const interval = setInterval(() => {
        startPercent += 2;
        setProgressPercent(Math.min(startPercent, percent));
        if (startPercent >= percent) {
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [cartResponse]);

  if (isLoading) {
    return (
      <div className='bg-white min-h-screen flex flex-col items-center justify-center'>
        <div className='text-center p-8 max-w-md'>
          <ShoppingCartOutlined className='text-blue-500 text-6xl mb-4' />
          <Spin size='large' className='my-4' />
          <Typography.Title level={4} className='mt-4 font-normal text-gray-600'>
            {t('cart.loading_title')}
          </Typography.Title>
          <Typography.Text className='text-gray-500'>{t('cart.loading_description')}</Typography.Text>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='bg-white min-h-screen flex flex-col items-center justify-center'>
        <div className='text-center p-8 max-w-md'>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Typography.Title level={4} className='mt-4 font-normal text-gray-600'>
                  {t('cart.load_failed')}
                </Typography.Title>
                <Typography.Text className='text-gray-500 block mb-4'>
                  {t('cart.load_failed_description')}
                </Typography.Text>
              </div>
            }
          />
          <Button type='primary' size='large' className='mt-4 px-8 h-12' onClick={() => navigate('/products')}>
            {t('cart.continue_shopping')}
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(cart.subtotal) || 0;
  const discount_amount = parseFloat(cart.discount_amount) || 0;
  const total_amount = parseFloat(cart.total_amount) || 0;

  if (!items || items.length === 0) {
    return (
      <div className='bg-white min-h-screen'>
        <div className='container mx-auto px-4 py-12 max-w-4xl'>
          <div className='flex items-center mb-8'>
            <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} className='mr-2'>
              Continue shopping
            </Button>
            <Typography.Title level={3} className='m-0'>
              Shopping Cart
            </Typography.Title>
          </div>

          <div className='bg-gray-50 rounded-2xl shadow-sm p-12 text-center'>
            <div className='flex flex-col items-center'>
              <div className='mb-6 rounded-full bg-blue-50 p-6'>
                <ShoppingCartOutlined style={{ fontSize: 80, color: '#3b82f6' }} />
              </div>
              <Typography.Title level={3} className='mt-2 font-medium'>
                {t('cart.empty')}
              </Typography.Title>
              <Typography.Paragraph className='text-gray-500 mb-8 max-w-md'>
                {t('cart.empty_message')}
              </Typography.Paragraph>
              <Button
                type='primary'
                size='large'
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
                className='h-12 px-8 text-base'
              >
                {t('cart.explore_products')}
              </Button>

              <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-orange-50 p-3'>
                    <TagOutlined style={{ fontSize: 24, color: '#f97316' }} />
                  </div>
                  <Typography.Text strong>{t('cart.exclusive_offers')}</Typography.Text>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-green-50 p-3'>
                    <TruckOutlined style={{ fontSize: 24, color: '#22c55e' }} />
                  </div>
                  <Typography.Text strong>{t('cart.fast_delivery')}</Typography.Text>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-blue-50 p-3'>
                    <SafetyOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
                  </div>
                  <Typography.Text strong>{t('cart.quality_assurance')}</Typography.Text>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='mb-3 rounded-full bg-purple-50 p-3'>
                    <HeartOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />
                  </div>
                  <Typography.Text strong>{t('cart.customer_service')}</Typography.Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('vi-VN') + 'đ';
  };

  const freeShippingThreshold = 500000;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const isFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className='bg-bg-secondary min-h-screen py-8'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='flex items-center mb-8'>
          <Button
            type='link'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
            className='mr-2 flex items-center text-gray-600 hover:text-blue-500'
          >
            Continue shopping
          </Button>
          <Typography.Title level={3} className='m-0 flex items-center'>
            <ShoppingCartOutlined className='mr-2' />
            Your cart
            <Badge count={items.length} className='ml-3' style={{ backgroundColor: '#3b82f6' }} />
          </Typography.Title>
        </div>

        {/* Free Shipping Progress */}
        {!isFreeShipping && (
          <Card className='mb-6 rounded-xl border-0 shadow-sm overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-500 to-indigo-600 -mx-6 -mt-6 py-4 px-6 text-white'>
              <div className='flex items-center'>
                <TruckOutlined className='text-2xl mr-3' />
                <Typography.Title level={5} className='m-0 text-white'>
                  Free shipping for orders from {formatPrice(freeShippingThreshold)}
                </Typography.Title>
              </div>
            </div>
            <div className='mt-4'>
              <div className='flex justify-between mb-2'>
                <Typography.Text>Add {formatPrice(amountToFreeShipping)} more to get free shipping</Typography.Text>
                <Typography.Text strong>{progressPercent}%</Typography.Text>
              </div>
              <Progress
                percent={progressPercent}
                showInfo={false}
                strokeColor={{
                  '0%': '#3b82f6',
                  '100%': '#4f46e5',
                }}
                trailColor='#e5e7eb'
                strokeWidth={8}
                className='custom-progress'
              />
            </div>
          </Card>
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className='rounded-xl border-0 shadow-sm'>
              <div className='flex justify-between items-center mb-6'>
                <Typography.Title level={5} className='m-0 flex items-center'>
                  <Checkbox
                    className='mr-3'
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                  {t('cart.select_all')} ({items.length})
                </Typography.Title>

                <Button type='text' danger icon={<DeleteOutlined />} disabled={selectedItems.length === 0}>
                  {t('cart.remove_selected')} ({selectedItems.length})
                </Button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className='mb-6 last:mb-0 bg-white rounded-xl hover:shadow-md transition-shadow duration-300'
                >
                  <div className='flex flex-col sm:flex-row p-4 sm:items-center'>
                    <div className='flex items-start sm:items-center mr-4 mb-4 sm:mb-0'>
                      <Checkbox
                        className='mr-3 mt-1 sm:mt-0'
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                      <div className='relative'>
                        <Image
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name}
                          className='rounded-lg'
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover' }}
                          preview={false}
                        />
                        {parseFloat(item.discount_amount) > 0 && (
                          <Badge.Ribbon
                            text={
                              item.original_price && item.unit_price
                                ? `-${Math.round(
                                    ((item.original_price - item.unit_price) / item.original_price) * 100,
                                  )}%`
                                : null
                            }
                            color='#f43f5e'
                            className='absolute top-0 right-0'
                          />
                        )}
                      </div>
                    </div>

                    <div className='flex-grow'>
                      <div className='flex flex-col sm:flex-row justify-between'>
                        <div className='mb-3 sm:mb-0 pr-4'>
                          <Typography.Text strong className='text-lg block'>
                            {item.name}
                          </Typography.Text>

                          <div className='flex flex-wrap gap-2 mt-2'>
                            {item.sku && (
                              <Tag color='default' className='mr-0'>
                                SKU: {item.sku}
                              </Tag>
                            )}

                            {item.stock_quantity > 0 ? (
                              <Tag color='success' icon={<ClockCircleOutlined />} className='mr-0'>
                                In stock
                              </Tag>
                            ) : (
                              <Tag color='error' className='mr-0'>
                                Out of stock
                              </Tag>
                            )}
                          </div>

                          {parseFloat(item.discount_amount) > 0 && (
                            <div className='mt-2'>
                              <Tag color='red' icon={<TagOutlined />}>
                                Discount {formatPrice(item.discount_amount)}
                              </Tag>
                            </div>
                          )}
                        </div>

                        <div className='flex flex-col items-start sm:items-end'>
                          <div className='flex items-baseline'>
                            <Typography.Text strong className='text-lg text-blue-600'>
                              {formatPrice(item.total_price)}
                            </Typography.Text>

                            {parseFloat(item.discount_amount) > 0 && item.original_price && (
                              <Typography.Text delete className='text-gray-400 text-sm ml-2'>
                                {formatPrice(item.original_price * item.quantity)}
                              </Typography.Text>
                            )}
                          </div>

                          <div className='flex items-center mt-3 border rounded-full bg-gray-50 overflow-hidden'>
                            <Button
                              type='text'
                              icon={<MinusOutlined />}
                              className='border-0 bg-transparent hover:bg-gray-100'
                              onClick={() => handleQuantityChange(item.id, -1)}
                            />
                            <div className='px-3 font-medium'>{item.quantity}</div>
                            <Button
                              type='text'
                              icon={<PlusOutlined />}
                              className='border-0 bg-transparent hover:bg-gray-100'
                              onClick={() => handleQuantityChange(item.id, 1)}
                            />
                          </div>

                          <div className='mt-3 flex'>
                            <Button
                              type='text'
                              icon={<HeartOutlined />}
                              className='text-gray-500 hover:text-pink-500 hover:bg-pink-50 mr-1'
                              onClick={() => handleToggleWishlist(item.product_id, item.variant_id)}
                            >
                              Save
                            </Button>

                            <Button
                              type='text'
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveItem(item.id)}
                              className='hover:bg-red-50'
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <Card className='mt-6 rounded-xl border-0 shadow-sm'>
              <div className='flex items-center mb-4'>
                <MessageOutlined className='text-xl text-blue-500 mr-3' />
                <Typography.Title level={5} className='m-0'>
                  Order Note
                </Typography.Title>
                <Tooltip title='Additional order notes or special delivery requests'>
                  <InfoCircleOutlined className='ml-2 text-gray-400' />
                </Tooltip>
              </div>
              <TextArea
                rows={4}
                placeholder={t('cart.order_note_placeholder')}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                onBlur={handleUpdateNote}
                className='rounded-lg'
                maxLength={500}
              />
              <div className='mt-2 text-right text-gray-500 text-sm'>{orderNote.length}/500 ký tự</div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div className='sticky top-6'>
              <Card className='mb-6 rounded-xl border-0 shadow-sm overflow-hidden'>
                <div className='bg-gradient-to-r from-orange-500 to-amber-500 -mx-6 -mt-6 py-4 px-6 text-white flex items-center mb-4'>
                  <GiftOutlined className='text-2xl mr-3' />
                  <Typography.Title level={5} className='m-0 text-white'>
                    Discount Code
                  </Typography.Title>
                </div>

                {cart.discount_code ? (
                  <div className='bg-orange-50 p-4 rounded-lg border border-orange-100'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <Tag color='success' className='mr-2 text-base px-2 py-1'>
                          {cart.discount_code}
                        </Tag>
                        <Typography.Text type='success'>Applied</Typography.Text>
                      </div>
                      <Button danger type='link' size='small' onClick={handleRemoveCoupon}>
                        Remove
                      </Button>
                    </div>
                    <div className='text-red-500 font-medium mt-2'>Discount: {formatPrice(discount_amount)}</div>
                  </div>
                ) : (
                  <div>
                    <div className='flex'>
                      <Input
                        placeholder={t('cart.enter_coupon')}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        prefix={<TagOutlined className='text-gray-400' />}
                        className='rounded-l-lg'
                      />
                      <Button type='primary' onClick={() => handleApplyCoupon()} className='rounded-r-lg'>
                        {t('cart.apply_coupon')}
                      </Button>
                    </div>
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {availableCodes.map(({ discount_code, remaining_uses, expires_in_days }) => (
                        <Tooltip
                          key={discount_code}
                          title={`Remaining ${remaining_uses ?? '∞'} uses • EXP: ${
                            expires_in_days != null ? `${expires_in_days} days` : 'Unlimited'
                          }`}
                        >
                          <Tag
                            color={
                              (remaining_uses !== null && remaining_uses <= 3) ||
                              (expires_in_days !== null && expires_in_days <= 3)
                                ? 'red'
                                : 'blue'
                            }
                            className='cursor-pointer hover:opacity-80'
                            onClick={() => setCouponCode(discount_code)}
                          >
                            {discount_code}
                          </Tag>
                        </Tooltip>
                      ))}
                    </div>
                    <Typography.Text type='secondary' className='text-xs mt-2 block'>
                      Click on a code to copy, then click "Apply"
                    </Typography.Text>
                  </div>
                )}
              </Card>

              <Card className='rounded-xl border-0 shadow-sm'>
                <Typography.Title level={4} className='mb-6'>
                  {t('checkout.payment_info')}
                </Typography.Title>

                <div className='space-y-4 mb-6'>
                  <div className='flex justify-between'>
                    <Typography.Text className='text-gray-500'>
                      {t('checkout.items_total')} ({selectedCartItems.length} {t('product.quantity').toLowerCase()})
                    </Typography.Text>
                    <Typography.Text>{formatPrice(selectedSubtotal)}</Typography.Text>
                  </div>

                  {/* Hiển thị giảm giá chỉ khi có mã giảm giá đã áp dụng và có giảm giá thực sự */}
                  {cart.discount_code && parseFloat(cart.discount_amount) > 0 && (
                    <div className='flex justify-between'>
                      <Typography.Text className='text-gray-500'>
                        {t('cart.discount')} <Tag color='green'>{cart.discount_code}</Tag>
                      </Typography.Text>
                      <Typography.Text className='text-red-500 font-medium'>
                        -{formatPrice(cart.discount_amount)}
                      </Typography.Text>
                    </div>
                  )}

                  <div className='flex justify-between'>
                    <Typography.Text className='text-gray-500'> {t('cart.shipping')}</Typography.Text>
                    <Typography.Text
                      className={selectedSubtotal >= freeShippingThreshold ? 'text-green-500 font-medium' : ''}
                    >
                      {selectedSubtotal >= freeShippingThreshold ? 'Free' : 'Calculated at checkout'}
                    </Typography.Text>
                  </div>
                </div>

                <Divider className='my-4' />

                <div className='flex justify-between mb-6'>
                  <Typography.Text strong className='text-lg'>
                    {t('cart.total')}
                  </Typography.Text>
                  <div className='text-right'>
                    <Typography.Text strong className='text-blue-600 text-2xl'>
                      {formatPrice(finalTotal)}
                    </Typography.Text>
                    <div className='text-gray-500 text-xs'> ({t('checkout.vat_note', 'Đã bao gồm VAT nếu có')})</div>
                  </div>
                </div>
                <Button
                  type='primary'
                  block
                  size='large'
                  onClick={() =>
                    navigate('/checkout', {
                      state: {
                        selectedItems,
                        applyDiscount: discountApplied, // ✅ thêm dòng này
                      },
                    })
                  }
                  className='h-14 text-base flex items-center justify-center'
                  disabled={selectedCartItems.length === 0}
                >
                  <LockOutlined className='mr-2' />
                  {t('cart.proceed_to_checkout')} ({selectedCartItems.length})
                </Button>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CartScreen;
