import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Input, Select, Space, Spin } from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getProduct } from '../../../service/product';
import { formatVND } from '../../../utils/format';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;
const ProductManager = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const { data: products, isLoading } = useQuery({
    queryKey: ['product'],
    queryFn: getProduct,
  });
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.data.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter
        ? product.category_id === categoryFilter
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const columns = [
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Giá gốc',
      dataIndex: 'original_price',
      key: 'original_price',
      render: (price) => formatVND(price),
    },
    {
      title: 'Giá cuối',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (price) => formatVND(price),
    },
    { title: 'Tồn kho', dataIndex: 'stock_quantity', key: 'stock_quantity' },
    {
      title: 'Biến thể',
      dataIndex: 'variants',
      key: 'variants',
      render: (variants) =>
        variants.length > 0 ? (
          <ul>
            {variants.map((v) => (
              <li key={v.id}>
                {v.sku} (
                {v.attributes
                  .map((a) => `${a.attribute_name}: ${a.value}`)
                  .join(', ')}
                )
              </li>
            ))}
          </ul>
        ) : (
          'Không có'
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => navigate(`edit/${record.id}`)}
            icon={<EditOutlined />}
            type='primary'
          >
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} type='danger'>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className='p-6 bg-white rounded-xl shadow-md'>
      <div className='flex justify-between mb-4'>
        <div className='flex space-x-2'>
          <Search
            placeholder='Tìm kiếm sản phẩm'
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-64'
          />
          <Select
            placeholder='Chọn danh mục'
            allowClear
            onChange={(value) => setCategoryFilter(value)}
            className='w-48'
          >
            <Option value={1}>Danh mục 1</Option>
            <Option value={2}>Danh mục 2</Option>
          </Select>
        </div>
        <div className='space-x-2'>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => navigate('create')}
          >
            Add Product
          </Button>
          <Button icon={<UploadOutlined />}>Import</Button>
        </div>
      </div>
      {isLoading ? (
        <Spin size='large' className='flex justify-center' />
      ) : (
        <Table dataSource={filteredProducts} columns={columns} rowKey='id' />
      )}
    </div>
  );
};

export default ProductManager;