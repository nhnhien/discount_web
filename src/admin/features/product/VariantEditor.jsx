import React from 'react';
import { Collapse, Button, Input, Row, Col, Form } from 'antd';
 import { DeleteOutlined } from '@ant-design/icons';
 import { Controller, useFieldArray } from 'react-hook-form';

const { Panel } = Collapse;

const VariantManager = ({ control, setValue }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  return (
    <div className='mt-4 p-4 bg-white border rounded-md shadow-md'>
      <h2 className='text-xl font-semibold mb-4 text-blue-700'>Quản lý biến thể</h2>

      <Collapse accordion>
         {fields.map((field, index) => (
          <Panel
          key={field.id}
            header={`Biến thể ${index + 1}`}
            extra={
              <Button danger icon={<DeleteOutlined />} onClick={() => remove(index)}>
                                Xóa
              </Button>
            }
          >
            <Row gutter={24}>
              <Col span={8}>
              <Controller
                   name={`variants[${index}].sku`}
                   control={control}
                   render={({ field }) => <Input {...field} placeholder='SKU' />}
                 />
              </Col>
              <Col span={8}>
              <Controller
                   name={`variants[${index}].price`}
                   control={control}
                   render={({ field }) => <Input {...field} placeholder='Giá' />}
                 />
              </Col>
              <Col span={8}>
              <Controller
                   name={`variants[${index}].stock`}
                   control={control}
                   render={({ field }) => <Input {...field} placeholder='Tồn kho' />}
                 />
              </Col>
            </Row>
          </Panel>
        ))}
      </Collapse>

      <Button type='primary' onClick={() => append({ sku: '', price: '', stock: '' })} className='mt-4'>
         Thêm biến thể
       </Button>
    </div>
  );
};

export default VariantManager;