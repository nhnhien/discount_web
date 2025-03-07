import React from 'react';
import { Form, Input, Button, Upload, Row, Col, Collapse, Card, message } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const VariantEditor = ({ variants, setVariants, addVariant, removeVariant, handleVariantChange, handleVariantImageChange }) => {
  // Hàm cập nhật giá trị khi người dùng nhập
  const handleChange = (id, field, value) => {
    const updatedVariants = variants.map((variant) => {
      if (variant.id === id) {
        return { ...variant, [field]: value }; // Cập nhật trường cụ thể của biến thể
      }
      return variant;
    });
    setVariants(updatedVariants);
  };

  const handleAddVariant = () => {
    addVariant();
  };

  // Hàm xóa biến thể
  const handleRemoveVariant = (id) => {
    removeVariant(id);
  };

  return (
    <div className='mt-4 p-4 bg-white border rounded-md shadow-md'>
      <h2 className='text-xl font-semibold mb-4 text-blue-700'>Quản lý biến thể</h2>

      <Collapse defaultActiveKey={['0']} accordion>
        {variants.map((variant, index) => (
          <Panel
            header={`Biến thể ${index + 1}`}
            key={variant.id}
            extra={
              <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveVariant(variant.id)}>
                Xóa
              </Button>
            }
            style={{}}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label='SKU'>
                  <Input value={variant.sku} onChange={(e) => handleChange(variant.id, 'sku', e.target.value)} placeholder='Nhập SKU' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='Giá'>
                  <Input
                    type='number'
                    value={variant.price}
                    onChange={(e) => handleChange(variant.id, 'price', e.target.value)}
                    placeholder='Nhập giá'
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='Tồn kho'>
                  <Input
                    type='number'
                    value={variant.stock}
                    onChange={(e) => handleChange(variant.id, 'stock', e.target.value)}
                    placeholder='Nhập tồn kho'
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <div className='ml-4'>
                <Form.Item label='Ảnh sản phẩm'>
                  <Upload listType='picture-card'>
                    <Button icon={<UploadOutlined />} />
                  </Upload>
                </Form.Item>
              </div>
            </Row>
          </Panel>
        ))}
      </Collapse>

      <div className='flex justify-between mt-4'>
        <Button
          type='primary'
          onClick={handleAddVariant}
          disabled={
            variants[variants.length - 1]?.sku === '' ||
            variants[variants.length - 1]?.price === '' ||
            variants[variants.length - 1]?.stock === ''
          }
        >
          Thêm biến thể
        </Button>
      </div>
    </div>
  );
};

export default VariantEditor;