import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Menu, Spin, Typography, Empty, Card } from 'antd';
import { AppstoreOutlined, LoadingOutlined } from '@ant-design/icons';
import { getCategory } from '@/service/category';
import { useNavigate, useLocation } from 'react-router-dom';

const { Text } = Typography;

const CategoryFilter = ({ onCategorySelect }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState(null);

  // Get category ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('categoryId');
    if (categoryId) {
      setSelectedKey(categoryId);
    }
  }, [location.search]);

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleCategoryClick = (categoryId) => {
    // If clicking the already selected category, clear the selection
    if (categoryId === selectedKey) {
      setSelectedKey(null);
      
      // Update URL by removing categoryId
      const params = new URLSearchParams(location.search);
      params.delete('categoryId');
      navigate({ search: params.toString() });
      
      if (onCategorySelect) {
        onCategorySelect(null);
      }
    } else {
      setSelectedKey(categoryId);
      
      // Update URL with categoryId
      const params = new URLSearchParams(location.search);
      params.set('categoryId', categoryId);
      navigate({ search: params.toString() });
      
      if (onCategorySelect) {
        onCategorySelect(categoryId);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-4 shadow-sm">
        <div className="flex justify-center py-4">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 shadow-sm">
        <Empty 
          description="Failed to load product categories" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </Card>
    );
  }

  const categories = categoriesData?.data || [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card 
      title={
        <div className="flex items-center">
          <AppstoreOutlined className="mr-2" />
          <span>Product Categories</span>
        </div>
      } 
      className="mb-4 shadow-sm"
    >
      <Menu
        mode="vertical"
        selectedKeys={selectedKey ? [selectedKey.toString()] : []}
        className="border-none"
        items={[
          {
            key: 'all',
            label: 'All Products',
            onClick: () => {
              handleCategoryClick(null);
            },
            className: !selectedKey ? 'bg-blue-50 font-medium' : ''
          },
          ...categories.map(category => ({
            key: category.id.toString(),
            label: category.name,
            onClick: () => {
              handleCategoryClick(category.id.toString());
            }
          }))
        ]}
      />
    </Card>
  );
};

export default CategoryFilter;