import apiClient from '../config/axios.config';

/**
 * Fetch all categories
 * @returns {Promise<Object>} An object containing data array with all categories
 */
const getCategory = async () => {
  try {
    const res = await apiClient.get('/api/category');
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh mục');
  }
};

/**
 * Fetch a category by ID
 * @param {number} id - The category ID
 * @returns {Promise<Object>} An object containing the category data
 */
const getCategoryById = async (id) => {
  try {
    const res = await apiClient.get(`/api/category/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh mục');
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - The category data (name, description)
 * @returns {Promise<Object>} An object containing the created category data
 */
const createCategory = async (categoryData) => {
  try {
    const res = await apiClient.post('/api/category', categoryData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tạo danh mục');
  }
};

/**
 * Update an existing category
 * @param {number} id - The category ID to update
 * @param {Object} categoryData - The updated category data (name, description)
 * @returns {Promise<Object>} An object containing the updated category data
 */
const updateCategory = async (id, categoryData) => {
  try {
    const res = await apiClient.put(`/api/category/${id}`, categoryData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật danh mục');
  }
};

/**
 * Delete a category by ID
 * @param {number} id - The category ID to delete
 * @returns {Promise<Object>} A success message
 */
const deleteCategory = async (id) => {
  try {
    const res = await apiClient.delete(`/api/category/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể xóa danh mục');
  }
};

export { getCategory, getCategoryById, createCategory, updateCategory, deleteCategory };