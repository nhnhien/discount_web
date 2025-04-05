import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Button, Select, Switch, Row, Col, Collapse, message, Tooltip, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, InfoCircleOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategory } from '../../../service/category';
import { getMarket } from '../../../service/market';
import { createProduct, editProduct, getProductById } from '@/service/product';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../components/loading/Loading';
import ImageUploader from './ImageUploader';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(!!id);
  const isEditing = useMemo(() => !!id, [id]);

  const [originalValues, setOriginalValues] = useState({
    name: '',
    description: '',
    category: '',
    market: '',
    image_url: '',
    hasVariants: false,
    sku: '',
    price: '',
    stock: '',
    variants: [
      {
        id: uuidv4(),
        sku: '',
        price: '',
        stock: '',
        image_url: '',
        size: '',
        color: '',
        material: '',
      },
    ],
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    defaultValues: originalValues,
    mode: 'onChange',
  });

  const hasVariants = useWatch({ control, name: 'hasVariants' });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'variants',
  });

  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ['product_edit', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    staleTime: 10 * 60 * 1000,
  });

  const { data: markets, isLoading: isLoadingMarkets } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarket,
    staleTime: 10 * 60 * 1000,
  });

  const setFormDataFromProduct = (product) => {
    if (!product) return;

    const hasVariants = product.variants && product.variants.length > 0;

    let formValues = {
      name: product.name || '',
      description: product.description || '',
      category: product.category_id || '',
      market: product.market_id || '',
      image_url: product.image_url || '',
      hasVariants: hasVariants,
      sku: product.sku || '',
      price: product.final_price || product.original_price || '',
      stock: product.stock_quantity || '',
      variants: [],
    };

    if (hasVariants) {
      formValues.variants = product.variants.map((variant) => {
        const attributes = Array.isArray(variant.attributes) ? variant.attributes : [];
        const findAttribute = (name) => {
          const attr = attributes.find((a) => a?.attribute_name?.toLowerCase() === name.toLowerCase());
          return attr ? attr.value : '';
        };

        const size = findAttribute('Size');
        const color = findAttribute('Color');
        const material = findAttribute('Material');

        return {
          id: uuidv4(),
          sku: variant.sku || '',
          price: variant.final_price || variant.original_price || '',
          stock: variant.stock_quantity || '',
          image_url: variant.image_url || '',
          size,
          color,
          material,
        };
      });
    }

    setOriginalValues(formValues);

    reset(formValues);
  };

  useEffect(() => {
    if (productData?.data) {
      setFormDataFromProduct(productData.data);
      setLoadingInitialData(false);
    }
  }, [productData, reset]);

  useEffect(() => {
    if (productError) {
      message.error('Không thể tải dữ liệu sản phẩm');
      setLoadingInitialData(false);
    }
  }, [productError]);

  const isLastVariantFilled = () => {
    if (!hasVariants || fields.length === 0) return true;

    const lastVariant = getValues('variants')[fields.length - 1];
    return !!(lastVariant.sku && lastVariant.price && lastVariant.stock);
  };

  const handleAddVariant = () => {
    if (!isLastVariantFilled()) {
      message.warning('Vui lòng điền đầy đủ thông tin SKU, giá và tồn kho cho biến thể hiện tại trước khi thêm mới.');
      return;
    }

    append({
      id: uuidv4(),
      sku: '',
      price: '',
      stock: '',
      image_url: '',
      size: '',
      color: '',
      material: '',
    });
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      message.success('Tạo sản phẩm thành công!');
      queryClient.invalidateQueries(['products']);
      reset(originalValues);
      navigate('/admin/product');
    },
    onError: (error) => {
      message.error('Có lỗi khi tạo sản phẩm: ' + (error.message || 'Vui lòng thử lại'));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => editProduct(id, data),
    onSuccess: () => {
      message.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product_edit', id]);
      navigate('/admin/product');
    },
    onError: (error) => {
      message.error('Có lỗi khi cập nhật sản phẩm: ' + (error.message || 'Vui lòng thử lại'));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const productData = {
      name: data.name,
      description: data.description,
      category_id: data.category,
      market_id: data.market,
      image_url: data.image_url,
      has_variant: data.hasVariants,
      ...(data.hasVariants
        ? {
            variants: data.variants.map(({ sku, price, stock, image_url, size, color, material }) => {
              const attributes = [];
              if (size) attributes.push({ name: 'Size', value: size });
              if (color) attributes.push({ name: 'Color', value: color });
              if (material) attributes.push({ name: 'Material', value: material });

              return {
                sku,
                original_price: Number(price),
                final_price: Number(price),
                stock_quantity: Number(stock),
                image_url,
                attributes,
              };
            }),
          }
        : {
            sku: data.sku,
            original_price: Number(data.price),
            final_price: Number(data.price),
            stock_quantity: Number(data.stock),
          }),
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(productData);
      } else {
        await createMutation.mutateAsync(productData);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(originalValues);
    message.info(isEditing ? 'Đã khôi phục dữ liệu ban đầu' : 'Đã xóa tất cả thông tin nhập');
  };

  const renderVariants = () => (
    <div className='mt-4 p-4 bg-gray-50 border rounded-md'>
      <Collapse defaultActiveKey={['product-variants']}>
        <Panel
          header={
            <div className='flex justify-between items-center'>
              <span className='font-semibold text-blue-700 text-base'>
                Biến thể của sản phẩm: {watch('name') || 'Chưa đặt tên'}
              </span>
              <Tooltip title='Thêm biến thể mới'>
                <Button
                  type='primary'
                  onClick={handleAddVariant}
                  disabled={!isLastVariantFilled()}
                  icon={<PlusOutlined />}
                >
                  Thêm biến thể
                </Button>
              </Tooltip>
            </div>
          }
          key='product-variants'
        >
          {fields.length === 0 ? (
            <div className='text-center p-8 text-gray-500'>
              <p>Chưa có biến thể nào. Hãy thêm biến thể đầu tiên.</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className='mb-6 border-b pb-4'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-medium text-blue-600'>
                    Biến thể {index + 1}{' '}
                    {watch(`variants.${index}.sku`) && (
                      <span className='ml-2 text-sm text-gray-500'>({watch(`variants.${index}.sku`)})</span>
                    )}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(index)}
                      size='small'
                    >
                      Xóa
                    </Button>
                  )}
                </div>
  
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label='SKU'
                      required
                      validateStatus={errors.variants?.[index]?.sku ? 'error' : ''}
                      help={errors.variants?.[index]?.sku?.message}
                    >
                      <Controller
                        name={`variants.${index}.sku`}
                        control={control}
                        rules={{ required: 'Vui lòng nhập SKU' }}
                        render={({ field }) => <Input {...field} placeholder='Nhập SKU' />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label='Giá'
                      required
                      validateStatus={errors.variants?.[index]?.price ? 'error' : ''}
                      help={errors.variants?.[index]?.price?.message}
                    >
                      <Controller
                        name={`variants.${index}.price`}
                        control={control}
                        rules={{ required: 'Vui lòng nhập giá' }}
                        render={({ field }) => (
                          <Input {...field} placeholder='Nhập giá' suffix='VNĐ' type='number' min='0' step='1000' />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label='Tồn kho'
                      required
                      validateStatus={errors.variants?.[index]?.stock ? 'error' : ''}
                      help={errors.variants?.[index]?.stock?.message}
                    >
                      <Controller
                        name={`variants.${index}.stock`}
                        control={control}
                        rules={{ required: 'Vui lòng nhập tồn kho' }}
                        render={({ field }) => <Input {...field} placeholder='Nhập tồn kho' type='number' min='0' />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
  
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label='Size'>
                      <Controller
                        name={`variants.${index}.size`}
                        control={control}
                        render={({ field }) => (
                          <Select {...field} placeholder='Chọn size' allowClear value={field.value || undefined}>
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
                        name={`variants.${index}.color`}
                        control={control}
                        render={({ field }) => <Input {...field} placeholder='Nhập màu' />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label='Chất liệu'>
                      <Controller
                        name={`variants.${index}.material`}
                        control={control}
                        render={({ field }) => (
                          <Select {...field} placeholder='Chọn chất liệu' allowClear value={field.value || undefined}>
                            {['Cotton', 'Polyester', 'Linen', 'Denim', 'Wool', 'Silk'].map((material) => (
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
                    name={`variants.${index}.image_url`}
                    control={control}
                    render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />}
                  />
                </Form.Item>
              </div>
            ))
          )}
        </Panel>
      </Collapse>
    </div>
  );
  

  const isLoading = isLoadingProduct || isLoadingCategories || isLoadingMarkets || loadingInitialData;
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loading />
      </div>
    );
  }

  return (
    <div className='bg-white p-6 shadow-md rounded-lg max-w-full h-[81vh] overflow-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold text-blue-700'>
          {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </h1>
        <Space>
          <Button onClick={handleReset} icon={<UndoOutlined />} disabled={!isDirty}>
            Hoàn tác
          </Button>
          <Button
            type='primary'
            onClick={handleSubmit(onSubmit)}
            icon={<SaveOutlined />}
            loading={isSubmitting}
            disabled={!isDirty}
          >
            {isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Space>
      </div>

      {isEditing && (
        <div className='mb-4 bg-blue-50 p-3 rounded-md flex items-center'>
          <InfoCircleOutlined className='text-blue-500 mr-2' />
          <span>
            Đang chỉnh sửa sản phẩm ID: <strong>{id}</strong>
          </span>
        </div>
      )}

      <Form layout='vertical' className='max-w-[1200px] mx-auto w-full'>
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={12}>
            <div className='p-4 bg-gray-50 rounded-md mb-4'>
              <h2 className='text-lg font-semibold mb-4 text-blue-700'>Thông tin cơ bản</h2>

              <Form.Item
                label='Tên sản phẩm'
                required
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
              >
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: 'Vui lòng nhập tên sản phẩm' }}
                  render={({ field }) => <Input {...field} placeholder='Nhập tên sản phẩm' size='large' />}
                />
              </Form.Item>

              <Form.Item label='Mô tả sản phẩm'>
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder='Nhập mô tả sản phẩm'
                      size='large'
                      rows={4}
                      showCount
                      maxLength={500}
                    />
                  )}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label='Danh mục'
                    required
                    validateStatus={errors.category ? 'error' : ''}
                    help={errors.category?.message}
                  >
                    <Controller
                      name='category'
                      control={control}
                      rules={{ required: 'Vui lòng chọn danh mục' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder='Chọn danh mục'
                          size='large'
                          className='w-full'
                          loading={isLoadingCategories}
                          showSearch
                          optionFilterProp='children'
                          value={field.value || undefined}
                        >
                          {categories?.data?.map((category) => (
                            <Option key={category.id} value={category.id}>
                              {category.name}
                            </Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label='Market'
                    required
                    validateStatus={errors.market ? 'error' : ''}
                    help={errors.market?.message}
                  >
                    <Controller
                      name='market'
                      control={control}
                      rules={{ required: 'Vui lòng chọn market' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder='Chọn Market'
                          size='large'
                          className='w-full'
                          loading={isLoadingMarkets}
                          showSearch
                          optionFilterProp='children'
                          value={field.value || undefined}
                        >
                          {markets?.data?.map((market) => (
                            <Option key={market.id} value={market.id}>
                              {market.name}
                            </Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label='Ảnh sản phẩm chính'>
                <Controller
                  name='image_url'
                  control={control}
                  render={({ field }) => (
                    <ImageUploader value={field.value} onChange={field.onChange} maxSize={5} aspectRatio={1} />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <span>Sản phẩm có biến thể?</span>
                    <Tooltip title='Chọn nếu sản phẩm có nhiều biến thể như kích cỡ, màu sắc, v.v.'>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Controller
                  name='hasVariants'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(checked) => {
                        setValue('hasVariants', checked, { shouldDirty: true });
                        if (checked) {
                          setValue('sku', '', { shouldDirty: true });
                          setValue('price', '', { shouldDirty: true });
                          setValue('stock', '', { shouldDirty: true });

                          if (fields.length === 0) {
                            append({
                              id: uuidv4(),
                              sku: '',
                              price: '',
                              stock: '',
                              image_url: '',
                              size: '',
                              color: '',
                              material: '',
                            });
                          }
                        }
                      }}
                    />
                  )}
                />
              </Form.Item>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            {!hasVariants ? (
              <div className='p-4 bg-gray-50 rounded-md'>
                <h2 className='text-lg font-semibold mb-4 text-blue-700'>Thông tin sản phẩm</h2>
                <Form.Item label='SKU' required validateStatus={errors.sku ? 'error' : ''} help={errors.sku?.message}>
                  <Controller
                    name='sku'
                    control={control}
                    rules={{ required: hasVariants ? false : 'Vui lòng nhập SKU' }}
                    render={({ field }) => <Input {...field} placeholder='Nhập SKU' size='large' />}
                  />
                </Form.Item>

                <Form.Item
                  label='Giá'
                  required
                  validateStatus={errors.price ? 'error' : ''}
                  help={errors.price?.message}
                >
                  <Controller
                    name='price'
                    control={control}
                    rules={{
                      required: hasVariants ? false : 'Vui lòng nhập giá',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Giá phải là số hợp lệ',
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder='Nhập giá'
                        size='large'
                        suffix='VNĐ'
                        type='number'
                        min='0'
                        step='1000'
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label='Tồn kho'
                  required
                  validateStatus={errors.stock ? 'error' : ''}
                  help={errors.stock?.message}
                >
                  <Controller
                    name='stock'
                    control={control}
                    rules={{
                      required: hasVariants ? false : 'Vui lòng nhập số lượng tồn kho',
                      pattern: {
                        value: /^\d+$/,
                        message: 'Tồn kho phải là số nguyên',
                      },
                    }}
                    render={({ field }) => (
                      <Input {...field} placeholder='Nhập số lượng tồn kho' size='large' type='number' min='0' />
                    )}
                  />
                </Form.Item>
              </div>
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
