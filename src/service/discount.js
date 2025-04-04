import apiClient from '@/config/axios.config';

// ✅ Kiểm tra mã giảm giá có hợp lệ (không áp dụng vào giỏ hàng)
export const validateDiscountCode = async ({ discount_code, user_id, product_id, variant_id, order_amount }) => {
  try {
    const res = await apiClient.post('/api/discount/validate', {
      discount_code,
      user_id,
      product_id,
      variant_id,
      order_amount,
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể kiểm tra mã giảm giá');
  }
};

// ✅ Áp dụng mã giảm giá vào giỏ hàng (thực tế tính toán + lưu vào cart)
export const applyDiscountToCart = async (discount_code) => {
  try {
    const res = await apiClient.post('/api/cart/apply', { discount_code });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể áp dụng mã giảm giá vào giỏ hàng');
  }
};

// ✅ Hủy mã giảm giá trong giỏ hàng
export const removeDiscountCode = async () => {
  try {
    const res = await apiClient.delete('/api/cart/apply');
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể hủy mã giảm giá');
  }
};

// ✅ Lấy danh sách mã giảm giá (cho admin)
export const getAllDiscounts = async () => {
  try {
    const res = await apiClient.get('/api/discount');
    return res.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách mã giảm giá');
  }
};

// ✅ Xoá mã giảm giá (admin)
export const deleteDiscount = async (id) => {
  try {
    const res = await apiClient.delete(`/api/discount/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể xoá mã giảm giá');
  }
};

// ✅ Lấy chi tiết mã giảm giá
export const getDiscountById = async (id) => {
  try {
    const res = await apiClient.get(`/api/discount/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể lấy chi tiết mã giảm giá');
  }
};

// ✅ Tạo mã giảm giá
export const createDiscount = async (data) => {
  const res = await apiClient.post('/api/discount', data);
  return res.data;
};

// ✅ Cập nhật mã giảm giá
export const updateDiscount = async (id, data) => {
  const res = await apiClient.put(`/api/discount/${id}`, data);
  return res.data;
};

// ✅ Lấy danh sách mã giảm giá khả dụng theo user (cho trang /cart)
// ✅ Lấy danh sách mã giảm giá khả dụng cho user
export const getAvailableDiscounts = async (user_id) => {
  const res = await apiClient.get(`/api/discount/available?user_id=${user_id}`);
  return res.data;
};