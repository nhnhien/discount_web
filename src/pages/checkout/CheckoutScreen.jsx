import React, { useState } from 'react';
import { Typography, Row, Col, Card, Form, Input, Select, Radio, Divider, Button, Space, Modal } from 'antd';
import { ShoppingOutlined, PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';

// Dummy data for Vietnam administrative divisions
const vietnamProvinces = [
  { value: 'HN', label: 'Hà Nội' },
  { value: 'HCM', label: 'Hồ Chí Minh' },
  { value: 'DN', label: 'Đà Nẵng' },
  { value: 'HP', label: 'Hải Phòng' },
  { value: 'CT', label: 'Cần Thơ' },
];

const vietnamDistricts = {
  HN: [
    { value: 'BD', label: 'Quận Ba Đình' },
    { value: 'CG', label: 'Quận Cầu Giấy' },
    { value: 'TX', label: 'Quận Tây Hồ' },
  ],
  HCM: [
    { value: 'Q1', label: 'Quận 1' },
    { value: 'Q2', label: 'Quận 2' },
    { value: 'Q3', label: 'Quận 3' },
  ],
};

const vietnamWards = {
  BD: [
    { value: 'LV', label: 'Phường Linh Văn' },
    { value: 'DC', label: 'Phường Đức Thắng' },
  ],
  Q1: [
    { value: 'BT', label: 'Phường Bến Thành' },
    { value: 'DP', label: 'Phường Đa Kao' },
  ],
};

const { Title, Text } = Typography;
const { Option } = Select;
const CheckoutScreen = () => {
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      province: 'HN',
      district: 'BD',
      ward: 'LV',
      address: '123 Đường ABC',
    },
  ]);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedDistrict(null);
    form.setFieldsValue({ district: undefined, ward: undefined });
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ ward: undefined });
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalVisible(true);
    form.resetFields();
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressModalVisible(true);
    setSelectedProvince(address.province);
    setSelectedDistrict(address.district);
    form.setFieldsValue(address);
  };

  const handleSaveAddress = () => {
    form.validateFields().then((values) => {
      if (editingAddress) {
        // Edit existing address
        setAddresses((prev) => prev.map((addr) => (addr.id === editingAddress.id ? { ...addr, ...values } : addr)));
      } else {
        // Add new address
        const newAddress = {
          ...values,
          id: Date.now(),
        };
        setAddresses((prev) => [...prev, newAddress]);
      }
      setIsAddressModalVisible(false);
    });
  };

  const handleDeleteAddress = (addressId) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
  };

  // Helper function to get label
  const getAddressLabel = (type, value) => {
    let data;
    switch (type) {
      case 'province':
        data = vietnamProvinces;
        break;
      case 'district':
        data = vietnamDistricts[selectedProvince] || [];
        break;
      case 'ward':
        data = vietnamWards[selectedDistrict] || [];
        break;
      default:
        return '';
    }
    const item = data.find((item) => item.value === value);
    return item ? item.label : '';
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex justify-between items-center mb-6'>
        <Title level={3} className='mb-0 flex items-center'>
          <ShoppingOutlined className='mr-2' />
          Thanh toán
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        {/* Địa chỉ giao hàng */}
        <Col xs={24} md={16}>
          <Card
            title={
              <div className='flex justify-between items-center'>
                <span>Địa chỉ giao hàng</span>
                <Button type='dashed' icon={<PlusOutlined />} onClick={handleAddAddress}>
                  Thêm địa chỉ mới
                </Button>
              </div>
            }
          >
            <Radio.Group
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className='w-full'
            >
              {addresses.map((address) => (
                <Card
                  key={address.id}
                  className='mb-4'
                  extra={
                    <Space>
                      <Button type='text' icon={<EditOutlined />} onClick={() => handleEditAddress(address)} />
                      <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteAddress(address.id)}
                      />
                    </Space>
                  }
                >
                  <Radio value={address.id} className='w-full'>
                    <div>
                      <Text strong>{address.name}</Text>
                      <div className='text-gray-500'>{address.phone}</div>
                      <div>
                        {`${address.address}, ${getAddressLabel('ward', address.ward)}, ${getAddressLabel(
                          'district',
                          address.district,
                        )}, ${getAddressLabel('province', address.province)}`}
                      </div>
                    </div>
                  </Radio>
                </Card>
              ))}
            </Radio.Group>
          </Card>
        </Col>

        {/* Thông tin thanh toán */}
        <Col xs={24} md={8}>
          <Card title='Thông tin đơn hàng'>
            <div className='flex justify-between mb-2'>
              <Text>Tạm tính</Text>
              <Text strong>600.000đ</Text>
            </div>
            <div className='flex justify-between mb-2'>
              <Text>Phí vận chuyển</Text>
              <Text strong>30.000đ</Text>
            </div>
            <Divider />
            <div className='flex justify-between mb-4'>
              <Text strong>Tổng cộng</Text>
              <Text strong className='text-blue-600 text-lg'>
                630.000đ
              </Text>
            </div>
            <Button type='primary' block size='large'>
              Xác nhận đặt hàng
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Địa chỉ Modal */}
      <Modal
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={isAddressModalVisible}
        onOk={handleSaveAddress}
        onCancel={() => setIsAddressModalVisible(false)}
      >
        <Form form={form} layout='vertical'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name='name' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                <Input placeholder='Nhập họ và tên' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='phone'
                label='Số điện thoại'
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ' },
                ]}
              >
                <Input placeholder='Nhập số điện thoại' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='province'
            label='Tỉnh/Thành phố'
            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
          >
            <Select placeholder='Chọn tỉnh/thành phố' onChange={handleProvinceChange}>
              {vietnamProvinces.map((province) => (
                <Option key={province.value} value={province.value}>
                  {province.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='district'
                label='Quận/Huyện'
                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
              >
                <Select placeholder='Chọn quận/huyện' disabled={!selectedProvince} onChange={handleDistrictChange}>
                  {selectedProvince &&
                    vietnamDistricts[selectedProvince]?.map((district) => (
                      <Option key={district.value} value={district.value}>
                        {district.label}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='ward' label='Phường/Xã' rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}>
                <Select placeholder='Chọn phường/xã' disabled={!selectedDistrict}>
                  {selectedDistrict &&
                    vietnamWards[selectedDistrict]?.map((ward) => (
                      <Option key={ward.value} value={ward.value}>
                        {ward.label}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='address'
            label='Địa chỉ cụ thể'
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
          >
            <Input placeholder='Nhập số nhà, tên đường' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CheckoutScreen;
