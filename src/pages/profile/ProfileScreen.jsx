import { useEffect, useState } from 'react';
import { Card, Input, Button, Form, message, Typography, List, Modal, Space } from 'antd';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/service/user';
import { addressService } from '@/service/address';

const ProfileScreen = () => {
  const user = useSelector((state) => state.auth.currentUser);
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [editingAddress, setEditingAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: addressData, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  });

  const updatePhoneMutation = useMutation({
    mutationFn: ({ id, phone }) => updateProfile(id, { phone }),
    onSuccess: () => {
      message.success('Cập nhật số điện thoại thành công');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err) => {
      message.error(err.message || 'Lỗi khi cập nhật số điện thoại');
    },
  });

  const addressMutation = useMutation({
    mutationFn: (payload) => {
      return editingAddress
        ? addressService.updateAddress(editingAddress.id, payload)
        : addressService.createAddress(payload);
    },
    onSuccess: () => {
      message.success(editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
      addressForm.resetFields();
      setEditingAddress(null);
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => {
      message.error(err.message || 'Lỗi khi lưu địa chỉ');
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
      message.success('Xóa địa chỉ thành công');
      refetch();
    } catch (error) {
      message.error('Không thể xóa địa chỉ');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Typography.Title level={3}>Thông tin cá nhân</Typography.Title>
      <Card className="mb-6">
        <Form layout="vertical" onFinish={handlePhoneSubmit} initialValues={{ phone: user?.phone }}>
          <Form.Item label="Email" name="email">
            <Input disabled value={user?.email || 'Không có'} />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input disabled={!user?.email} />
          </Form.Item>
          {user?.email && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updatePhoneMutation.isPending}>
                Cập nhật số điện thoại
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>

      <Typography.Title level={4}>Địa chỉ giao hàng</Typography.Title>
      <Button type="primary" onClick={() => openAddressModal()} className="mb-4">
        Thêm địa chỉ
      </Button>

      <List
        bordered
        dataSource={addressData?.data || []}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a key="edit" onClick={() => openAddressModal(item)}>Sửa</a>,
              <a key="delete" onClick={() => handleDeleteAddress(item.id)}>Xóa</a>,
            ]}
          >
            <div>
              <strong>{item.full_name}</strong> - {item.phone_number}
              <div>{item.address}, {item.city}</div>
            </div>
          </List.Item>
        )}
      />

      <Modal
        title={editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddressSubmit}
        confirmLoading={addressMutation.isPending}
        okText={editingAddress ? 'Cập nhật' : 'Thêm'}
      >
        <Form form={addressForm} layout="vertical">
          <Form.Item
            label="Họ tên"
            name="full_name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone_number"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa chỉ chi tiết"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            label="Tỉnh / Thành phố"
            name="city"
            rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileScreen;