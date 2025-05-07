import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Spin, Empty, Select, Input, Pagination, Tag, Typography, Breadcrumb, Space, Divider } from 'antd';
import { HomeOutlined, AppstoreOutlined, FilterOutlined } from '@ant-design/icons';
import ProductCard from './ProductCard';
import { getCategory } from '@/service/category';
import { getProductApplyCP } from '@/service/product';
import CategoryFilter from './CategoryFilter';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

const ProductsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    categoryId: '',
    sortBy: 'newest', // ✅ Giá trị mặc định là 'newest'
    discount: undefined,
  });

  const [searchInput, setSearchInput] = useState(''); // 💡 Dùng riêng để tránh trễ

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      page: parseInt(params.get('page')) || 1,
      limit: parseInt(params.get('limit')) || 12,
      search: params.get('search') || '',
      categoryId: params.get('categoryId') || '',
      sortBy: params.get('sortBy') || 'newest', // ✅ Lấy sortBy từ URL hoặc dùng mặc định
      discount: params.get('discount') === 'true' ? true : params.get('discount') === 'false' ? false : undefined,
    };
    setFilters(newFilters);
    setSearchInput(newFilters.search); // 💡 Đồng bộ input hiển thị
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy); // ✅ Thêm sortBy vào URL
    if (filters.page !== 1) params.set('page', filters.page);
    if (filters.limit !== 12) params.set('limit', filters.limit);
    if (filters.discount !== undefined) params.set('discount', filters.discount);

    navigate({ search: params.toString() }, { replace: true });
  }, [filters, navigate]);

  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProductApplyCP(filters),
    placeholderData: (prev) => prev,
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    staleTime: 3600000,
    gcTime: 86400000,
  });

  const handleSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      search: value.trim(),
      page: 1,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId || '',
      page: 1,
    }));
  };

  // ✅ Xử lý sự kiện khi người dùng thay đổi cách sắp xếp
  const handleSortChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
      page: 1,
    }));
  };

  // ✅ Xử lý sự kiện khi người dùng thay đổi filter giảm giá
  const handleDiscountFilterChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      discount: value,
      page: 1,
    }));
  };

  const handlePageChange = (page, pageSize) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  const currentCategory = useMemo(() => {
    return categoriesData?.data?.find((cat) => cat.id.toString() === filters.categoryId?.toString());
  }, [filters.categoryId, categoriesData]);

  // ✅ Hàm lấy nhãn hiển thị cho các option sắp xếp
  const getSortLabel = (sortValue) => {
    const sortOptions = [
      { value: 'newest', label: 'Newest First' },
      { value: 'price_asc', label: 'Price: Low to High' },
      { value: 'price_desc', label: 'Price: High to Low' },
    ];
    return sortOptions.find((option) => option.value === sortValue)?.label || 'Sắp xếp';
  };

  // ✅ Tính toán số lượng filter đang áp dụng
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryId) count++;
    if (filters.discount !== undefined) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  }, [filters]);

  return (
    <div className='bg-bg-secondary min-h-screen py-8'>
      <div className='container mx-auto px-4'>
        {/* Breadcrumb */}
        <Breadcrumb className='mb-6'>
          <Breadcrumb.Item href='/'>
            <HomeOutlined /> Home
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <AppstoreOutlined /> Products
          </Breadcrumb.Item>
          {currentCategory && <Breadcrumb.Item>{currentCategory.name}</Breadcrumb.Item>}
        </Breadcrumb>

        <Row gutter={[24, 24]}>
          {/* Sidebar */}
          <Col xs={24} md={6} lg={5}>
            <div className='bg-white p-4 rounded-lg shadow-sm mb-4'>
              <div className='font-medium mb-3 flex items-center'>
                <FilterOutlined className='mr-2' />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Tag color='blue' className='ml-2'>
                    {activeFilterCount}
                  </Tag>
                )}
              </div>

              {/* ✅ Thêm dropdown sắp xếp */}
              <div className='mb-4'>
                <div className='font-medium mb-2'>Sort By</div>
                <Select
                  style={{ width: '100%' }}
                  value={filters.sortBy}
                  onChange={handleSortChange}
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                  ]}
                />
              </div>

              <Divider className='my-3' />

              {/* ✅ Thêm filter giảm giá */}
              <div className='mb-4'>
                <div className='font-medium mb-2'>Promotion</div>
                <Select
                  style={{ width: '100%' }}
                  value={filters.discount}
                  onChange={handleDiscountFilterChange}
                  options={[
                    { value: undefined, label: 'All products' },
                    { value: true, label: 'On Sale' },
                    { value: false, label: 'Original Price' },
                  ]}
                />
              </div>
            </div>

            <CategoryFilter onCategorySelect={handleCategoryChange} />
          </Col>

          {/* Main */}
          <Col xs={24} md={18} lg={19}>
            <div className='bg-white p-6 rounded-lg shadow-sm mb-6'>
              <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                <div>
                  <Title level={4} className='m-0 mb-2 md:mb-0'>
                    {currentCategory ? currentCategory.name : 'All Products'}
                  </Title>
                  {!isLoading && productsData && (
                    <Text type='secondary'>{productsData.pagination?.total || 0} products</Text>
                  )}
                </div>
                <Input.Search
                  placeholder='Search for products...'
                  allowClear
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onSearch={handleSearch}
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  style={{ width: '100%', maxWidth: '350px' }}
                />
              </div>

              {/* ✅ Hiển thị filter đang áp dụng */}
              {activeFilterCount > 0 && (
                <div className='mb-4 flex flex-wrap gap-2'>
                  {filters.search && (
                    <Tag closable onClose={() => handleSearch('')}>
                      Search: {filters.search}
                    </Tag>
                  )}

                  {filters.sortBy !== 'newest' && (
                    <Tag color='blue' closable onClose={() => handleSortChange('newest')}>
                      {getSortLabel(filters.sortBy)}
                    </Tag>
                  )}

                  {filters.discount !== undefined && (
                    <Tag color='orange' closable onClose={() => handleDiscountFilterChange(undefined)}>
                      {filters.discount ? 'On Sale' : 'Original Price'}
                    </Tag>
                  )}
                </div>
              )}

              {isLoading || isCategoriesLoading ? (
                <div className='flex justify-center items-center h-64'>
                  <Spin size='large' />
                </div>
              ) : isError ? (
                <div className='flex justify-center items-center h-64'>
                  <Empty description='An error occurred while loading products' />
                </div>
              ) : productsData?.data?.length === 0 ? (
                <Empty
                  description={
                    <span>
                      No products found
                      {filters.search ? ` matching "${filters.search}"` : ''}
                      {currentCategory ? ` in category "${currentCategory.name}"` : ''}
                    </span>
                  }
                />
              ) : (
                <>
                  <Row gutter={[16, 24]}>
                    {productsData.data.map((product) => (
                      <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                        <ProductCard product={product} onViewDetail={(id) => navigate(`/product/${id}`)} />
                      </Col>
                    ))}
                  </Row>

                  <div className='mt-8 flex justify-center'>
                    <Pagination
                      current={productsData.pagination?.page || 1}
                      pageSize={productsData.pagination?.limit || 12}
                      total={productsData.pagination?.total || 0}
                      onChange={handlePageChange}
                      showSizeChanger
                      pageSizeOptions={['12', '24', '36', '48']}
                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} products`}
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
