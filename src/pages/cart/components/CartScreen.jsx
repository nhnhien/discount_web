import React, { useState } from 'react';
import { Typography, Button, Checkbox, Divider, Row, Col, Card, Input, message } from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useNavigate } from 'react-router-dom';

const CartScreen = () => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const cartItems = [
    {
      id: 1,
      name: 'Áo thun nam',
      price: 250000,
      quantity: 2,
      image: 'https://via.placeholder.com/150',
      variants: [{ color: 'Trắng', size: 'L' }],
    },
    {
      id: 2,
      name: 'Quần jean nữ',
      price: 350000,
      quantity: 1,
      image: 'https://via.placeholder.com/150',
      variants: [{ color: 'Xanh', size: 'M' }],
    },
  ];

  // Coupon application handler
  const handleApplyCoupon = () => {
    if (!couponCode) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }
    // Temporary coupon validation
    message.success('Áp dụng mã giảm giá thành công');
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex justify-between items-center mb-6'>
        <Typography level={3} className='mb-0 flex items-center'>
          <ShoppingCartOutlined className='mr-2' />
          Giỏ hàng của bạn
        </Typography>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card>
            {cartItems.map((item) => (
              <div key={item.id} className='flex items-center py-4 border-b'>
                <Checkbox className='mr-4' />

                <img src={item.image} alt={item.name} className='w-24 h-24 object-cover mr-4 rounded' />

                <div className='flex-grow'>
                  <div className='flex justify-between'>
                    <div>
                      <Typography strong>{item.name}</Typography>
                      <div className='text-sm text-gray-500'>
                        {item.variants.map((variant) => `${variant.color}, ${variant.size}`).join(', ')}
                      </div>
                    </div>

                    <div className='flex items-center'>
                      <Button icon={<MinusOutlined />} size='small' className='mr-2' />
                      <Typography>{item.quantity}</Typography>
                      <Button icon={<PlusOutlined />} size='small' className='ml-2 mr-4' />

                      <Typography strong className='mr-4'>
                        {(item.price * item.quantity).toLocaleString()}đ
                      </Typography>

                      <Button type='text' danger icon={<DeleteOutlined />} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          <Card className='mt-4'>
            <div className='flex items-center mb-3'>
              <MessageOutlined className='mr-2 text-blue-500' />
              <Typography level={5} className='mb-0'>
                Ghi chú đơn hàng
              </Typography>
            </div>
            <TextArea
              rows={4}
              placeholder='Nhập ghi chú của bạn (nếu có)'
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className='mb-4'>
            <div className='flex items-center mb-3'>
              <TagOutlined className='mr-2 text-blue-500' />
              <Typography level={5} className='mb-0'>
                Mã giảm giá
              </Typography>
            </div>
            <div className='flex'>
              <Input
                placeholder='Nhập mã giảm giá'
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className='mr-2'
              />
              <Button type='primary' onClick={handleApplyCoupon}>
                Áp dụng
              </Button>
            </div>
          </Card>

          <Card>
            <Typography level={4}>Thông tin thanh toán</Typography>
            <Divider />

            <div className='flex justify-between mb-2'>
              <Typography>Tạm tính</Typography>
              <Typography strong>600.000đ</Typography>
            </div>

            <div className='flex justify-between mb-2'>
              <Typography>Giảm giá</Typography>
              <Typography strong className='text-red-500'>
                -50.000đ
              </Typography>
            </div>

            <Divider />

            <div className='flex justify-between mb-4'>
              <Typography strong>Tổng cộng</Typography>
              <Typography strong className='text-blue-600 text-lg'>
                550.000đ
              </Typography>
            </div>

            <Button type='primary' block size='large' onClick={() => navigate('/checkout')}>
              Tiến hành thanh toán
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartScreen;
