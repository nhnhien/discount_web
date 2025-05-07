import React, { useState } from 'react';
import {
  Table,
  Button,
  Card,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
  Spin,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategory, createCategory, updateCategory, deleteCategory } from '@/service/category';
import { useUploadMutation } from '@/hooks/useUploadMutation';
import ImageUploader from '../product/ImageUploader';

const { Title, Text } = Typography;

const CategoryManager = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const uploadMutation = useUploadMutation();

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      message.success('New category added');
      queryClient.invalidateQueries(['categories']);
      setModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Error adding category: ${error.message}`);
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      message.success('Category updated');
      queryClient.invalidateQueries(['categories']);
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Error updating category: ${error.message}`);
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      message.success('Category deleted');
      queryClient.invalidateQueries(['categories']);
    },
    onError: (error) => {
      message.error(`Error deleting category: ${error.message}`);
    },
  });

  // Open modal to add new category
  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open modal to edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCategory) {
        updateMutation.mutate({ id: editingCategory.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  // Handle delete category
  const handleDeleteCategory = (categoryId) => {
    deleteMutation.mutate(categoryId);
  };

  const handleUpload = async (info) => {
    const { file } = info;
    try {
      const result = await uploadMutation.mutateAsync(file);
      if (result && result.url) {
        form.setFieldsValue({ image_url: result.url });
        message.success('Image uploaded successfully!');
      }
    } catch (error) {
      message.error('Failed to upload image');
    }
  };

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!categoriesData?.data) return [];
    
    return categoriesData.data.filter(category => 
      category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [categoriesData, searchText]);

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip title={description}>
          <span>{description || 'No description'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 120,
      render: (image_url) => 
        image_url ? (
          <img 
            src={image_url} 
            alt="Category" 
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }} 
          />
        ) : (
          <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">No image</Text>
          </div>
        ),
    },
    {
      title: 'Number of products',
      dataIndex: 'product_count',
      key: 'product_count',
      width: 150,
      render: (_, record) => <span>{record.product_count || 0}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEditCategory(record)}
            size="middle"
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            description="This action cannot be undone. Products in this category will not be deleted."
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Delete"
            cancelText="Cancel"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="middle"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-5">
            <Title level={4} type="danger">Unable to load categories</Title>
            <Text type="secondary">An error occurred while loading categories: {error.message}</Text>
            <div className="mt-4">
              <Button type="primary" onClick={() => refetch()} icon={<ReloadOutlined />}>
                Try again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center">
            <Title level={4} style={{ margin: 0 }}>Category management</Title>
          </div>
        }
        extra={
          <Space>
            <Input
              placeholder="Search categories"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddCategory}
            >
              Add category
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
            />
          </Space>
        }
        className="shadow-sm"
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredCategories} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} categories`,
            }}
            locale={{
              emptyText: 'No categories found',
            }}
          />
        )}
      </Card>

      <Modal
        title={editingCategory ? "Update Category" : "Add New Category"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Category name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              placeholder="Enter category description" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Form.Item label="Category Image">
            <Form.Item name="image_url" noStyle>
              <ImageUploader />
            </Form.Item>
          </Form.Item>

          <Form.Item label="Or upload image">
            <Upload
              name="image"
              listType="picture"
              showUploadList={false}
              customRequest={handleUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploadMutation.isLoading}>
                Upload Image
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;