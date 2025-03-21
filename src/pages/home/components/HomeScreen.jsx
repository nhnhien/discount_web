import React from 'react';
 import HomeSlider from './HomeSlider';
 import HomeBanner from './HomeBanner';
 import ProductCard from '@/pages/product/components/ProductCard';
 import HomeProduct from './HomeProduct';
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
 
 const HomeScreen = () => {
   return (
     <div>
       <HomeSlider />
       <HomeBanner />
       <FeaturedCategories />
       <HomeProduct />
     </div>
   );
 };
 
 export default HomeScreen;