import { getProduct } from '@/service/product';
import { getAllUsers } from '@/service/user';
import { getProductById } from '@/service/product'; // hoặc hàm phù hợp để lấy biến thể

export const getProductOptions = async () => {
  const res = await getProduct();
  return (res.data || []).map((p) => ({
    label: p.name,
    value: p.id,
  }));
};

export const getUserOptions = async () => {
  const res = await getAllUsers();
  return (res.data || []).map((u) => ({
    label: u.full_name || u.email || `ID ${u.id}`,
    value: u.id,
  }));
};

// ✅ Thêm hàm này nếu bạn muốn lấy danh sách biến thể (variant)
export const getVariantOptions = async () => {
  const res = await getProduct(); // giả sử mỗi product có `variants` trong res.data
  const variants = res.data.flatMap((p) =>
    (p.variants || []).map((v) => ({
      label: `${p.name} - ${v.name || v.sku || 'Biến thể'}`,
      value: v.id,
    }))
  );
  return variants;
};