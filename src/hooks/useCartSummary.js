import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/service/cart';

export const useCartSummary = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60, 
  });
};