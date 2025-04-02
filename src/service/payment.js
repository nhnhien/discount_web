import apiClient from '@/config/axios.config';

export const paymentService = {
  process: (orderId, totalAmount) =>
    apiClient.post('/api/payment/process', { orderId, totalAmount }),

  repay: (orderId, totalAmount) =>
    apiClient.post('/api/payment/repayment', { orderId, totalAmount }),
};