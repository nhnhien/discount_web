import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Input, DatePicker, Button, Radio, Card, Form, Modal, Select, message } from 'antd';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMarket } from '@/service/market';
import { getProduct } from '@/service/product';
import { getCustomer } from '@/service/user';
import ProductListPreview from './ProductListPreview';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomerModal from './CustomerModal';
import ProductModal from './ProductModal';
import { useTranslation } from 'react-i18next';
import ProductSelector from './ProductSelector';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { createRule, getRule, updateRule } from '@/service/cp';
import { useNavigate, useParams } from 'react-router-dom';

const transformData = (data) => {
  return {
    title: data.title || '',
    discount_type: data.discount_type || 'percentage',
    discount_value: Number(data.discount_value) || 0,
    start_date: dayjs(data.start_date),
    end_date: dayjs(data.end_date),

    customer_type: data.customers?.length ? 'specific' : 'all',
    selected_customers: data.customers?.map((customer) => customer.id) || [],

    market_type: data.markets?.length ? 'specific' : 'all',
    selected_markets: data.markets?.map((market) => market.id) || [],

    product_type: data.products?.length ? 'specific' : 'product',
    selected_products: data.products?.map((product) => product.id) || [],
  };
};

const CPEditor = ({ initialData = {} }) => {
  const { id } = useParams();
  console.log(id);

  const { data: cpEditData } = useQuery({ queryKey: ['rule', id], queryFn: () => getRule(id), enabled: !!id });

  const navigate = useNavigate();
  const { t } = useTranslation();

  const CPFormSchema = z.object({
    title: z.string().min(1, { message: 'Tên chương trình không được để trống' }),
    discount_type: z.string(),
    discount_value: z.number().min(0, { message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0' }),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    customer_type: z.string(),
    selected_customers: z.array(z.number()).min(1, { message: 'Chọn ít nhất 1 khách hàng' }),
    market_type: z.string(),
    selected_markets: z.array(z.number()).min(1, { message: 'Chọn ít nhất 1 thị trường' }),
    product_type: z.string(),
    selected_products: z.array(z.number()).min(1, { message: 'Chọn ít nhất 1 sản phẩm' }),
  });
  const defaultValues = useMemo(() => {
    return cpEditData?.data
      ? transformData(cpEditData.data)
      : {
          title: '',
          discount_type: 'percentage',
          discount_value: 0,
          start_date: dayjs(),
          end_date: dayjs(),
          customer_type: 'all',
          selected_customers: [],
          market_type: 'all',
          selected_markets: [],
          product_type: 'product',
          selected_products: [],
        };
  }, [cpEditData]);

  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [openPreviewProduct, setOpenPreviewProduct] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
    resolver: zodResolver(CPFormSchema),
  });

  useEffect(() => {
    if (defaultValues && defaultValues.selected_markets.length > 0) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const customer_type = useWatch({ control, name: 'customer_type' });
  const selected_customers = useWatch({ control, name: 'selected_customers' });
  const selected_products = useWatch({ control, name: 'selected_products' });
  const selected_markets = useWatch({ control, name: 'selected_markets' });
  const discount_type = watch('discount_type');
  const market_type = watch('market_type');
  const product_type = watch('product_type');
  const discount_value = watch('discount_value');

  const { data: markets } = useQuery({ queryKey: ['markets'], queryFn: getMarket });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: getProduct });
  const productsNoVariant = useMemo(() => {
    return products?.data?.filter((p) => !p.has_variant) || [];
  }, [products]);

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomer,
  });

  const createCPMutation = useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      message.success('Tạo chương trình giảm giá thành công');
      navigate('/admin/discounts/cp');
    },
    onError: (error) => {
      message.error('Tạo chương trình giảm giá thất bại');
    },
  });

  const updateCPMutation = useMutation({
    mutationFn: (data) => updateRule(id, data),
    onSuccess: () => {
      message.success('Cập nhật chương trình giảm giá thành công');
      navigate('/admin/discounts/cp');
    },
    onError: (error) => {
      message.error('Cập nhật chương trình giảm giá thất bại');
    },
  });
  const allMarkets = useMemo(() => markets?.data?.map((m) => m.id) || [], [markets]);
  const allCustomerIds = useMemo(() => customers?.data?.map((c) => c.id) || [], [customers]);
  const allProductIds = useMemo(() => products?.data?.map((p) => p.id) || [], [products]);
  const onSubmit = async (data) => {
    const formattedData = {
      title: data.title,
      description: data.description ?? '',
      discount_type: data.discount_type,
      discount_value: Number(data.discount_value),
      market_ids: data.selected_markets,
      customer_ids: data.selected_customers,
      product_ids: data.selected_products,
      // variant_ids: [], // nếu sau này có thể mở rộng
      start_date: data.start_date,
      end_date: data.end_date,
      is_price_list: false, // ✅ đúng cho Custom Pricing
    };
  
    if (id) {
      updateCPMutation.mutate(formattedData);
    } else {
      createCPMutation.mutate(formattedData);
    }
  };
  
  
  
  

  useEffect(() => {
    if (!id) {
      switch (market_type) {
        case 'all': {
          setValue('selected_markets', allMarkets);
          break;
        }
        case 'specific': {
          setValue('selected_markets', []);
          break;
        }
        default: {
          setValue('selected_markets', []);
          break;
        }
      }
    }
  }, [market_type, setValue, allMarkets, markets, id]);

  useEffect(() => {
    if (!id) {
      switch (customer_type) {
        case 'all':
          setValue('selected_customers', allCustomerIds);
          break;
        case 'specific':
          setValue('selected_customers', []);
          break;
        default:
          setValue('selected_customers', []);
          break;
      }
    }
  }, [customer_type, setValue, allCustomerIds, customers, id]);

  useEffect(() => {
    if (!id) {
      switch (product_type) {
        case 'product':
          setValue('selected_products', allProductIds);
          break;
        case 'specific':
          setValue('selected_products', []);
          break;
      }
    }
  }, [watch, setValue, allProductIds, product_type, id]);

  return (
    <div className='p-6 rounded-lg max-w-[1100px] mx-auto max-h-[80vh] '>
      <h2 className='text-2xl font-semibold mb-6'>{initialData.id ? 'Chỉnh sửa' : 'Tạo mới'} Custom Pricing</h2>
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-12 gap-6'>
          <label className='ml-4 font-medium text-base col-span-5'>{t('cp.general_info')}</label>
          <Card className='w-full space-y-4 p-4 shadow-sm col-span-7'>
            <Controller
              name='title'
              control={control}
              rules={{ required: 'Tên chương trình không được để trống' }}
              render={({ field }) => (
                <Form.Item
                  label='Tên giảm giá'
                  required
                  validateStatus={errors.title ? 'error' : ''}
                  help={errors.title?.message}
                >
                  <Input {...field} placeholder='Nhập tên chương trình' />
                </Form.Item>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='start_date'
                control={control}
                render={({ field }) => (
                  <Form.Item label={t('general.start_date')} required>
                    <DatePicker
                      {...field}
                      className='w-full'
                      showTime
                      format='DD/MM/YYYY HH:mm'
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                )}
              />

              <Controller
                name='end_date'
                control={control}
                render={({ field }) => (
                  <Form.Item label={t('general.end_date')} required>
                    <DatePicker
                      {...field}
                      className='w-full'
                      showTime
                      format='DD/MM/YYYY HH:mm'
                      disabledDate={(current) => current && current < watch('start_date')}
                    />
                  </Form.Item>
                )}
              />
            </div>
          </Card>
        </div>

        <div className='grid grid-cols-12 gap-6'>
          <label className='ml-4 font-medium text-base col-span-5'>{t('cp.discount_type')}</label>
          <Card className='w-full p-4 shadow-sm space-y-4 col-span-7'>
            <Controller
              name='discount_type'
              control={control}
              render={({ field }) => (
                <Radio.Group {...field} className='flex flex-col space-y-3'>
                  <Radio value='percentage'>{t('cp.percentage_discount')}</Radio>
                  <Radio value='fixed price'>{t('cp.amount_discount')}</Radio>
                </Radio.Group>
              )}
            />

            <div className='pt-4'>
              <Controller
                name='discount_value'
                control={control}
                rules={{
                  min: { value: 0, message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0' },
                  max:
                    watch('discount_type') === 'percentage'
                      ? { value: 100, message: 'Giá trị giảm giá phải nhỏ hơn hoặc bằng 100%' }
                      : undefined,
                }}
                render={({ field }) => (
                  <Form.Item
                    label='Giá trị'
                    required
                    validateStatus={errors.discount_value ? 'error' : ''}
                    help={errors.discount_value?.message}
                  >
                    <Input
                      {...field}
                      type='number'
                      min={0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value ?? ''}
                      placeholder={`Nhập ${watch('discount_type') === 'percentage' ? 'phần trăm' : 'số tiền'}`}
                      addonAfter={watch('discount_type') === 'percentage' ? '%' : 'VND'}
                    />
                  </Form.Item>
                )}
              />
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
                  <Radio value='all'>{t('cp.all_market')}</Radio>
                  <Radio value='specific'>{t('cp.specific_market')}</Radio>
                </Radio.Group>
              )}
            />

            <div className='pt-4'>
              {market_type === 'specific' && (
                <Form.Item
                  validateStatus={errors.selected_markets ? 'error' : ''}
                  help={errors.selected_markets?.message}
                >
                  <Controller
                    name='selected_markets'
                    control={control}
                    rules={{
                      validate: (value) => value?.length > 0 || 'Chọn ít nhất 1 thị trường',
                    }}
                    render={({ field }) => {
                      return (
                        <Select
                          mode='multiple'
                          placeholder='Chọn thị trường'
                          options={markets?.data?.map((m) => ({
                            label: m.name === 'VietNam' ? '🇻🇳 VN' : '🇬🇧 US-UK',
                            value: m.id,
                          }))}
                          value={field.value}
                          onChange={(values) => {
                            field.onChange(values);
                          }}
                        />
                      );
                    }}
                  />
                </Form.Item>
              )}
            </div>
          </Card>
        </div>
        <div className='grid grid-cols-12 gap-6 '>
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
                      <Form.Item
                        validateStatus={errors.selected_customers ? 'error' : ''}
                        help={errors.selected_customers?.message}
                      >
                        <Controller
                          name='selected_customers'
                          control={control}
                          rules={{
                            validate: (value) => value?.length > 0 || 'Chon ít nhất 1 khách hàng',
                          }}
                          render={({ field }) => (
                            <Select
                              mode='multiple'
                              placeholder='Chọn khach hàng'
                              options={customers?.data?.map((m) => ({
                                label: m.name,
                                value: m.id,
                              }))}
                              {...field}
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
                    <Radio value='product'>Tất cả sản phẩm</Radio>
                    <Radio value='specific'>Sản phẩm cụ thể</Radio>
                  </Radio.Group>
                  {product_type === 'specific' && (
  <div className='p-4 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg'>
    <label className='ml-4 font-medium text-base'>Áp dụng cho sản phẩm</label>
    <Form.Item
      validateStatus={errors.selected_products ? 'error' : ''}
      help={errors.selected_products?.message}
    >
      <Controller
        name='selected_products'
        control={control}
        rules={{
          validate: (value) => value?.length > 0 || 'Chọn ít nhất 1 sản phẩm',
        }}
        render={({ field }) => (
          <ProductSelector products={productsNoVariant} {...field} />
        )}
      />
    </Form.Item>
  </div>
)}

                </>
              )}
            />
          </Card>
        </div>

        <CustomerModal
          control={control}
          customers={customers}
          isVisible={isCustomerModalVisible}
          onClose={() => setIsCustomerModalVisible(false)}
          selectedCustomers={selected_customers}
        />
        <ProductModal
          control={control}
          products={products}
          isVisible={isProductModalVisible}
          onClose={() => setIsProductModalVisible(false)}
          selectedProducts={selected_products}
        />

        <div className='flex justify-end gap-4 my-20'>
          <div className='text-center'>
            <Space>
              <Button
                type='default'
                icon={<EyeOutlined />}
                onClick={() => setOpenPreviewProduct(true)}
                className='flex items-center gap-2 border-gray-300'
              >
                Xem trước
              </Button>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => {
                  handleSubmit(onSubmit)();
                }}
                className='flex items-center gap-2'
              >
                Tạo
              </Button>
            </Space>
            <Modal
              title='Danh sách sản phẩm được áp dụng'
              open={openPreviewProduct}
              onCancel={() => setOpenPreviewProduct(false)}
              width={800}
            >
              {products && (
                <ProductListPreview
                  discountType={discount_type}
                  discountValue={discount_value}
                  customers={selected_customers}
                  products={productsNoVariant}
                  productSelected={selected_products}
                />
              )}
            </Modal>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CPEditor;