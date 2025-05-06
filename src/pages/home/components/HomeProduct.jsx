import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Row, Col, Typography, Skeleton, Button, Empty, message, Alert } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/pages/product/components/ProductCard';
import { getProductApplyCP } from '@/service/product';

const { Title } = Typography;

const HomeProduct = () => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userId = currentUser?.id || null; // ⚠️ null thay vì ''
  const navigate = useNavigate();

  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['featuredProducts', userId],
    queryFn: () =>
      getProductApplyCP({
        userId,
        limit: 8,
      }),
    enabled: userId !== null, // ✅ Chỉ gọi khi đã đăng nhập
    retry: false,
  });

  const products = productsData?.data || [];

  const handleViewProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const renderSkeletons = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <Col xs={24} sm={12} md={6} lg={6} key={i}>
        <div className='bg-white p-4 rounded-lg shadow-sm h-full'>
          <Skeleton.Image className='w-full h-52' active />
          <Skeleton active paragraph={{ rows: 2 }} className='mt-4' />
        </div>
      </Col>
    ));

  return (
    <div className='bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center mb-6'>
          <Title level={2} className='text-blue-700 mb-0'>
          Featured Products
          </Title>
          <Button type='link' onClick={handleViewAllProducts} className='text-blue-600 flex items-center'>
          View All <RightOutlined />
          </Button>
        </div>

        <Row gutter={[16, 24]}>
          {isLoading ? (
            renderSkeletons()
          ) : isError ? (
            <Col span={24}>
              <Alert
                type='error'
                message='Failed to load products'
                description={error.message || 'An unexpected error occurred'}
                showIcon
              />
            </Col>
          ) : products.length > 0 ? (
            products.map((product) => (
              <Col xs={24} sm={12} md={6} lg={6} key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={() => message.info('This feature will be updated soon')}
                  onToggleWishlist={() => message.info('This feature will be updated soon')}
                  onViewDetail={handleViewProductDetail}
                  isInWishlist={false}
                />
              </Col>
            ))
          ) : (
            <Col span={24} className='text-center py-10'>
              <Empty description='No featured products found' />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default HomeProduct;