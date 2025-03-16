import React from 'react';
 import HomeSlider from './HomeSlider';
 import HomeBanner from './HomeBanner';
 import ProductCard from '@/pages/product/components/ProductCard';
 
 const FeaturedCategories = () => {
   return (
     <div className='p-12'>
       <h2 className='text-3xl font-bold text-center mb-6'>Danh mục nổi bật</h2>
       <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
         <div className='p-4 bg-gray-100 rounded-lg text-center'>Áo sơ mi</div>
         <div className='p-4 bg-gray-100 rounded-lg text-center'>Quần jeans</div>
         <div className='p-4 bg-gray-100 rounded-lg text-center'>Đầm công sở</div>
         <div className='p-4 bg-gray-100 rounded-lg text-center'>Áo khoác</div>
       </div>
     </div>
   );
 };
 
 const TrendingProducts = () => {
   const products = [
     { id: 1, name: 'Sản phẩm 1', price: '500.000', image: '/product1.jpg' },
     { id: 2, name: 'Sản phẩm 2', price: '600.000', image: '/product2.jpg' },
     { id: 3, name: 'Sản phẩm 3', price: '700.000', image: '/product3.jpg' },
   ];
 
   return (
     <div className='p-12'>
       <h2 className='text-3xl font-bold text-center mb-6'>Sản phẩm gợi ý</h2>
       <div className='grid grid-cols-1 md:grid-cols-3 gap-6 container mx-auto'>
         {products.map((product) => (
           <ProductCard key={product.id} product={product} />
         ))}
       </div>
     </div>
   );
 };
 
 const HomeScreen = () => {
   return (
     <div>
       <HomeSlider />
       <HomeBanner />
       <FeaturedCategories />
       <TrendingProducts />
     </div>
   );
 };
 
 export default HomeScreen;