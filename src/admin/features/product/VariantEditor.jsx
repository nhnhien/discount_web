import React from 'react';
import { Collapse, Button, Input, Row, Col, Form } from 'antd';
<<<<<<< HEAD
 import { DeleteOutlined } from '@ant-design/icons';
 import { Controller, useFieldArray } from 'react-hook-form';
=======
import { DeleteOutlined } from '@ant-design/icons';
import { Controller, useFieldArray } from 'react-hook-form';
>>>>>>> 578b5de (update: UI admin)

const { Panel } = Collapse;

const VariantManager = ({ control, setValue }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  return (
    <div className='mt-4 p-4 bg-white border rounded-md shadow-md'>
      <h2 className='text-xl font-semibold mb-4 text-blue-700'>Quản lý biến thể</h2>
<<<<<<< HEAD

      <Collapse accordion>
         {fields.map((field, index) => (
          <Panel
          key={field.id}
            header={`Biến thể ${index + 1}`}
            extra={
              <Button danger icon={<DeleteOutlined />} onClick={() => remove(index)}>
                                Xóa
=======
      <Collapse accordion>
        {fields.map((field, index) => (
          <Panel
            key={field.id}
            header={`Biến thể ${index + 1}`}
            extra={
              <Button danger icon={<DeleteOutlined />} onClick={() => remove(index)}>
                Xóa
>>>>>>> 578b5de (update: UI admin)
              </Button>
            }
          >
            <Row gutter={24}>
              <Col span={8}>
<<<<<<< HEAD
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
=======
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
>>>>>>> 578b5de (update: UI admin)
              </Col>
            </Row>
          </Panel>
        ))}
      </Collapse>
<<<<<<< HEAD

      <Button type='primary' onClick={() => append({ sku: '', price: '', stock: '' })} className='mt-4'>
         Thêm biến thể
       </Button>
=======
      <Button type='primary' onClick={() => append({ sku: '', price: '', stock: '' })} className='mt-4'>
        Thêm biến thể
      </Button>
>>>>>>> 578b5de (update: UI admin)
    </div>
  );
};

<<<<<<< HEAD
export default VariantManager;
=======
export default VariantManager;
>>>>>>> 578b5de (update: UI admin)
