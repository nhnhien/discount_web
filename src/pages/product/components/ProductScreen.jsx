import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Spin, Empty, Select, Input, Pagination, Space, Tag, Typography } from 'antd';
import { FilterOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ProductCard from './ProductCard';
import { getCategory } from '@/service/category';
import { getProductApplyCP } from '@/service/product';

const { Text } = Typography;

const ProductsScreen = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    categoryId: '',
    sortBy: 'newest',
  });

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProductApplyCP(filters),
    placeholderData: (previousData) => previousData,
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Handler for pagination change
  const handlePageChange = (page, pageSize) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  // Handler for search
  const handleSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1, // Reset to first page when searching
    }));
  };

  // Handler for category filter
  const handleCategoryChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: value,
      page: 1,
    }));
  };

  // Handler for sorting
  const handleSortChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
      page: 1,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      categoryId: '',
      sortBy: 'newest',
    });
  };

  // Applied filters display
  const appliedFilters = useMemo(() => {
    const applied = [];
    if (filters.search) applied.push({ key: 'search', label: `Tìm: ${filters.search}` });
    if (filters.categoryId) {
      const category = categoriesData?.data.find((cat) => cat.id === filters.categoryId);
      applied.push({ key: 'category', label: `Danh mục: ${category?.name || filters.categoryId}` });
    }
    if (filters.sortBy !== 'newest') applied.push({ key: 'sort', label: `Sắp xếp: ${getSortLabel(filters.sortBy)}` });
    return applied;
  }, [filters, categoriesData]);

  // Remove specific filter
  const removeFilter = (filterKey) => {
    switch (filterKey) {
      case 'search':
        setFilters((prev) => ({ ...prev, search: '', page: 1 }));
        break;
      case 'category':
        setFilters((prev) => ({ ...prev, categoryId: '', page: 1 }));
        break;
      case 'sort':
        setFilters((prev) => ({ ...prev, sortBy: 'newest', page: 1 }));
        break;
    }
  };

  // Helper to get sort label
  const getSortLabel = (sortValue) => {
    switch (sortValue) {
      case 'price_asc':
        return 'Giá: Thấp đến cao';
      case 'price_desc':
        return 'Giá: Cao đến thấp';
      default:
        return 'Mới nhất';
    }
  };

  // Placeholder handlers
  const handleAddToCart = (product) => console.log('Add to cart:', product);
  const handleToggleWishlist = (product) => console.log('Toggle wishlist:', product);
  const handleViewDetail = (productId) => console.log('View product details:', productId);

  // Determine loading and error states
  const isLoading = isProductsLoading || isCategoriesLoading;
  const isError = isProductsError || isCategoriesError;

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Filters Section */}
      <div className='mb-6 flex flex-col space-y-4'>
        <div className='flex justify-between items-center'>
          <Space size='middle' wrap>
            {/* Search Input */}
            <Input.Search
              placeholder='Tìm kiếm sản phẩm...'
              onSearch={handleSearch}
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              style={{ width: 250 }}
            />

            {/* Category Filter */}
            <Select
              placeholder='Danh mục'
              style={{ width: 200 }}
              value={filters.categoryId || undefined}
              onChange={handleCategoryChange}
              loading={isCategoriesLoading}
              allowClear
            >
              {categoriesData?.data.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>

            {/* Sort By */}
            <Select
              placeholder='Sắp xếp theo'
              style={{ width: 200 }}
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <Select.Option value='newest'>Mới nhất</Select.Option>
              <Select.Option value='price_asc'>Giá: Thấp đến cao</Select.Option>
              <Select.Option value='price_desc'>Giá: Cao đến thấp</Select.Option>
            </Select>
          </Space>
        </div>

        {/* Applied Filters */}
        {appliedFilters.length > 0 && (
          <div className='flex items-center space-x-2'>
            <Text type='secondary'>Bộ lọc được áp dụng:</Text>
            <Space size='small' wrap>
              {appliedFilters.map((filter) => (
                <Tag key={filter.key} closable onClose={() => removeFilter(filter.key)}>
                  {filter.label}
                </Tag>
              ))}
              {appliedFilters.length > 1 && (
                <Tag color='default' onClick={clearAllFilters} style={{ cursor: 'pointer' }}>
                  <CloseCircleOutlined /> Xóa tất cả
                </Tag>
              )}
            </Space>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Spin size='large' />
        </div>
      ) : isError ? (
        <div className='flex justify-center items-center h-64'>
          <Empty description='Đã có lỗi xảy ra khi tải sản phẩm' />
        </div>
      ) : productsData?.data?.length === 0 ? (
        <Empty description='Không tìm thấy sản phẩm' />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {productsData?.data?.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onViewDetail={handleViewDetail}
                />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div className='mt-6 flex justify-center'>
            <Pagination
              current={productsData?.pagination?.page || 1}
              pageSize={productsData?.pagination?.limit || 12}
              total={productsData?.pagination?.total || 0}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsScreen;
