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
  HeartFilled,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/service/cart';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/context/slice/wishlist';

const { Text } = Typography;
const { Meta } = Card;

const ProductCard = ({ product, variant = null, onToggleWishlist, onViewDetail }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const wishlist = useSelector((state) => state.wishlist) || [];
  const userId = currentUser?.id;

  if (!product) return null;

  // 👉 Check yêu thích dựa trên cả productId và variantId
  const isWishlisted = wishlist.some(
    (item) =>
      item.productId === product.id &&
      item.variantId === (variant?.id || null)
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const addToCartMutation = useMutation({
    mutationFn: (productData) => cartService.addToCart(productData),
    onSuccess: () => {
      message.success('Product added to cart successfully');
      queryClient.invalidateQueries(['cart']);
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Error adding product to cart');
    },
  });

  const handleAddToCart = () => {
    if (!userId) {
      return message.warning('Please log in before adding to cart');
    }

    const productToAdd = {
      userId,
      product_id: product.id,
      variant_id: variant?.id || null,
      quantity: 1,
    };

    addToCartMutation.mutate(productToAdd);
  };

  const handleToggleWishlist = () => {
    const payload = {
      productId: product.id,
      variantId: variant?.id || null,
    };

    if (onToggleWishlist) {
      onToggleWishlist(payload);
    } else {
      if (isWishlisted) {
        dispatch(removeFromWishlist(payload));
        message.info('Removed from wishlist');
      } else {
        dispatch(addToWishlist(payload));
        message.success('Added to wishlist');
      }
    }
  };

  const getPriceDisplay = () => {
    const isValidPrice = (p) => typeof p === 'number' && !isNaN(p) && p > 0;

    const finalPrice = variant?.final_price ?? product.final_price;
    const originalPrice = variant?.original_price ?? product.original_price;

    const hasDiscount = isValidPrice(originalPrice) && isValidPrice(finalPrice) && originalPrice > finalPrice;

    return (
      <div className='flex items-center gap-2'>
        <Text className='text-lg font-bold text-blue-600'>
          {isValidPrice(finalPrice) ? formatCurrency(finalPrice) : 'Contact for price'}
        </Text>
        {hasDiscount && (
          <Text delete className='text-sm text-gray-500'>
            {formatCurrency(originalPrice)}
          </Text>
        )}
      </div>
    );
  };

  const hasValidPrices =
    typeof product.original_price === 'number' &&
    typeof product.final_price === 'number' &&
    product.original_price > 0;

  const finalPrice = variant?.final_price ?? product.final_price;
  const originalPrice = variant?.original_price ?? product.original_price;

  const hasDiscount =
    typeof originalPrice === 'number' &&
    typeof finalPrice === 'number' &&
    originalPrice > finalPrice;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const imageUrl = variant?.image_url || product.image_url;

  return (
    <Badge.Ribbon
      text={discountPercent > 0 ? `-${discountPercent}%` : ''}
      color='red'
      style={{ display: discountPercent > 0 ? 'block' : 'none' }}
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
              src={imageUrl || 'https://via.placeholder.com/300'}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              onError={(e) => (e.target.src = 'https://via.placeholder.com/300')}
            />
            <div className='absolute inset-0 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center'>
              <div className='flex gap-2'>
                <Tooltip title='View details'>
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
                <Tooltip title='Add to cart'>
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
                <Tooltip title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
                  <Button
                    shape='circle'
                    icon={isWishlisted ? <HeartFilled className='text-red-500' /> : <HeartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist();
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
            Details
          </Button>,
          <Button type='text' icon={<ShoppingCartOutlined />} onClick={handleAddToCart} key='add-to-cart'>
            Add to cart
          </Button>,
        ]}
        bodyStyle={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}
      >
        <Meta
          title={
            <div className='font-medium text-base truncate' title={product.name}>
              {product.name}
              {variant?.sku ? ` (${variant.sku})` : ''}
            </div>
          }
          description={
            <div className='space-y-2 flex-grow' style={{ minHeight: '120px' }}>
              <div className='flex items-center'>
                <Rate disabled defaultValue={4} className='text-xs text-yellow-500' />
                <Text className='ml-2 text-xs text-gray-500'>(120)</Text>
              </div>
              <div className='flex flex-wrap gap-1'>
                {product.has_variant && <Tag color='blue'>Multiple Variants</Tag>}
                {(variant?.stock_quantity || product.stock_quantity) <= 5 && <Tag color='red'>Almost Sold Out</Tag>}
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

