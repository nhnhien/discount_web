import React from 'react';
import {
  Card,
  Badge,
  Typography,
  Tag,
  Button,
  Tooltip,
  Rate,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/service/cart';
import { useSelector } from 'react-redux';

const { Text } = Typography;
const { Meta } = Card;

const ProductCard = ({ product, onToggleWishlist, onViewDetail }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userId = currentUser?.id;

  if (!product) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const addToCartMutation = useMutation({
    mutationFn: (productData) => cartService.addToCart(productData),
    onSuccess: () => {
      message.success('Đã thêm sản phẩm vào giỏ hàng');
      queryClient.invalidateQueries(['cart']);
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
    },
  });

  const handleAddToCart = () => {
    if (!userId) {
      return message.warning('Vui lòng đăng nhập trước khi thêm vào giỏ hàng');
    }

    const productToAdd = {
      userId,
      product_id: product.id,
      variant_id: null,
      quantity: 1,
    };

    addToCartMutation.mutate(productToAdd);
  };

  const getPriceDisplay = () => {
    if (product.has_variant && product.variants?.length > 0) {
      const prices = product.variants.map((v) => v.final_price);
      const minPrice = Math.min(...prices);
      const samePrice = prices.every((p) => p === minPrice);

      return samePrice ? (
        <Text className='text-lg font-bold text-blue-600'>{formatCurrency(minPrice)}</Text>
      ) : (
        <Text className='text-lg font-bold text-blue-600'>Từ {formatCurrency(minPrice)}</Text>
      );
    }

    const hasDiscount = product.original_price > product.final_price;

    return (
      <div className='flex items-center gap-2'>
        <Text className='text-lg font-bold text-blue-600'>
          {formatCurrency(product.final_price)}
        </Text>
        {hasDiscount && (
          <Text delete className='text-sm text-gray-500'>
            {formatCurrency(product.original_price)}
          </Text>
        )}
      </div>
    );
  };

  const hasDiscount = product.original_price > product.final_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price - product.final_price) / product.original_price) * 100)
    : 0;

  return (
    <Badge.Ribbon
      text={`-${discountPercent}%`}
      color='red'
      style={{ display: hasDiscount ? 'block' : 'none' }}
    >
      <Card
        hoverable
        onClick={() => navigate(`/product/${product.id}`)}
        className='overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg h-full'
        style={{ display: 'flex', flexDirection: 'column' }}
        cover={
          <div className='relative h-64 overflow-hidden bg-gray-100 group'>
            <img
              alt={product.name}
              src={product.image_url || 'https://via.placeholder.com/300'}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              onError={(e) => (e.target.src = 'https://via.placeholder.com/300')}
            />
            <div className='absolute inset-0 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center'>
              <div className='flex gap-2'>
                <Tooltip title='Xem chi tiết'>
                  <Button
                    shape='circle'
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(product.id);
                    }}
                    className='bg-white hover:bg-blue-500 hover:text-white'
                  />
                </Tooltip>
                <Tooltip title='Thêm vào giỏ hàng'>
                  <Button
                    shape='circle'
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                    className='bg-white hover:bg-blue-500 hover:text-white'
                  />
                </Tooltip>
                <Tooltip title='Yêu thích'>
                  <Button
                    shape='circle'
                    icon={<HeartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className='bg-white hover:bg-blue-500 hover:text-white'
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        }
        actions={[
          <Button type='text' icon={<EyeOutlined />} onClick={() => onViewDetail(product.id)} key='detail'>
            Chi tiết
          </Button>,
          <Button type='text' icon={<ShoppingCartOutlined />} onClick={handleAddToCart} key='add-to-cart'>
            Thêm vào giỏ
          </Button>,
        ]}
        bodyStyle={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}
      >
        <Meta
          title={
            <div className='font-medium text-base truncate' title={product.name}>
              {product.name}
            </div>
          }
          description={
            <div className='space-y-2 flex-grow' style={{ minHeight: '120px' }}>
              <div className='flex items-center'>
                <Rate disabled defaultValue={4} className='text-xs text-yellow-500' />
                <Text className='ml-2 text-xs text-gray-500'>(120)</Text>
              </div>
              <div className='flex flex-wrap gap-1'>
                {product.has_variant && <Tag color='blue'>Nhiều phiên bản</Tag>}
                {product.stock_quantity <= 5 && <Tag color='red'>Sắp hết hàng</Tag>}
                {product.category?.name && <Tag color='green'>{product.category.name}</Tag>}
              </div>
              <div className='mt-auto pt-2'>{getPriceDisplay()}</div>
            </div>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;