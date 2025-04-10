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
      message.success('Đã thêm danh mục mới');
      queryClient.invalidateQueries(['categories']);
      setModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Lỗi khi thêm danh mục: ${error.message}`);
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      message.success('Đã cập nhật danh mục');
      queryClient.invalidateQueries(['categories']);
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Lỗi khi cập nhật danh mục: ${error.message}`);
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      message.success('Đã xóa danh mục');
      queryClient.invalidateQueries(['categories']);
    },
    onError: (error) => {
      message.error(`Lỗi khi xóa danh mục: ${error.message}`);
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
        message.success('Tải ảnh lên thành công!');
      }
    } catch (error) {
      message.error('Tải ảnh lên thất bại');
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
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip title={description}>
          <span>{description || 'Không có mô tả'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Hình ảnh',
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
      title: 'Số lượng sản phẩm',
      dataIndex: 'product_count',
      key: 'product_count',
      width: 150,
      render: (_, record) => <span>{record.product_count || 0}</span>,
    },
    {
      title: 'Thao tác',
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
            title="Bạn có chắc muốn xóa danh mục này?"
            description="Hành động này không thể hoàn tác. Các sản phẩm thuộc danh mục này sẽ không bị xóa."
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Xóa"
            cancelText="Hủy"
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
            <Title level={4} type="danger">Không thể tải danh mục</Title>
            <Text type="secondary">Đã xảy ra lỗi khi tải danh mục: {error.message}</Text>
            <div className="mt-4">
              <Button type="primary" onClick={() => refetch()} icon={<ReloadOutlined />}>
                Thử lại
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
            <Title level={4} style={{ margin: 0 }}>Quản lý danh mục</Title>
          </div>
        }
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm danh mục"
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
              Thêm danh mục
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
              showTotal: (total) => `Tổng ${total} danh mục`,
            }}
            locale={{
              emptyText: 'Không có danh mục nào',
            }}
          />
        )}
      </Card>

      <Modal
        title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
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
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea 
              placeholder="Nhập mô tả cho danh mục" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Form.Item label="Ảnh danh mục">
  <Form.Item name="image_url" noStyle>
    <ImageUploader />
  </Form.Item>
</Form.Item>


          <Form.Item label="Hoặc tải ảnh lên">
            <Upload
              name="image"
              listType="picture"
              showUploadList={false}
              customRequest={handleUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploadMutation.isLoading}>
                Tải lên ảnh
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;