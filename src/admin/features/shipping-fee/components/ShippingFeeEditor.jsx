import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Switch, Button, message, Select } from 'antd';
import { shippingFeeService } from '@/service/shippingFeeService';
import { addressService } from '../../../../service/address';

const { Option } = Select;

const ShippingFeeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addressOptions, setAddressOptions] = useState([]); // State to store the list of cities

  const fetchData = async () => {
    try {
      const res = await shippingFeeService.getById(id);
      form.setFieldsValue(res);
    } catch {
      message.error('Không thể tải dữ liệu');
    }
  };

  const fetchCities = async () => {
    try {
      const cities = await addressService.getAllCities();
      setAddressOptions(cities); // Set the fetched cities in the state
    } catch {
      message.error('Không thể tải danh sách khu vực');
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
    fetchCities(); // Fetch cities when the component is mounted
  }, [id]);

  const onFinish = async (values) => {
    try {
      console.log("ID đang xử lý:", id); // ✅ để debug
      if (id) {
        await shippingFeeService.update(id, values);
        message.success('Cập nhật thành công');
      } else {
        await shippingFeeService.create(values);
        message.success('Tạo mới thành công');
      }
      navigate('/admin/shipping-fee');
    } catch (error) {
      message.error('Lưu dữ liệu thất bại');
    }
  };
  

  return (
    <div>
      <h2>{id ? 'Chỉnh sửa phí vận chuyển' : 'Tạo phí vận chuyển'}</h2>
      <Form layout="vertical" form={form} onFinish={onFinish} initialValues={{ is_active: true }}>
        <Form.Item
          label="Khu vực"
          name="region"
          rules={[{ required: true, message: 'Vui lòng chọn khu vực' }]}
        >
          <Select placeholder="Chọn khu vực" allowClear>
            {addressOptions.map((city) => (
              <Option key={city} value={city}>
                {city}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Phương thức vận chuyển"
          name="method"
          rules={[{ required: true, message: 'Vui lòng nhập phương thức' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Phí (VND)" name="fee" rules={[{ required: true, message: 'Vui lòng nhập phí' }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item label="Kích hoạt" name="is_active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {id ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ShippingFeeEditor;
