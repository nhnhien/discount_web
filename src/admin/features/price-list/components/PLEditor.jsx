import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Select,
} from 'antd';
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getRule, createRule, updateRule } from '@/service/cp';
import { getProduct } from '@/service/product';
import { getMarket } from '@/service/market';
import ProductPriceTable from '../ProductPriceTable';

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên bảng giá'),
  description: z.string().optional(),
  start_date: z.any(),
  end_date: z.any().nullable(),
  market_type: z.string().default('all'),
  selected_markets: z.array(z.number()).optional(),
});

const PLEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ruleData } = useQuery({
    queryKey: ['price-list', id],
    queryFn: () => getRule(id),
    enabled: !!id,
  });

  const { data: productData } = useQuery({
    queryKey: ['products'],
    queryFn: getProduct,
  });

  const { data: marketData } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarket,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createRule(data, true), // ✅ is_price_list = true
    onSuccess: () => {
      message.success('Tạo bảng giá thành công');
      queryClient.invalidateQueries(['price-list-rules']);
      navigate('/admin/discounts/pl');
    },
    onError: () => {
      message.error('Tạo bảng giá thất bại');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateRule(id, data, true),
    onSuccess: () => {
      message.success('Cập nhật bảng giá thành công');
      queryClient.invalidateQueries(['price-list-rules']);
      queryClient.invalidateQueries(['price-list', id]);
      navigate('/admin/discounts/pl');
    },
    onError: () => {
      message.error('Cập nhật bảng giá thất bại');
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      start_date: dayjs(),
      end_date: null,
      market_type: 'all',
      selected_markets: [],
    },
  });

  const [customPrices, setCustomPrices] = useState([]);

  useEffect(() => {
    if (ruleData?.data) {
      const rule = ruleData.data;
      setValue('title', rule.title);
      setValue('description', rule.description);
      setValue('start_date', dayjs(rule.start_date));
      setValue('end_date', rule.end_date ? dayjs(rule.end_date) : null);
      setValue('selected_markets', rule.markets?.map((m) => m.id) || []);

      const productPrices = rule.products?.map((p) => ({
        product_id: p.id,
        variant_id: null,
        amount: Number(p.CustomPricingProduct?.amount || 0),
      })) || [];

      const variantPrices = rule.variants?.map((v) => ({
        product_id: v.product_id,
        variant_id: v.id,
        amount: Number(v.CustomPricingVariant?.amount || 0),
      })) || [];

      setCustomPrices([...productPrices, ...variantPrices]);
    }
  }, [ruleData, setValue]);

  useEffect(() => {
    if (!id && watch('market_type') === 'all') {
      setValue(
        'selected_markets',
        marketData?.data?.map((m) => m.id) || []
      );
    }
  }, [marketData, id, setValue, watch]);

  const onSubmit = (data) => {
    const validAmounts = customPrices.filter(
      (p) => p.amount !== null && p.amount !== undefined && Number(p.amount) > 0
    );
  
    if (validAmounts.length === 0) {
      message.error('Vui lòng nhập giá cố định cho ít nhất 1 sản phẩm hoặc biến thể');
      return;
    }
  
    const payload = {
      title: data.title,
      description: data.description || '',
      start_date: data.start_date,
      end_date: data.end_date,
      market_ids:
        data.market_type === 'all'
          ? marketData?.data?.map((m) => m.id) || []
          : data.selected_markets,
      product_ids: validAmounts.filter((p) => !p.variant_id).map((p) => p.product_id),
      variant_ids: validAmounts.filter((p) => p.variant_id).map((p) => p.variant_id),
      amounts: validAmounts, // ✅ chỉ gửi các dòng có amount hợp lệ
      discount_type: 'fixed price',
      discount_value: 0,
      priority: 10,
      is_price_list: true,
    };
  
    if (id) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };
  
  

  return (
    <div className='max-w-[1000px] mx-auto px-6 pt-8 pb-16'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold'>{id ? 'Chỉnh sửa' : 'Tạo mới'} Bảng Giá</h2>
        <div className='space-x-3'>
          <Button icon={<RollbackOutlined />} onClick={() => navigate('/admin/discounts/pl')}>
            Quay lại
          </Button>
          <Button
  type='primary'
  icon={<SaveOutlined />}
  onClick={handleSubmit(onSubmit)}
  disabled={customPrices.filter(p => Number(p.amount) > 0).length === 0}
>
  {id ? 'Cập nhật' : 'Lưu'}
</Button>

        </div>
      </div>

      <Form layout='vertical' onFinish={handleSubmit(onSubmit)} className='space-y-6'>
        <Card title='Thông tin cơ bản'>
          <Form.Item
            label='Tên bảng giá'
            validateStatus={errors.title ? 'error' : ''}
            help={errors.title?.message}
            required
          >
            <Controller
              name='title'
              control={control}
              render={({ field }) => <Input {...field} placeholder='Nhập tiêu đề bảng giá' />}
            />
          </Form.Item>

          <Form.Item label='Mô tả'>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} placeholder='Mô tả ngắn về bảng giá' rows={3} />
              )}
            />
          </Form.Item>

          <div className='grid grid-cols-2 gap-4'>
            <Form.Item label='Ngày bắt đầu' required>
              <Controller
                name='start_date'
                control={control}
                render={({ field }) => (
                  <DatePicker {...field} value={field.value} className='w-full' format='DD/MM/YYYY' />
                )}
              />
            </Form.Item>
            <Form.Item label='Ngày kết thúc'>
              <Controller
                name='end_date'
                control={control}
                render={({ field }) => (
                  <DatePicker {...field} value={field.value} className='w-full' format='DD/MM/YYYY' />
                )}
              />
            </Form.Item>
          </div>
        </Card>

        <Card title='Áp dụng cho thị trường'>
          <Form.Item label='Chọn thị trường'>
            <Controller
              name='market_type'
              control={control}
              render={({ field }) => (
                <Radio.Group {...field}>
                  <Radio value='all'>Tất cả thị trường</Radio>
                  <Radio value='specific'>Chọn thị trường cụ thể</Radio>
                </Radio.Group>
              )}
            />
          </Form.Item>

          {watch('market_type') === 'specific' && (
            <Form.Item
              label='Thị trường cụ thể'
              validateStatus={errors?.selected_markets ? 'error' : ''}
              help={errors?.selected_markets?.message}
              required
            >
              <Controller
                name='selected_markets'
                control={control}
                rules={{ required: 'Vui lòng chọn ít nhất một thị trường' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    mode='multiple'
                    placeholder='Chọn thị trường'
                    options={marketData?.data?.map((m) => ({
                      label: m.name === 'VietNam' ? '🇻🇳 Việt Nam' : '🌍 US/UK',
                      value: m.id,
                    }))}
                  />
                )}
              />
            </Form.Item>
          )}
        </Card>

        <Card title='Giá tùy chỉnh theo sản phẩm' className='mt-6'>
          <ProductPriceTable
            products={productData?.data || []}
            customPrices={customPrices}
            setCustomPrices={setCustomPrices}
          />
        </Card>
      </Form>
    </div>
  );
};

export default PLEditor;