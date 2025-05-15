import apiClient from "../config/axios.config"
import { getAuth } from "firebase/auth";

const getProduct = async (userId = null) => {
  try {
    const res = await apiClient.get("/api/product", {
      params: userId ? { userId } : {},
    })
    return res.data
  } catch (error) {
    throw new Error(error.message || "Unable to load products")
  }
}

const getProductApplyCP = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      categoryId = "",
      userId,
      discount,
      sortBy = "newest",
    } = options

    console.log("📦 [API CALL] getProductApplyCP - Params:", {
      page,
      limit,
      search,
      categoryId,
      userId,
      discount,
      sortBy,
    })

    if (!userId) {
      const res = await apiClient.get("/api/product", {
        params: {
          page,
          limit,
          search,
          categoryId,
          ...(discount !== undefined ? { discount } : {}),
          sortBy,
        },
        headers: { Authorization: undefined },
      });
      return res.data;
    }

    const res = await apiClient.get("/api/product", {
      params: {
        page,
        limit,
        search,
        categoryId,
        userId,
        ...(discount !== undefined ? { discount } : {}),
        sortBy,
      },
    })

    return res.data
  } catch (error) {
    console.error("❌ getProductApplyCP error:", error)
    throw new Error(error.message || "Unable to load products")
  }
}

const getProductById = async (productId, userId = null) => {
  try {
    const res = await apiClient.get(`/api/product/${productId}`, {
      params: userId ? { userId } : {},
    })
    return res.data
  } catch (error) {
    throw new Error(error.message || "Unable to load product")
  }
}

const getProductApplyCPById = async (productId, userId) => {
  try {
    console.log("📦 [API CALL] getProductApplyCPById:", { productId, userId })

    const res = await apiClient.get(`/api/product/${productId}`, {
      params: { userId },
    })

    return res.data
  } catch (error) {
    console.error("❌ getProductApplyCPById error:", error)
    throw new Error(error.message || "Unable to load product details")
  }
}

const createProduct = async (product) => {
  try {
    const res = await apiClient.post("/api/product", product)
    return res.data
  } catch (error) {
    throw new Error(error)
  }
}

const editProduct = async (productId, product) => {
  try {
    const res = await apiClient.patch(`/api/product/${productId}`, product)
    return res.data
  } catch (error) {
    throw new Error(error)
  }
}

const deleteProduct = async (productId) => {
  try {
    const res = await apiClient.delete(`/api/product/${productId}`)
    return res.data
  } catch (error) {
    throw new Error(error)
  }
}

// Thêm các hàm service cho import/export Excel
const downloadProductTemplate = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Người dùng chưa đăng nhập");

    const token = await user.getIdToken();

    const res = await fetch(`${apiClient.defaults.baseURL}/api/product/excel/template`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Tải file mẫu thất bại");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "product_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("❌ downloadProductTemplate error:", error);
    throw new Error(error.message || "Không thể tải file mẫu");
  }
};


const importProductsFromExcel = async (formData) => {
  try {
    const res = await apiClient.post("/api/product/excel/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ importProductsFromExcel error:", error);
    throw new Error(error.response?.data?.message || "Không thể import sản phẩm");
  }
};


const exportProductsToExcel = async (filters = {}) => {
  try {
    const { categoryId, search, sortBy } = filters;
    const queryParams = new URLSearchParams();

    if (categoryId) queryParams.append("categoryId", categoryId);
    if (search) queryParams.append("search", search);
    if (sortBy) queryParams.append("sortBy", sortBy); // ✅ thêm sortBy cho export

    const auth = getAuth();
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const res = await fetch(
      `${apiClient.defaults.baseURL}/api/product/excel/export?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Xuất file thất bại");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `products_export_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("❌ exportProductsToExcel error:", error);
    throw new Error(error.message || "Không thể export sản phẩm");
  }
};


export {
  getProduct,
  getProductById,
  createProduct,
  editProduct,
  deleteProduct,
  getProductApplyCP,
  getProductApplyCPById,
  downloadProductTemplate,
  importProductsFromExcel,
  exportProductsToExcel,
}