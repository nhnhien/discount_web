import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/service/product';
import { Row, Col, Empty, Spin, Typography, Button } from 'antd';
import ProductCard from '../product/components/ProductCard';

const { Title } = Typography;

const WishlistScreen = () => {
  const wishlist = useSelector((state) => state.wishlist) || [];
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userId = currentUser?.id;

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['wishlistProducts', wishlist],
    queryFn: async () => {
      const results = await Promise.allSettled(
        wishlist.map(async ({ productId, variantId }) => {
          const res = await getProductById(productId, userId);
          const product = res.data;
          const selectedVariant = variantId
            ? product.variants?.find((v) => v.id === variantId)
            : null;

          return { product, selectedVariant };
        })
      );

      return results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value);
    },
    enabled: wishlist.length > 0,
  });

  const isEmpty = !isLoading && (!Array.isArray(data) || data.length === 0);

  return (
    <div className='bg-gray-50 min-h-screen py-8'>
      <div className='container mx-auto px-4'>
        <Title level={3}>Danh sách sản phẩm yêu thích</Title>

        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <Spin size='large' />
          </div>
        ) : isError ? (
          <Empty description='Lỗi khi tải sản phẩm yêu thích' />
        ) : isEmpty ? (
          <Empty description='Bạn chưa thêm sản phẩm nào vào yêu thích'>
            <Button type='primary' onClick={() => window.location.href = '/products'}>
              Khám phá sản phẩm
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 24]}>
            {data.map(({ product, selectedVariant }) => (
              <Col key={`${product.id}-${selectedVariant?.id || 'default'}`} xs={24} sm={12} md={8} lg={6}>
                <ProductCard
                  product={product}
                  variant={selectedVariant} // 👈 truyền variant nếu có
                  onViewDetail={(id) => window.location.href = `/product/${id}`}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default WishlistScreen;
