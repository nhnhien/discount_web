import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import {
  Input,
  DatePicker,
  Button,
  Radio,
  Card,
  Form,
  Modal,
  Select,
  message,
  InputNumber,
  Tooltip,
  Table,
  Space,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  RollbackOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductListSelector from '../../custom-pricing/components/ProductSelector';
import { getQB, createQB, updateQB } from '@/service/qb';
import { getMarket } from '@/service/market';
import { getProduct } from '@/service/product';
import { getCustomer } from '@/service/user';

const transformData = (data) => {
  return {
    title: data.title || '',
    description: data.description || '',
    qb_rules: data.qb_rules || [],
    start_date: data.start_date ? dayjs(data.start_date) : null,
    end_date: data.end_date ? dayjs(data.end_date) : null,
    customer_type: data.customers?.length ? 'specific' : 'all',
    selected_customers: data.customers?.map((customer) => customer.id) || [],
    market_type: data.markets?.length ? 'specific' : 'all',
    selected_markets: data.markets?.map((market) => market.id) || [],
    product_type: data.products?.length ? 'specific' : 'all',
    selected_products: data.products?.map((product) => product.id) || [],
    variant_type: data.variants?.length ? 'specific' : 'none',
    selected_variants: data.variants?.map((variant) => variant.id) || [],
  };
};

const QBEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: qbEditData, isLoading: isLoadingQB } = useQuery({
    queryKey: ['quantityBreak', id],
    queryFn: () => getQB(id),
    enabled: !!id,
  });

  const { data: markets, isLoading: isLoadingMarkets } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarket,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProduct,
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomer,
  });
  const createMutation = useMutation({
    mutationFn: createQB,
    onSuccess: () => {
      message.success('Tạo mới quy tắc giá theo số lượng thành công!');
      navigate('/admin/discounts/qb');
      queryClient.invalidateQueries(['quantityBreaks']);
    },
    onError: (error) => {
      message.error(`Lỗi khi tạo quy tắc: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateQB(id, data),
    onSuccess: () => {
      message.success('Cập nhật quy tắc giá theo số lượng thành công!');
      navigate('/admin/discounts/qb');
      queryClient.invalidateQueries(['quantityBreaks']);
      queryClient.invalidateQueries(['quantityBreak', id]);
    },
    onError: (error) => {
      message.error(`Lỗi khi cập nhật quy tắc: ${error.message}`);
    },
  });

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const QBFormSchema = z.object({
    title: z.string().min(1, { message: 'Tên quy tắc không được để trống' }),
    description: z.string().optional(),
    qb_rules: z
      .array(
        z.object({
          quantity: z.number().min(1, { message: 'Số lượng phải lớn hơn 0' }),
          discount_type: z.enum(['percentage', 'fixed']),
          value: z.number().min(0, { message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0' }),
        }),
      )
      .min(1, { message: 'Phải có ít nhất một mức giảm giá' }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date().nullable(),
    customer_type: z.string(),
    selected_customers: z.array(z.number()),
    market_type: z.string(),
    selected_markets: z.array(z.number()),
    product_type: z.string(),
    selected_products: z.array(z.number()),
    variant_type: z.string(),
    selected_variants: z.array(z.number()),
  });
  const defaultValues = useMemo(() => {
    const initialValues = qbEditData?.data
      ? transformData(qbEditData.data)
      : {
          title: '',
          description: '',
          qb_rules: [{ quantity: 5, discount_type: 'percentage', value: 5 }],
          start_date: dayjs(),
          end_date: null,
          customer_type: 'all',
          selected_customers: customers?.data?.map((c) => c.id) || [],
          market_type: 'all',
          selected_markets: markets?.data?.map((m) => m.id) || [],
          product_type: 'all',
          selected_products: products?.data?.map((p) => p.id) || [],
          variant_type: 'none',
          selected_variants: [],
        };
    if (initialValues.customer_type === 'all' && customers?.data) {
      initialValues.selected_customers = customers.data.map((c) => c.id);
    }
    if (initialValues.market_type === 'all' && markets?.data) {
      initialValues.selected_markets = markets.data.map((m) => m.id);
    }
    if (initialValues.product_type === 'all' && products?.data) {
      initialValues.selected_products = products.data.map((p) => p.id);
    }

    return initialValues;
  }, [qbEditData, customers?.data, markets?.data, products?.data]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: defaultValues,
    resolver: zodResolver(QBFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'qb_rules',
  });

  const customer_type = useWatch({ control, name: 'customer_type' });
  const market_type = useWatch({ control, name: 'market_type' });
  const product_type = useWatch({ control, name: 'product_type' });
  const selected_customers = useWatch({ control, name: 'selected_customers' });
  const selected_markets = useWatch({ control, name: 'selected_markets' });
  const selected_products = useWatch({ control, name: 'selected_products' });
  const qb_rules = useWatch({ control, name: 'qb_rules' });

  const allMarkets = useMemo(() => markets?.data?.map((m) => m.id) || [], [markets]);
  const allCustomerIds = useMemo(() => customers?.data?.map((c) => c.id) || [], [customers]);
  const allProductIds = useMemo(() => products?.data?.map((p) => p.id) || [], [products]);
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset(defaultValues);
      if (markets?.data && defaultValues.market_type === 'all') {
        setValue('selected_markets', allMarkets);
      }

      if (customers?.data && defaultValues.customer_type === 'all') {
        setValue('selected_customers', allCustomerIds);
      }

      if (products?.data && defaultValues.product_type === 'all') {
        setValue('selected_products', allProductIds);
      }
    }
  }, [
    defaultValues,
    reset,
    allMarkets,
    allCustomerIds,
    allProductIds,
    markets?.data,
    customers?.data,
    products?.data,
    setValue,
  ]);

  useEffect(() => {
    if (market_type === 'all' && markets?.data) {
      setValue('selected_markets', allMarkets);
    } else if (market_type === 'specific' && !id) {
      setValue('selected_markets', []);
    }
  }, [market_type, setValue, allMarkets, id, markets?.data]);
  useEffect(() => {
    if (customer_type === 'all' && customers?.data) {
      setValue('selected_customers', allCustomerIds);
    } else if (customer_type === 'specific' && !id) {
      setValue('selected_customers', []);
    }
  }, [customer_type, setValue, allCustomerIds, id, customers?.data]);

  useEffect(() => {
    if (product_type === 'all' && products?.data) {
      setValue('selected_products', allProductIds);
    } else if (product_type === 'specific' && !id) {
      setValue('selected_products', []);
    }
  }, [product_type, setValue, allProductIds, id, products?.data]);

  const onSubmit = (data) => {
    console.log('Form data:', data);
    const formattedData = {
      title: data.title,
      description: data.description || '',
      qb_rules: data.qb_rules.sort((a, b) => a.quantity - b.quantity),
      start_date: data.start_date,
      end_date: data.end_date,
      product_ids: data.selected_products,
      customer_ids: data.selected_customers,
      market_ids: data.selected_markets,
    };

    console.log('Formatted data for API:', formattedData);

    if (id) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const isLoading =
    isLoadingQB ||
    isLoadingMarkets ||
    isLoadingProducts ||
    isLoadingCustomers ||
    createMutation.isLoading ||
    updateMutation.isLoading;

  const addRule = () => {
    const lastRule = qb_rules[qb_rules.length - 1];
    const newQuantity = lastRule ? lastRule.quantity + 5 : 5;
    const newValue = lastRule ? lastRule.value + 5 : 5;

    append({
      quantity: newQuantity,
      discount_type: lastRule ? lastRule.discount_type : 'percentage',
      value: newValue > 100 && lastRule?.discount_type === 'percentage' ? 100 : newValue,
    });
  };

  const goBack = () => {
    navigate('/admin/discount/qb');
  };

  const resetForm = () => {
    reset(defaultValues);
    message.success('Đã hoàn tác các thay đổi!');
  };

  const renderPreview = () => {
    const title = watch('title');
    const description = watch('description');
    const rules = watch('qb_rules');

    return (
      <div className='space-y-6'>
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='font-bold text-lg'>{title || 'Chưa có tiêu đề'}</h3>
          <p className='text-gray-600'>{description || 'Không có mô tả'}</p>
        </div>

        <h4 className='font-semibold'>Các mức giảm giá:</h4>
        <Table
          dataSource={rules}
          rowKey={(record, index) => index}
          pagination={false}
          columns={[
            {
              title: 'Từ (số lượng)',
              dataIndex: 'quantity',
              key: 'quantity',
              render: (quantity) => <span className='font-medium'>{quantity}</span>,
            },
            {
              title: 'Loại giảm giá',
              dataIndex: 'discount_type',
              key: 'discount_type',
              render: (type) => (
                <Tag color={type === 'percentage' ? 'green' : 'blue'}>
                  {type === 'percentage' ? 'Phần trăm' : 'Giảm trực tiếp'}
                </Tag>
              ),
            },
            {
              title: 'Giá trị',
              dataIndex: 'value',
              key: 'value',
              render: (value, record) => (
                <span className='font-medium'>
                  {record.discount_type === 'percentage' ? `${value}%` : `${value.toLocaleString()}₫`}
                </span>
              ),
            },
          ]}
        />

        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <h4 className='font-semibold'>Áp dụng cho:</h4>
            <p>
              <span className='text-gray-600'>Khách hàng: </span>
              {customer_type === 'all' ? 'Tất cả khách hàng' : `${selected_customers.length} khách hàng đã chọn`}
            </p>
            <p>
              <span className='text-gray-600'>Thị trường: </span>
              {market_type === 'all' ? 'Tất cả thị trường' : `${selected_markets.length} thị trường đã chọn`}
            </p>
            <p>
              <span className='text-gray-600'>Sản phẩm: </span>
              {product_type === 'all' ? 'Tất cả sản phẩm' : `${selected_products.length} sản phẩm đã chọn`}
            </p>
          </div>
          <div>
            <h4 className='font-semibold'>Thời gian áp dụng:</h4>
            <p>
              <span className='text-gray-600'>Bắt đầu: </span>
              {watch('start_date')?.format('DD/MM/YYYY') || 'Chưa thiết lập'}
            </p>
            <p>
              <span className='text-gray-600'>Kết thúc: </span>
              {watch('end_date')?.format('DD/MM/YYYY') || 'Không giới hạn'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='p-6 rounded-lg max-w-[1100px] mx-auto'>
      {/* Header với nút quay lại/lưu/hoàn tác */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold'>{id ? 'Chỉnh sửa' : 'Tạo mới'} Quy tắc giá theo số lượng</h2>
        <div className='flex gap-3'>
          <Button icon={<RollbackOutlined />} onClick={goBack} className='flex items-center gap-1'>
            Quay lại
          </Button>
          <Button
            type='default'
            icon={<RollbackOutlined />}
            onClick={resetForm}
            disabled={!isDirty}
            className='flex items-center gap-1'
          >
            Hoàn tác
          </Button>
          <Button
            type='primary'
            icon={<SaveOutlined />}
            onClick={handleSubmit(onSubmit)}
            loading={isLoading}
            className='flex items-center gap-1'
          >
            {id ? 'Cập nhật' : 'Lưu'}
          </Button>
        </div>
      </div>

      <Form layout='vertical' onFinish={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Thông tin cơ bản */}
        <div className='grid grid-cols-12 gap-6'>
          <label className='ml-4 font-medium text-base col-span-5'>Thông tin cơ bản</label>
          <Card className='w-full space-y-4 p-4 shadow-sm col-span-7'>
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <Form.Item
                  label='Tên quy tắc'
                  required
                  validateStatus={errors.title ? 'error' : ''}
                  help={errors.title?.message}
                >
                  <Input {...field} placeholder='Nhập tên quy tắc giá theo số lượng' />
                </Form.Item>
              )}
            />

            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <Form.Item label='Mô tả'>
                  <Input.TextArea {...field} placeholder='Nhập mô tả chi tiết' rows={3} />
                </Form.Item>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='start_date'
                control={control}
                render={({ field }) => (
                  <Form.Item
                    label='Ngày bắt đầu'
                    required
                    validateStatus={errors.start_date ? 'error' : ''}
                    help={errors.start_date?.message}
                  >
                    <DatePicker {...field} className='w-full' format='DD/MM/YYYY' placeholder='Chọn ngày bắt đầu' />
                  </Form.Item>
                )}
              />

              <Controller
                name='end_date'
                control={control}
                render={({ field }) => (
                  <Form.Item label='Ngày kết thúc' extra='Để trống nếu không giới hạn'>
                    <DatePicker
                      {...field}
                      className='w-full'
                      format='DD/MM/YYYY'
                      placeholder='Chọn ngày kết thúc'
                      disabledDate={(current) => current && current < watch('start_date')}
                    />
                  </Form.Item>
                )}
              />
            </div>
          </Card>
        </div>
        <div className='grid grid-cols-12 gap-6'>
          <label className='ml-4 font-medium text-base col-span-5'>
            Mức giảm giá theo số lượng
            <Tooltip title='Thiết lập các mức giảm giá dựa trên số lượng sản phẩm được đặt hàng'>
              <QuestionCircleOutlined className='ml-2 text-gray-400' />
            </Tooltip>
          </label>
          <Card className='w-full p-4 shadow-sm space-y-4 col-span-7'>
            <div className='space-y-4'>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='grid grid-cols-12 gap-4 items-center p-3 border rounded-lg border-gray-200 bg-gray-50'
                >
                  <div className='col-span-3'>
                    <Form.Item
                      label={`Từ SL`}
                      validateStatus={errors.qb_rules?.[index]?.quantity ? 'error' : ''}
                      help={errors.qb_rules?.[index]?.quantity?.message}
                      className='mb-0'
                    >
                      <Controller
                        name={`qb_rules.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <InputNumber {...field} min={1} className='w-full' placeholder='Số lượng' />
                        )}
                      />
                    </Form.Item>
                  </div>

                  <div className='col-span-4'>
                    <Form.Item label='Loại giảm giá' className='mb-0'>
                      <Controller
                        name={`qb_rules.${index}.discount_type`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[
                              { label: 'Phần trăm', value: 'percentage' },
                              { label: 'Giảm trực tiếp', value: 'fixed' },
                            ]}
                          />
                        )}
                      />
                    </Form.Item>
                  </div>

                  <div className='col-span-4'>
                    <Form.Item
                      label='Giá trị'
                      validateStatus={errors.qb_rules?.[index]?.value ? 'error' : ''}
                      help={errors.qb_rules?.[index]?.value?.message}
                      className='mb-0'
                    >
                      <Controller
                        name={`qb_rules.${index}.value`}
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            max={watch(`qb_rules.${index}.discount_type`) === 'percentage' ? 100 : undefined}
                            className='w-full'
                            placeholder='Giá trị'
                            addonAfter={watch(`qb_rules.${index}.discount_type`) === 'percentage' ? '%' : 'đ'}
                          />
                        )}
                      />
                    </Form.Item>
                  </div>

                  <div className='col-span-1 flex justify-end'>
                    {fields.length > 1 && (
                      <Button type='text' danger icon={<DeleteOutlined />} onClick={() => remove(index)} />
                    )}
                  </div>
                </div>
              ))}

              <Button type='dashed' onClick={addRule} block icon={<PlusOutlined />}>
                Thêm mức giá
              </Button>
            </div>
          </Card>
        </div>

        <div className='grid grid-cols-12 gap-6'>
          <label className='ml-4 font-medium text-base col-span-5'>Chọn thị trường</label>
          <Card className='w-full p-4 shadow-sm space-y-4 col-span-7'>
            <Controller
              name='market_type'
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} className='flex flex-col space-y-3'>
                  <Radio value='all'>Tất cả thị trường</Radio>
                  <Radio value='specific'>Thị trường cụ thể</Radio>
                </Radio.Group>
              )}
            />

            <div className='pt-4'>
              {market_type === 'specific' && (
                <Form.Item>
                  <Controller
                    name='selected_markets'
                    control={control}
                    render={({ field }) => (
                      <Select
                        mode='multiple'
                        placeholder='Chọn thị trường'
                        options={markets?.data?.map((m) => ({
                          label: m.name === 'VietNam' ? '🇻🇳 VN' : '🇬🇧 US-UK',
                          value: m.id,
                        }))}
                        {...field}
                        className='w-full'
                      />
                    )}
                  />
                </Form.Item>
              )}
            </div>
          </Card>
        </div>

        <div className='grid grid-cols-12 gap-6'>
          <label className='ml-4 font-medium text-base col-span-5'>Áp dụng cho khách hàng</label>
          <Card className='w-full p-4 shadow-sm col-span-7'>
            <Controller
              name='customer_type'
              control={control}
              render={({ field }) => (
                <>
                  <Radio.Group {...field} className='flex flex-col space-y-3'>
                    <Radio value='all'>Tất cả khách hàng</Radio>
                    <Radio value='specific'>Chọn khách hàng cụ thể</Radio>
                  </Radio.Group>
                  <div className='pt-4'>
                    {customer_type === 'specific' && (
                      <Form.Item>
                        <Controller
                          name='selected_customers'
                          control={control}
                          render={({ field }) => (
                            <Select
                              mode='multiple'
                              placeholder='Chọn khách hàng'
                              options={customers?.data?.map((c) => ({
                                label: c.name,
                                value: c.id,
                              }))}
                              {...field}
                              className='w-full'
                            />
                          )}
                        />
                      </Form.Item>
                    )}
                  </div>
                </>
              )}
            />
          </Card>
        </div>

        <div className='grid grid-cols-12 gap-6'>
          <label className='ml-4 font-medium text-base col-span-5'>Áp dụng cho sản phẩm</label>
          <Card className='w-full p-4 shadow-sm col-span-7'>
            <Controller
              name='product_type'
              control={control}
              render={({ field }) => (
                <>
                  <Radio.Group {...field} className='flex flex-col space-y-3'>
                    <Radio value='all'>Tất cả sản phẩm</Radio>
                    <Radio value='specific'>Sản phẩm cụ thể</Radio>
                  </Radio.Group>
                  {product_type === 'specific' && (
                    <div className='p-4 mt-4 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg'>
                      <Form.Item
                        validateStatus={errors.selected_products ? 'error' : ''}
                        help={errors.selected_products?.message}
                      >
                        <Controller
                          name='selected_products'
                          control={control}
                          render={({ field }) => <ProductListSelector products={products?.data} {...field} />}
                        />
                      </Form.Item>
                    </div>
                  )}
                </>
              )}
            />
          </Card>
        </div>
        <div className='flex justify-end gap-4 mt-10'>
          <Space>
            <Button
              type='default'
              icon={<EyeOutlined />}
              onClick={() => setOpenPreviewModal(true)}
              className='flex items-center gap-2 border-gray-300'
            >
              Xem trước
            </Button>
            <Button
              type='primary'
              icon={<SaveOutlined />}
              onClick={handleSubmit(onSubmit)}
              className='flex items-center gap-2'
              loading={isLoading}
            >
              {id ? 'Cập nhật' : 'Lưu'}
            </Button>
          </Space>
        </div>
      </Form>

      <Modal
        title='Xem trước Quy tắc giá theo số lượng'
        open={openPreviewModal}
        onCancel={() => setOpenPreviewModal(false)}
        width={700}
        footer={[
          <Button key='close' onClick={() => setOpenPreviewModal(false)}>
            Đóng
          </Button>,
        ]}
      >
        {renderPreview()}
      </Modal>
    </div>
  );
};

export default QBEditor;
