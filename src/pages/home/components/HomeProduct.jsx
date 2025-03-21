import { getProductApplyCP } from '@/service/product';
 import { useQuery } from '@tanstack/react-query';
 import React from 'react';
 import { useDispatch, useSelector } from 'react-redux';
 
 const HomeProduct = () => {
   const currentUser = useSelector((state) => state.auth.currentUser);
   const id = currentUser?.id || '';
   const dispatch = useDispatch();
   const { data: products } = useQuery({ queryKey: ['products', id], queryFn: () => getProductApplyCP(id) });
   console.log('🚀 ~ HomeProduct ~ products:', products);
   return <div>Product</div>;
 };
 
 export default HomeProduct;