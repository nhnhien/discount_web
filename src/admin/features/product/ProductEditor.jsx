import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Upload, Select, Switch, Row, Col, Collapse, message, Progress } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useForm, Controller, useFieldArray, set } from 'react-hook-form';
import SaveBar from '../../components/savebar/Savebar';
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from '@tanstack/react-query';
import { uploadImage } from '../../../service/upload';

const { Option } = Select;
const { Panel } = Collapse;

const ProductForm = () => {
  const [uploading, setUploading] = useState(false); // Để theo dõi trạng thái upload
  const [progress, setProgress] = useState(0); // Để lưu trữ tiến trình
  const defaultValues = {
    category: '',
    description: '',
    hasVariants: false,
    market: '',
    price: '',
    image: null,
    productName: '',
    sku: '',
    stock: '',
    variants: [
      {
        id: uuidv4(),
        sku: '',
        price: '',
        stock: '',
        image: null,
        description: '',
      },
    ],
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const initialFormValues = useRef(defaultValues);

  const normalizeValues = (values) => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value ?? '']));

  useEffect(() => {
    if (!initialFormValues.current) {
      initialFormValues.current = normalizeValues(getValues());
    }
  }, []);
  console.log(getValues());

  const isFormChanged = JSON.stringify(normalizeValues(watch())) !== JSON.stringify(initialFormValues.current);
  const hasVariants = watch('hasVariants', false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const isLastVariantFilled = () => {
    const lastVariant = getValues('variants')[getValues('variants').length - 1];
    return lastVariant.sku && lastVariant.price && lastVariant.stock;
  };

  const handleAddVariant = () => {
    if (!isLastVariantFilled()) return;
    append({
      id: uuidv4(),
      sku: '',
      price: '',
      stock: '',
      image: null,
      description: '',
    });
  };

  const mutation = useMutation({
    mutationFn: uploadImage,

    onSuccess: (data) => {
      message.success('Ảnh đã được tải lên thành công!');
      console.log('Uploaded Image Data:', data);
      setUploading(false);
    },
    onError: (error) => {
      message.error('Có lỗi khi tải ảnh lên!');
      console.error('Upload Error:', error);
      setUploading(false);
    },
  });

  const handleVariantImageChange = (index, file) => {
    setValue(`variants[${index}].image`, file);
  };

  const handleImageChange = async (info) => {
    const file = info.file;
    setValue('image', file);
    setUploading(true);
    await mutation.mutateAsync(file, {
      onUploadProgress: (event) => {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      },
    });
  };

  const onSubmit = (data) => {
    console.log('Form Data:', data);
  };

  const renderVariants = () => (
    <div className='mt-4 p-4 bg-white border rounded-md shadow-md'>
      <h2 className='text-xl font-semibold mb-4 text-blue-700'>Quản lý biến thể</h2>
      <Collapse defaultActiveKey={['0']} accordion>
        {fields.map((field, index) => (
          <Panel
            header={`Biến thể ${index + 1}`}
            key={field.id}
            extra={
              fields.length > 1 && (
                <Button danger icon={<DeleteOutlined />} onClick={() => remove(index)}>
                  Xóa
                </Button>
              )
            }
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label='SKU' required>
                  <Controller
                    name={`variants[${index}].sku`}
                    control={control}
                    rules={{ required: 'Vui lòng nhập SKU' }}
                    render={({ field }) => <Input {...field} placeholder='SKU' />}
                  />
                  {errors.variants?.[index]?.sku && <span className='text-red-500'>{errors.variants[index].sku.message}</span>}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='Giá'>
                  <Controller
                    name={`variants[${index}].price`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder='Nhập giá' />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='Tồn kho'>
                  <Controller
                    name={`variants[${index}].stock`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder='Nhập tồn kho' />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label='Ảnh bien thể'>
              <Upload
                listType='picture-card'
                fileList={field.image ? [field.image] : []}
                beforeUpload={(file) => {
                  handleVariantImageChange(index, file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />} />
              </Upload>
            </Form.Item>
          </Panel>
        ))}
      </Collapse>

      <Button type='primary' onClick={handleAddVariant} disabled={!isLastVariantFilled()} className='mt-4'>
        Thêm biến thể
      </Button>
    </div>
  );

  console.log(uploading);

  return (
    <div className='bg-white p-4 shadow-md rounded-md max-h-[800px]'>
      <SaveBar onSave={handleSubmit(onSubmit)} onDiscard={() => reset()} visible={isFormChanged} />
      <h1 className='text-2xl font-semibold mb-4 text-center text-blue-700'>Thêm sản phẩm</h1>

      <Form onFinish={handleSubmit(onSubmit)} layout='vertical' className='max-w-[1200px] mx-auto'>
        <Row gutter={100}>
          <Col span={12}>
            <Form.Item label='Tên sản phẩm'>
              <Controller
                name='productName'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập tên sản phẩm' size='large' />}
              />
            </Form.Item>
            <Form.Item label='Mô tả sản phẩm'>
              <Controller
                name='description'
                control={control}
                render={({ field }) => <Input.TextArea {...field} placeholder='Nhập mô tả sản phẩm' size='large' rows={3} />}
              />
            </Form.Item>
            <Form.Item label='Danh mục'>
              <Controller
                name='category'
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder='Chọn danh mục' size='large'>
                    <Option value='1'>Danh mục 1</Option>
                    <Option value='2'>Danh mục 2</Option>
                  </Select>
                )}
              />
            </Form.Item>
            <Form.Item label='Market'>
              <Controller
                name='market'
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder='Chọn Market' size='large'>
                    <Option value='1'>Market 1</Option>
                    <Option value='2'>Market 2</Option>
                  </Select>
                )}
              />
            </Form.Item>

            <Form.Item label='Ảnh sản phẩm'>
              <div className='flex items-center space-x-4'>
                <Upload
                  listType='picture-card'
                  customRequest={handleImageChange}
                  showUploadList={{
                    showRemoveIcon: false,
                    showPreviewIcon: false,
                    showProgress: true,
                  }}
                  accept='image/*'
                  fileList={
                    getValues('image')
                      ? [
                          {
                            uid: '1',
                            name: getValues('image').name,
                            url: URL.createObjectURL(getValues('image')),
                            status: uploading ? 'uploading' : 'done',
                            progress: progress,
                          },
                        ]
                      : []
                  }
                >
                  <Button icon={<UploadOutlined />} />
                </Upload>
              </div>
            </Form.Item>
            <Form.Item label='Thêm biến thể'>
              <Controller
                name='hasVariants'
                control={control}
                render={({ field }) => <Switch {...field} checked={field.value} onChange={(checked) => setValue('hasVariants', checked)} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            {!hasVariants ? (
              <>
                <Form.Item label='SKU'>
                  <Controller
                    name='sku'
                    control={control}
                    render={({ field }) => <Input {...field} placeholder='Nhập SKU' size='middle' />}
                  />
                </Form.Item>
                <Form.Item label='Giá'>
                  <Controller
                    name='price'
                    control={control}
                    render={({ field }) => <Input {...field} placeholder='Nhập giá' size='large' />}
                  />
                </Form.Item>
                <Form.Item label='Tồn kho'>
                  <Controller
                    name='stock'
                    control={control}
                    render={({ field }) => <Input {...field} placeholder='Nhập số lượng tồn kho' size='large' />}
                  />
                </Form.Item>
              </>
            ) : (
              renderVariants()
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductForm;