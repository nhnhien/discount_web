import React from 'react';
import { Card, Badge, Typography, Tag, Button, Tooltip, Rate } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { Meta } = Card;

const ProductCard = ({ product, onAddToCart, onToggleWishlist, onViewDetail }) => {
  const navigate = useNavigate();
  if (!product) return null;

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Function to get price display for products with variants
  const getPriceDisplay = () => {
    // If product has variants
    if (product.has_variant && product.variants && product.variants.length > 0) {
      // Find min and max prices among variants
      const prices = product.variants.map((variant) => variant.final_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Check if all variant prices are the same
      const allPricesSame = prices.every((price) => price === minPrice);

      if (allPricesSame) {
        // If all prices are the same, show single price
        return (
          <div className='flex items-center gap-2'>
            <Text className='text-lg font-bold text-blue-600'>{formatCurrency(minPrice)}</Text>
          </div>
        );
      } else {
        // If prices vary, show price range
        return (
          <div className='flex items-center gap-2'>
            <Text className='text-lg font-bold text-blue-600'>Từ {formatCurrency(minPrice)}</Text>
          </div>
        );
      }
    }

    // If no variants, show regular price
    const hasDiscount = product.original_price > product.final_price;
    const discount = product.original_price - product.final_price;
    const discountPercent = hasDiscount ? Math.round((discount / product.original_price) * 100) : 0;

    return (
      <div className='flex items-center gap-2'>
        <Text className='text-lg font-bold text-blue-600'>{formatCurrency(product.final_price)}</Text>
        {hasDiscount && (
          <Text delete className='text-sm text-gray-500'>
            {formatCurrency(product.original_price)}
          </Text>
        )}
      </div>
    );
  };

  // Calculate discount percentage for non-variant products
  const hasDiscount = product.original_price > product.final_price;
  const discount = product.original_price - product.final_price;
  const discountPercent = hasDiscount ? Math.round((discount / product.original_price) * 100) : 0;

  return (
    <Badge.Ribbon text={`-${discountPercent}%`} color='red' style={{ display: hasDiscount ? 'block' : 'none' }}>
      <Card
        onClick={() => navigate(`/product/${product.id}`)}
        hoverable
        className='overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg h-full'
        style={{ display: 'flex', flexDirection: 'column' }}
        cover={
          <div className='relative h-64 overflow-hidden bg-gray-100'>
            <img
              alt={product.name}
              src={product.image_url || 'https://via.placeholder.com/300'}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
              }}
            />
            <div className='absolute inset-0 bg-black bg-opacity-0 opacity-0 hover:bg-opacity-20 hover:opacity-100 transition-all duration-300 flex items-center justify-center'>
              <div className='flex gap-2'>
                <Tooltip title='Xem chi tiết'>
                  <Button
                    shape='circle'
                    icon={<EyeOutlined />}
                    onClick={() => onViewDetail(product.id)}
                    className='bg-white hover:bg-blue-500 hover:text-white'
                  />
                </Tooltip>
                <Tooltip title='Thêm vào giỏ hàng'>
                  <Button
                    shape='circle'
                    icon={<ShoppingCartOutlined />}
                    onClick={() => onAddToCart(product)}
                    className='bg-white hover:bg-blue-500 hover:text-white'
                  />
                </Tooltip>
                <Tooltip title='Thêm vào yêu thích'>
                  <Button
                    shape='circle'
                    icon={<HeartOutlined />}
                    onClick={() => onToggleWishlist(product)}
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
          <Button type='text' icon={<ShoppingCartOutlined />} onClick={() => onAddToCart(product)} key='add-to-cart'>
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
              {/* Rating */}
              <div className='flex items-center'>
                <Rate disabled defaultValue={4} className='text-xs text-yellow-500' />
                <Text className='ml-2 text-xs text-gray-500'>(120)</Text>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-1'>
                {product.has_variant && <Tag color='blue'>Nhiều phiên bản</Tag>}
                {product.stock_quantity <= 5 && <Tag color='red'>Sắp hết hàng</Tag>}
                {product.category?.name && <Tag color='green'>{product.category.name}</Tag>}
              </div>

              {/* Giá */}
              <div className='mt-auto pt-2'>{getPriceDisplay()}</div>
            </div>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;
