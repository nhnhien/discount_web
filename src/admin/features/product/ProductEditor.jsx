import React, { useEffect, useRef } from 'react';

import { Form, Input, Button, Select, Switch, Row, Col, Collapse, message, ColorPicker } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useForm, Controller, useFieldArray, set } from 'react-hook-form';
import SaveBar from '../../components/savebar/Savebar';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getCategory } from '../../../service/category';
import { getMarket } from '../../../service/market';
import { createProduct } from '../../../service/product';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../components/loading/Loading';
import ImageUploader from './ImageUploader';
import { color } from 'framer-motion';

const { Option } = Select;
const { Panel } = Collapse;

const ProductEditor = () => {
  const navigate = useNavigate();
  const { data: categories, isSuccess: getCategorySuccess } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
  });
  const { data: markets, isSuccess: getMarketSuccess } = useQuery({ queryKey: ['markets'], queryFn: getMarket });
  const defaultValues = {
    category: '',
    description: '',
    hasVariants: false,
    market: '',
    price: '',
    image: '',

    image_url: '',
    name: '',
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

        size: '',
        color: '',
        material: '',
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

  const normalizeValues = (values) =>
    Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value ?? '']));

  useEffect(() => {
    if (!initialFormValues.current) {
      initialFormValues.current = normalizeValues(getValues());
    }
  }, []);

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

      size: '',
      color: '',
      material: '',
    });
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      message.success('Tạo sản phẩm thành công!');
      reset();
      navigate('/admin/product');
    },
    onError: (error) => {
      message.error('Có lỗi khi tạo sản phẩm!');

      console.error('Create Product Error:', error);
    },
  });
  const { isPending } = createMutation;

  const onSubmit = async (data) => {
    console.log(data);

    const productData = {
      name: data.name,
      description: data.description,
      category_id: data.category,
      market_id: data.market,
      image_url: data.image_url,
      has_variant: data.hasVariants,
      ...(data.hasVariants
        ? {
            variants: data.variants.map(({ sku, price, stock, image_url, size, color, material }) => ({
              sku,
              original_price: price,
              final_price: price,
              stock,
              image_url,
              attributes: [
                {
                  name: 'Size',
                  value: size,
                },
                {
                  name: 'Color',
                  value: color,
                },
                {
                  name: 'Material',
                  value: material,
                },
              ],
            })),
          }
        : {
            original_price: data.price,
            final_price: data.price,
            stock_quantity: data.stock,
          }),
    };

    console.log('productData', productData);
    await createMutation.mutateAsync(productData);
  };

  const renderVariants = () => (
    <>

      {isPending && <Loading />}
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
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label='SKU' required>
                    <Controller
                      name={`variants[${index}].sku`}
                      control={control}
                      rules={{ required: 'Vui lòng nhập SKU' }}
                      render={({ field }) => <Input {...field} placeholder='SKU' />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label='Giá'>
                    <Controller
                      name={`variants[${index}].price`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập giá' />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label='Tồn kho'>
                    <Controller
                      name={`variants[${index}].stock`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập tồn kho' />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label='Size'>
                    <Controller
                      name={`variants[${index}].size`}
                      control={control}
                      render={({ field }) => (
                        <Select {...field} placeholder='Chọn size'>
                          {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <Select.Option key={size} value={size}>
                              {size}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label='Màu sắc'>
                    <Controller
                      name={`variants[${index}].color`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập màu' />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item label='Chất liệu'>
                    <Controller
                      name={`variants[${index}].material`}
                      control={control}
                      render={({ field }) => (
                        <Select {...field} placeholder='Chọn chất liệu'>
                          {['Cotton', 'Polyester', 'Linen', 'Denim'].map((material) => (
                            <Select.Option key={material} value={material}>
                              {material}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label='Ảnh biến thể'>
                <Controller
                  name={`variants[${index}].image_url`}
                  control={control}
                  render={({ field }) => <ImageUploader value={field.value || undefined} onChange={field.onChange} />}
                />
              </Form.Item>
            </Panel>
          ))}
        </Collapse>

        <Button type='primary' onClick={handleAddVariant} disabled={!isLastVariantFilled()} className='mt-4'>
          Thêm biến thể
        </Button>
      </div>
    </>
  );

  return (
    <div className='bg-white p-4 shadow-md rounded-md max-w-full'>
      <SaveBar
        onSave={handleSubmit(onSubmit)}
        title={'Thêm sản phẩm'}
        onDiscard={() => reset()}
        visible={isFormChanged}
      />
      <h1 className='text-2xl font-semibold mb-4 text-center text-blue-700'>Thêm sản phẩm</h1>

      <Form onFinish={handleSubmit(onSubmit)} layout='vertical' className='max-w-[1200px] mx-auto w-full'>
        <Row gutter={48}>
          <Col xs={24} lg={12}>
            <Form.Item label='Tên sản phẩm'>
              <Controller
                name='name'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập tên sản phẩm' size='large' />}
              />
            </Form.Item>
            <Form.Item label='Mô tả sản phẩm'>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <Input.TextArea {...field} placeholder='Nhập mô tả sản phẩm' size='large' rows={3} />
                )}

              />
            </Form.Item>
            <Form.Item label='Danh mục'>
              <Controller
                name='category'
                control={control}
                render={({ field }) => (

                  <Select {...field} placeholder='Chọn danh mục' size='large' className='w-full'>
                    {getCategorySuccess &&
                      categories.data?.map((category) => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                  </Select>
                )}
              />
            </Form.Item>
            <Form.Item label='Market'>
              <Controller
                name='market'
                control={control}
                render={({ field }) => (

                  <Select {...field} placeholder='Chọn Market' size='large' className='w-full'>
                    {getMarketSuccess &&
                      markets?.data?.map((market) => (
                        <Option key={market.id} value={market.id}>
                          {market.name}
                        </Option>
                      ))}
                  </Select>
                )}
              />
            </Form.Item>

            <Form.Item label='Ảnh sản phẩm'>
              <Controller
                name='image_url'
                control={control}
                render={({ field }) => <ImageUploader value={field.value || undefined} onChange={field.onChange} />}
              />
            </Form.Item>
            <Form.Item label='Thêm biến thể'>
              <Controller
                name='hasVariants'
                control={control}
                render={({ field }) => (
                  <Switch {...field} checked={field.value} onChange={(checked) => setValue('hasVariants', checked)} />
                )}

              />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            {!hasVariants ? (
              <>
                <Form.Item label='SKU'>
                  <Controller
                    name='sku'
                    control={control}

                    render={({ field }) => <Input {...field} placeholder='Nhập SKU' size='large' />}
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


export default ProductEditor;
