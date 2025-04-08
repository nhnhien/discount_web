import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Spin, Empty, Select, Input, Pagination, Space, Tag, Typography, Breadcrumb } from 'antd';
import { FilterOutlined, CloseCircleOutlined, HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import ProductCard from './ProductCard';
import { getCategory } from '@/service/category';
import { getProductApplyCP } from '@/service/product';
import CategoryFilter from './CategoryFilter';
import { useNavigate, useLocation } from 'react-router-dom';

const { Text, Title } = Typography;

const ProductsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    categoryId: '',
    sortBy: 'newest',
  });

  // Parse URL parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('categoryId');
    const search = params.get('search');
    const sortBy = params.get('sortBy');
    const page = params.get('page');
    const limit = params.get('limit');

    const newFilters = { ...filters };
    if (categoryId) newFilters.categoryId = categoryId;
    if (search) newFilters.search = search;
    if (sortBy) newFilters.sortBy = sortBy;
    if (page) newFilters.page = parseInt(page);
    if (limit) newFilters.limit = parseInt(limit);

    setFilters(newFilters);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
    if (filters.page !== 1) params.set('page', filters.page);
    if (filters.limit !== 12) params.set('limit', filters.limit);

    navigate({ search: params.toString() }, { replace: true });
  }, [filters, navigate]);

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
  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId || '',
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

  // Get current category
  const currentCategory = useMemo(() => {
    if (!filters.categoryId || !categoriesData?.data) return null;
    return categoriesData.data.find(cat => cat.id.toString() === filters.categoryId.toString());
  }, [filters.categoryId, categoriesData]);

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
    <div className='bg-gray-50 min-h-screen py-8'>
      <div className='container mx-auto px-4'>
        {/* Breadcrumb */}
        <Breadcrumb className='mb-6'>
          <Breadcrumb.Item href='/'>
            <HomeOutlined /> Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <AppstoreOutlined /> Sản phẩm
          </Breadcrumb.Item>
          {currentCategory && (
            <Breadcrumb.Item>{currentCategory.name}</Breadcrumb.Item>
          )}
        </Breadcrumb>

        <Row gutter={[24, 24]}>
          {/* Left Sidebar */}
          <Col xs={24} md={6} lg={5}>
            <CategoryFilter onCategorySelect={handleCategoryChange} />
            
            {/* Sort By Filter */}
            <div className='bg-white p-4 rounded-lg shadow-sm mb-4'>
              <div className='font-medium mb-3'>Sắp xếp theo</div>
              <Select
                style={{ width: '100%' }}
                value={filters.sortBy}
                onChange={handleSortChange}
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'price_asc', label: 'Giá: Thấp đến cao' },
                  { value: 'price_desc', label: 'Giá: Cao đến thấp' },
                ]}
              />
            </div>
          </Col>

          {/* Main Content */}
          <Col xs={24} md={18} lg={19}>
            <div className='bg-white p-6 rounded-lg shadow-sm mb-6'>
              {/* Title and Search */}
              <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                <Title level={4} className='m-0 mb-4 md:mb-0'>
                  {currentCategory ? currentCategory.name : 'Tất cả sản phẩm'}
                </Title>
                <Input.Search
                  placeholder='Tìm kiếm sản phẩm...'
                  onSearch={handleSearch}
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  style={{ width: '100%', maxWidth: '350px' }}
                  allowClear
                />
              </div>

              {/* Search Results Summary */}
              {filters.search && (
                <div className='mb-4'>
                  <Tag closable onClose={() => setFilters(prev => ({ ...prev, search: '' }))}>
                    Tìm kiếm: {filters.search}
                  </Tag>
                </div>
              )}

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
                <Empty 
                  description={
                    <span>
                      Không tìm thấy sản phẩm
                      {filters.search ? ` phù hợp với "${filters.search}"` : ''}
                      {currentCategory ? ` trong danh mục "${currentCategory.name}"` : ''}
                    </span>
                  } 
                />
              ) : (
                <>
                  <Row gutter={[16, 24]}>
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
                  <div className='mt-8 flex justify-center'>
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
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductsScreen;