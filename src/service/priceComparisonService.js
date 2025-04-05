import apiClient from '@/config/axios.config';

// Lấy thông tin so sánh giá
export const getPriceComparison = async (productId, variantId = null) => {
  try {
    const path = variantId
      ? `/api/price-comparison/product/${productId}/variant/${variantId}`
      : `/api/price-comparison/product/${productId}`;

    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching price comparison:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy dữ liệu so sánh giá');
  }
};

// Lấy danh sách sàn TMĐT (để mở rộng sau này)
export const getSupportedPlatforms = async () => {
  try {
    const response = await apiClient.get('/api/price-comparison/platforms');
    return response.data;
  } catch (error) {
    console.error('Error fetching supported platforms:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách sàn thương mại điện tử');
  }
};

// Lấy lịch sử giá
export const getPriceHistory = async (productId, variantId = null, days = 30) => {
  try {
    const path = variantId
      ? `/api/price-comparison/history/product/${productId}/variant/${variantId}/${days}`
      : `/api/price-comparison/history/product/${productId}/${days}`;

    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy lịch sử giá');
  }
};

export default {
  getPriceComparison,
  getSupportedPlatforms,
  getPriceHistory
};