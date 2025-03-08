import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Select, Space, Spin, Image, message, Modal } from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { deleteProduct, getProduct } from '../../../service/product';

import { formatVND } from '../../../format';
import { useNavigate } from 'react-router-dom';
import { getCategory } from '../../../service/category';
import Loading from '../../../components/loading/Loading';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;


const ProductManager = () => {
  const queryClient = useQueryClient();
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['category'],
    queryFn: getCategory,
  });
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const { data: products, isLoading } = useQuery({
    queryKey: ['product'],
    queryFn: getProduct,
  });


  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      message.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries(['product']);
    },
    onError: () => {
      message.error('Lỗi khi xóa sản phẩm!');
    },
  });

  const showDeleteConfirm = (productId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác!',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        deleteMutation.mutate(productId);
      },
    });
  };


  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.data?.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? product.category_id === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (image) => (
        <Image
          width={60}
          height={60}
          src={image || 'https://via.placeholder.com/60'}
          alt='Product Image'
          className='rounded-lg shadow-md'
        />
      ),
    },
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
                {v.sku} ({v.attributes.map((a) => `${a.attribute_name}: ${a.value}`).join(', ')})
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
          <Button onClick={() => navigate(`edit/${record.id}`)} icon={<EditOutlined />} type='primary'>
            Edit
          </Button>
          <Button

            icon={<DeleteOutlined />}
            danger
            type='default'
            loading={deleteMutation.isLoading}
            onClick={() => showDeleteConfirm(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className='p-6 bg-white rounded-xl shadow-lg'>

      <div className='flex justify-between mb-4'>
        <div className='flex space-x-4'>
          <Search placeholder='Tìm kiếm sản phẩm' onChange={(e) => setSearchTerm(e.target.value)} className='w-64' />
          <Select
            placeholder='Chọn danh mục'
            allowClear
            onChange={(value) => setCategoryFilter(value)}
            className='w-48'
          >

            {categories &&
              categories?.data?.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
          </Select>
        </div>
        <div className='space-x-2'>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => navigate('create')}>
            Add Product
          </Button>
          <Button icon={<UploadOutlined />}>Import</Button>
        </div>
      </div>
      {isLoading ? (
        <div className='flex justify-center py-10'>

          <Spin size='large' />
        </div>
      ) : (
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey='id'
          pagination={{ pageSize: 5 }}
          className='shadow-sm rounded-lg'
        />
      )}
    </div>
  );
};


export default ProductManager;
