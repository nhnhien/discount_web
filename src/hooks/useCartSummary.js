import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/service/cart';
import { useSelector } from 'react-redux';

export const useCartSummary = () => {
  const currentUser = useSelector((state) => state.auth.currentUser);

  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60,
    enabled: !!currentUser, // ✅ chỉ gọi khi có user đăng nhập
  });
};