
 import React from 'react';
 import { useQuery } from '@tanstack/react-query';
 import { useSelector } from 'react-redux';
 import { Row, Col, Typography, Skeleton, Button, Empty, message } from 'antd';
 import { RightOutlined } from '@ant-design/icons';
 import { useNavigate } from 'react-router-dom';
 import ProductCard from '@/pages/product/components/ProductCard';
 import { getProduct, getProductApplyCP } from '@/service/product';
 
 const { Title } = Typography; 
 const HomeProduct = () => {
   const currentUser = useSelector((state) => state.auth.currentUser);
   const userId = currentUser?.id || '';
   console.log(userId);
   const navigate = useNavigate();
 
   const {
     data: productsData,
     isLoading: isLoadingProducts,
     error: productsError,
   } = useQuery({
     queryKey: ['featuredProducts', userId],
     queryFn: () =>
       getProductApplyCP({
         userId,
         limit: 8,
       }),
   });
 
   const handleViewProductDetail = (productId) => {
     navigate(`/product/${productId}`);
   };
 
   const handleFeatureNotAvailable = () => {
     message.info('Chức năng này sẽ được cập nhật trong thời gian tới!');
   };
 
   const handleViewAllProducts = () => {
     navigate('/products');
   };
 
   const products = productsData?.data || [];
 
   const renderSkeletons = () => {
     return Array(4)
       .fill()
       .map((_, index) => (
         <Col xs={24} sm={12} md={6} lg={6} key={`skeleton-${index}`}>
           <div className='bg-white p-4 rounded-lg shadow-sm h-full'>
             <Skeleton.Image className='w-full h-52' active />
             <Skeleton active paragraph={{ rows: 2 }} className='mt-4' />
           </div>
         </Col>
       ));
   };
 
   if (productsError) {
     return null;
   }
 
   return (
     <div className='bg-gray-50 py-8'>
       <div className='container mx-auto px-4'>
         <div className='flex justify-between items-center mb-6'>
           <Title level={2} className='text-blue-700 mb-0'>
             Sản phẩm nổi bật
           </Title>
           <Button type='link' onClick={handleViewAllProducts} className='text-blue-600 flex items-center'>
             Xem tất cả <RightOutlined />
           </Button>
         </div>
 
         {/* Grid sản phẩm */}
         <Row gutter={[16, 24]}>
           {isLoadingProducts ? (
             renderSkeletons()
           ) : products.length > 0 ? (
             products.map((product) => (
               <Col xs={24} sm={12} md={6} lg={6} key={product.id} className='h-full' style={{ marginBottom: 24 }}>
                 <div className='h-full'>
                   <ProductCard
                     product={product}
                     onAddToCart={handleFeatureNotAvailable}
                     onToggleWishlist={handleFeatureNotAvailable}
                     onViewDetail={handleViewProductDetail}
                     isInWishlist={false}
                   />
                 </div>
               </Col>
             ))
           ) : (
             <Col span={24} className='text-center py-10'>
               <Empty description='Không có sản phẩm nổi bật' image={Empty.PRESENTED_IMAGE_SIMPLE} />
             </Col>
           )}
         </Row>
       </div>
     </div>
   );
 };
 
 export default HomeProduct;