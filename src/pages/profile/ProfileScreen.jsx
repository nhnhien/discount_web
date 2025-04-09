import { useEffect, useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Form, 
  message, 
  Typography, 
  List, 
  Modal, 
  Space, 
  Tabs, 
  Tag, 
  Divider, 
  Skeleton,
  Avatar,
  Badge,
  Tooltip,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/service/user';
import { addressService } from '@/service/address';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfileScreen = () => {
  const user = useSelector((state) => state.auth.currentUser);
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [editingAddress, setEditingAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: addressData, isLoading, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  });

  const updatePhoneMutation = useMutation({
    mutationFn: ({ id, phone }) => updateProfile(id, { phone }),
    onSuccess: () => {
      message.success({
        content: 'Số điện thoại đã được cập nhật thành công',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err) => {
      message.error({
        content: err.message || 'Lỗi khi cập nhật số điện thoại',
        icon: <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    },
  });

  const addressMutation = useMutation({
    mutationFn: (payload) => {
      return editingAddress
        ? addressService.updateAddress(editingAddress.id, payload)
        : addressService.createAddress(payload);
    },
    onSuccess: () => {
      message.success({
        content: editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      addressForm.resetFields();
      setEditingAddress(null);
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => {
      message.error({
        content: err.message || 'Lỗi khi lưu địa chỉ',
        icon: <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    },
  });

  const handlePhoneSubmit = (values) => {
    updatePhoneMutation.mutate({ id: user.id, phone: values.phone });
  };

  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    setIsModalOpen(true);
    if (address) {
      addressForm.setFieldsValue(address);
    } else {
      addressForm.resetFields();
    }
  };

  const handleAddressSubmit = () => {
    addressForm.validateFields().then((values) => {
      addressMutation.mutate(values);
    });
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressService.deleteAddress(id);
      message.success({
        content: 'Địa chỉ đã được xóa thành công',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      setConfirmDelete(null);
      refetch();
    } catch (error) {
      message.error({
        content: 'Không thể xóa địa chỉ',
        icon: <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  };

  const showDeleteConfirm = (addressId) => {
    setConfirmDelete(addressId);
  };

  // Hiển thị tên viết tắt từ email hoặc tên người dùng
  const getAvatarText = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      {/* Header với avatar */}
      <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
        <Avatar 
          size={80} 
          icon={<UserOutlined />} 
          className="bg-blue-500 shadow-lg mb-4 md:mb-0 md:mr-6"
        >
          {getAvatarText()}
        </Avatar>
        <div className="text-center md:text-left">
          <Title level={2} className="m-0">
            {user?.name || user?.email?.split('@')[0] || 'Người dùng'}
          </Title>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            {user?.email && (
              <Tag icon={<MailOutlined />} color="blue">
                {user.email}
              </Tag>
            )}
            {user?.phone && (
              <Tag icon={<PhoneOutlined />} color="green">
                {user.phone}
              </Tag>
            )}
            <Tag icon={<HomeOutlined />} color="purple">
              {addressData?.data?.length || 0} địa chỉ
            </Tag>
          </div>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="profile-tabs">
        <TabPane 
          tab={
            <span className="px-1">
              <UserOutlined /> Thông tin cá nhân
            </span>
          } 
          key="1"
        >
          <Card 
            className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            bordered={false}
          >
            <Form 
              layout="vertical" 
              form={form}
              onFinish={handlePhoneSubmit} 
              initialValues={{ phone: user?.phone }}
              className="max-w-md"
            >
              <Form.Item 
                label={
                  <span className="flex items-center">
                    <MailOutlined className="mr-2" /> Email
                  </span>
                } 
                name="email"
              >
                <Input 
                  disabled 
                  value={user?.email || 'Không có'} 
                  placeholder="Chưa có email" 
                  className="disabled:bg-gray-50 disabled:text-gray-500"
                />
              </Form.Item>
              
              <Form.Item
                label={
                  <span className="flex items-center">
                    <PhoneOutlined className="mr-2" /> Số điện thoại
                  </span>
                }
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9+]{10,12}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
                tooltip="Số điện thoại sẽ được sử dụng để nhận thông báo"
              >
                <Input 
                  disabled={!user?.email} 
                  placeholder="Nhập số điện thoại" 
                  maxLength={12}
                />
              </Form.Item>
              
              {user?.email && (
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={updatePhoneMutation.isPending}
                    className="shadow-sm hover:shadow transition-shadow duration-300"
                  >
                    Cập nhật số điện thoại
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span className="px-1">
              <EnvironmentOutlined /> Địa chỉ giao hàng
            </span>
          } 
          key="2"
        >
          <Card 
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
            bordered={false}
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => openAddressModal()}
                className="shadow-sm hover:shadow transition-shadow duration-300"
              >
                Thêm địa chỉ
              </Button>
            }
          >
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} active avatar paragraph={{ rows: 2 }} />
                ))}
              </div>
            ) : addressData?.data?.length === 0 ? (
              <Empty 
                description="Bạn chưa có địa chỉ nào" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={addressData?.data || []}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    className="hover:bg-gray-50 rounded-lg transition-colors duration-200 p-2"
                    actions={[
                      <Tooltip title="Sửa địa chỉ" key="edit">
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          onClick={() => openAddressModal(item)}
                          className="text-blue-500 hover:text-blue-700"
                        />
                      </Tooltip>,
                      <Tooltip title="Xóa địa chỉ" key="delete">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />} 
                          onClick={() => showDeleteConfirm(item.id)}
                        />
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<HomeOutlined />} 
                          className="bg-purple-100 text-purple-700" 
                        />
                      }
                      title={
                        <div className="flex items-center">
                          <span className="font-medium">{item.full_name}</span>
                          <Tag color="blue" className="ml-2">
                            {item.phone_number}
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="text-gray-500">
                          <EnvironmentOutlined className="mr-1" /> 
                          {item.address}, {item.city}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal thêm/sửa địa chỉ */}
      <Modal
        title={
          <div className="flex items-center">
            {editingAddress ? (
              <>
                <EditOutlined className="mr-2 text-blue-500" /> Cập nhật địa chỉ
              </>
            ) : (
              <>
                <PlusOutlined className="mr-2 text-green-500" /> Thêm địa chỉ mới
              </>
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddressSubmit}
        confirmLoading={addressMutation.isPending}
        okText={editingAddress ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        centered
        className="address-modal"
        okButtonProps={{ 
          className: `${editingAddress ? 'bg-blue-500' : 'bg-green-500'} hover:opacity-90`
        }}
      >
        <Form 
          form={addressForm} 
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            label="Họ tên người nhận"
            name="full_name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên người nhận hàng" prefix={<UserOutlined className="site-form-item-icon" />} />
          </Form.Item>
          
          <Form.Item
            label="Số điện thoại"
            name="phone_number"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9+]{10,12}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại liên hệ" prefix={<PhoneOutlined className="site-form-item-icon" />} maxLength={12} />
          </Form.Item>
          
          <Form.Item
            label="Địa chỉ chi tiết"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            tooltip="Nhập số nhà, tên đường, phường/xã, quận/huyện"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Nghé" 
              showCount 
              maxLength={200} 
            />
          </Form.Item>
          
          <Form.Item
            label="Tỉnh / Thành phố"
            name="city"
            rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
          >
            <Input placeholder="Ví dụ: TP. Hồ Chí Minh" prefix={<EnvironmentOutlined className="site-form-item-icon" />} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        title={
          <div className="text-red-500 flex items-center">
            <DeleteOutlined className="mr-2" /> Xác nhận xóa địa chỉ
          </div>
        }
        open={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onOk={() => handleDeleteAddress(confirmDelete)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>Bạn có chắc chắn muốn xóa địa chỉ này không?</p>
        <p className="text-gray-500 text-sm">Hành động này không thể hoàn tác.</p>
      </Modal>

      <style jsx global>{`
        .profile-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1890ff;
          font-weight: 500;
        }
        
        .profile-tabs .ant-tabs-ink-bar {
          background: #1890ff;
          height: 3px;
          border-radius: 3px;
        }
        
        .profile-tabs .ant-tabs-tab:hover {
          color: #40a9ff;
        }
        
        .address-modal .ant-modal-content {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .address-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 24px;
        }
        
        .address-modal .ant-modal-footer {
          border-top: 1px solid #f0f0f0;
          padding: 16px 24px;
        }
      `}</style>
    </div>
  );
};

export default ProfileScreen;