import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography, Row, Col, Carousel, Card, Button, Spin, Skeleton, Empty, Divider } from 'antd';
import { RightOutlined, ShoppingOutlined, FireOutlined, StarOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCategory } from '@/service/category';
import { getProductApplyCP } from '@/service/product';
import ProductCard from '@/pages/product/components/ProductCard';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const bannerItems = [
  {
    id: 1,
    image: 'https://esmee.qodeinteractive.com/wp-content/uploads/revslider/Esmee--Dijana/Main-home-img.jpg',
    title: 'New Collection 2025',
    description: 'Discover our latest styles with premium materials and modern designs.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    id: 2,
    image: 'https://esmee.qodeinteractive.com/wp-content/uploads/2021/08/h1-rev-img1.jpg',
    title: 'Summer Essentials',
    description: 'Stay cool and stylish with our curated selection for the season.',
    buttonText: 'Explore',
    buttonLink: '/products?categoryId=1',
  },
  {
    id: 3,
    image: 'https://esmee.qodeinteractive.com/wp-content/uploads/2021/07/main-home-rev-img-2.jpg',
    title: 'Premium Quality',
    description: 'Discover the difference quality makes in every piece we create.',
    buttonText: 'View Collections',
    buttonLink: '/products',
  },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userId = currentUser?.id || null;
  const { t } = useTranslation();

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['home-categories'],
    queryFn: getCategory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: featuredProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ['home-featured-products', userId],
    queryFn: () =>
      getProductApplyCP({
        limit: 8,
        userId: userId,
        sortBy: 'newest',
      }),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleViewProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleViewCategory = (categoryId) => {
    navigate(`/products?categoryId=${categoryId}`);
  };

  const renderCategorySkeleton = () => (
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4].map((item) => (
        <Col xs={12} md={6} key={item}>
          <Skeleton.Button active style={{ width: '100%', height: 150 }} />
          <Skeleton.Input active style={{ width: '80%', marginTop: 8 }} />
        </Col>
      ))}
    </Row>
  );

  const renderProductsSkeleton = () => (
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4].map((item) => (
        <Col xs={12} sm={8} md={6} key={item}>
          <Card>
            <Skeleton.Image active style={{ width: '100%', height: 180 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className='bg-bg-secondary min-h-screen'>
      {/* Hero Carousel */}
      <Carousel autoplay effect='fade' autoplaySpeed={1300} className='homepage-hero-carousel'>
        {bannerItems.map((item) => (
          <div key={item.id}>
            <div
              className='relative h-[70vh] bg-cover bg-center flex items-center'
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent'></div>

              <div className='container mx-auto px-4 relative z-10'>
                <div
                  className='max-w-lg p-6 rounded-xl backdrop-blur-md shadow-md'
                  style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <Title level={1} className='text-white m-0 mb-2'>
                    {item.title}
                  </Title>
                  <Text className='text-white text-lg block mb-6'>{item.description}</Text>
                  <Button
                    type='primary'
                    size='large'
                    onClick={() => navigate(item.buttonLink)}
                    className='min-w-[120px]'
                  >
                    {item.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className='container mx-auto px-4 py-12'>
        {/* Categories Section */}
        <div className='mb-16'>
          <div className='flex justify-between items-center mb-6'>
          <Title level={2}>{t('home.shop_by_category')}</Title>

            <Button type='link' onClick={handleViewAllProducts} className='flex items-center text-blue-600'>
              View All <RightOutlined />
            </Button>
          </div>

          {categoriesLoading ? (
            renderCategorySkeleton()
          ) : categoriesData?.data?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {categoriesData.data.slice(0, 8).map((category) => (
                <Col xs={12} md={6} key={category.id}>
                  <Card
                    hoverable
                    cover={
                      <div className='h-[150px] overflow-hidden'>
                        <img
                          src={category.image_url || 'https://via.placeholder.com/300x150?text=Category'}
                          alt={category.name}
                          className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
                        />
                      </div>
                    }
                    className='text-center shadow-sm'
                    bodyStyle={{ padding: '16px 8px' }}
                    onClick={() => handleViewCategory(category.id)}
                  >
                    <Title level={5} className='m-0'>
                      {category.name}
                    </Title>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description='No categories found' />
          )}
        </div>

        {/* Featured Products Section */}
        <div className='mb-16 bg-white p-8 rounded-lg shadow-sm'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center'>
              <StarOutlined className='text-yellow-500 text-xl mr-2' />
              <Title level={2} className='m-0'>
                Featured Products
              </Title>
            </div>
            <Button type='primary' onClick={handleViewAllProducts} icon={<ShoppingOutlined />}>
              Shop All Products
            </Button>
          </div>

          {productsLoading ? (
            renderProductsSkeleton()
          ) : featuredProductsData?.data?.length > 0 ? (
            <Row gutter={[16, 24]}>
              {featuredProductsData.data.map((product) => (
                <Col xs={12} sm={8} md={6} key={product.id}>
                  <ProductCard product={product} onViewDetail={handleViewProductDetail} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description='No products found' />
          )}
        </div>

        {/* Promotional Banner */}
        <div className='mb-16'>
          <div
            className='relative h-[300px] bg-cover bg-center flex items-center rounded-lg overflow-hidden'
            style={{
              backgroundImage: 'url(https://esmee.qodeinteractive.com/wp-content/uploads/2021/07/categories-4.jpg)',
            }}
          >
            <div className='absolute inset-0 bg-black bg-opacity-40'></div>
            <div className='relative z-10 p-8 max-w-lg'>
              <Title level={2} className='text-white'>
                Summer Sale
              </Title>
              <Text className='text-white text-lg block mb-4'>
                Up to 50% off on selected items. Limited time offer.
              </Text>
              <Button
                type='primary'
                size='large'
                onClick={() => navigate('/products')}
                className='bg-white text-black border-white hover:bg-gray-200 hover:text-black hover:border-gray-200'
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className='mb-8'>
          <Row gutter={[24, 24]} className='py-4'>
            <Col xs={24} sm={12} md={6}>
              <Card className='text-center h-full shadow-sm hover:shadow-md transition-shadow'>
                <div className='text-blue-500 text-4xl mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-16 w-16 mx-auto'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                    />
                  </svg>
                </div>
                <Title level={4}>Quality Guarantee</Title>
                <Text className='text-gray-600'>We stand behind the quality of every product we sell.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className='text-center h-full shadow-sm hover:shadow-md transition-shadow'>
                <div className='text-green-500 text-4xl mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-16 w-16 mx-auto'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                    />
                  </svg>
                </div>
                <Title level={4}>Secure Payments</Title>
                <Text className='text-gray-600'>Your transactions are protected with our secure payment system.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className='text-center h-full shadow-sm hover:shadow-md transition-shadow'>
                <div className='text-purple-500 text-4xl mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-16 w-16 mx-auto'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                </div>
                <Title level={4}>Free Returns</Title>
                <Text className='text-gray-600'>Not satisfied? Return within 30 days for a full refund.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className='text-center h-full shadow-sm hover:shadow-md transition-shadow'>
                <div className='text-red-500 text-4xl mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-16 w-16 mx-auto'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                </div>
                <Title level={4}>Fast Delivery</Title>
                <Text className='text-gray-600'>Get your order delivered to your doorstep quickly.</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className='bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white py-20'>
        <div className='container mx-auto px-4 text-center'>
          <Title level={2} className='text-white text-3xl sm:text-4xl font-bold mb-4'>
            Join Our Style Circle
          </Title>
          <Text className='text-gray-300 text-base sm:text-lg block mb-8 max-w-2xl mx-auto leading-relaxed'>
            Be the first to know about fresh arrivals, seasonal trends, and exclusive deals delivered right to your
            inbox.
          </Text>
          <div className='max-w-xl mx-auto flex flex-col sm:flex-row gap-3'>
            <input
              type='email'
              placeholder='Enter your email'
              className='flex-1 p-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white transition-all'
            />
            <Button
              type='primary'
              size='large'
              shape='round'
              className='bg-white text-black hover:bg-gray-200 transition-all font-semibold px-6 py-2'
            >
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
