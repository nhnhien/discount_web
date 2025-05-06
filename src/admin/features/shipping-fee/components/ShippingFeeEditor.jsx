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
      message.error('Failed to load data');
    }
  };

  const fetchCities = async () => {
    try {
      const cities = await addressService.getAllCities();
      setAddressOptions(cities); // Set the fetched cities in the state
    } catch {
      message.error('Failed to load area list');
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
        message.success('Update successful');
      } else {
        await shippingFeeService.create(values);
        message.success('Create successful');
      }
      navigate('/admin/shipping-fee');
    } catch (error) {
      message.error('Failed to save data');
    }
  };
  

  return (
    <div>
      <h2>{id ? 'Edit Shipping Fee' : 'Create Shipping Fee'}</h2>
      <Form layout="vertical" form={form} onFinish={onFinish} initialValues={{ is_active: true }}>
        <Form.Item
          label="Area"
          name="region"
          rules={[{ required: true, message: 'Please select an area' }]}
        >
          <Select placeholder="Select area" allowClear>
            {addressOptions.map((city) => (
              <Option key={city} value={city}>
                {city}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Shipping Method"
          name="method"
          rules={[{ required: true, message: 'Please enter shipping method' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Fee (VND)" name="fee" rules={[{ required: true, message: 'Please enter fee' }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item label="Active" name="is_active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {id ? 'Update' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ShippingFeeEditor;
