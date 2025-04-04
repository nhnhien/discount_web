import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Select,
  Switch,
  message,
} from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  createDiscount,
  getDiscountById,
  updateDiscount,
} from '@/service/discount';
import {
  getProductOptions,
  getVariantOptions,
  getUserOptions,
} from '@/utils/options';

// ✅ Fix lỗi bắt validate sai bằng preprocess
const schema = z.object({
  discount_code: z.string().min(1, 'Mã giảm giá không được để trống'),
  title: z.string().optional(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.preprocess((v) => Number(v || 0), z.number().nonnegative()),
  min_order_amount: z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().optional()),
  max_discount_amount: z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().optional()),
  usage_limit: z.preprocess((v) => (v === '' || v === null ? undefined : Number(v)), z.number().optional()),
  is_active: z.boolean().default(true),
  date_range: z
    .array(z.date())
    .refine((arr) => arr.length === 2, 'Cần chọn ngày bắt đầu và kết thúc'),
  product_ids: z.array(z.number()).optional(),
  variant_ids: z.array(z.number()).optional(),
  user_ids: z.array(z.number()).optional(),
});

const DiscountEditor = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      discount_type: 'percentage',
      is_active: true,
    },
  });

  const { data: discountData } = useQuery({
    queryKey: ['discount', id],
    queryFn: () => getDiscountById(id),
    enabled: !!id,
  });

  const { data: productOptions = [] } = useQuery({
    queryKey: ['product-options'],
    queryFn: getProductOptions,
  });

  const { data: variantOptions = [] } = useQuery({
    queryKey: ['variant-options'],
    queryFn: getVariantOptions,
  });

  const { data: userOptions = [] } = useQuery({
    queryKey: ['user-options'],
    queryFn: getUserOptions,
  });

  useEffect(() => {
    if (discountData?.data) {
      const d = discountData.data;
      reset({
        discount_code: d.discount_code,
        title: d.title || '',
        description: d.description || '',
        discount_type: d.discount_type || 'percentage',
        value: Number(d.value || 0),
        min_order_amount: d.min_order_amount ?? undefined,
        max_discount_amount: d.max_discount_amount ?? undefined,
        usage_limit: d.usage_limit ?? undefined,
        is_active: d.is_active ?? true,
        date_range: [dayjs(d.start_date).toDate(), dayjs(d.end_date).toDate()],
        product_ids: d.products?.map((p) => p.id) || [],
        variant_ids: d.variants?.map((v) => v.id) || [],
        user_ids: d.customers?.map((u) => u.id) || [],
      });
    }
  }, [discountData, reset]);

  const createMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: () => {
      message.success('Tạo mã giảm giá thành công');
      navigate('/admin/discounts');
    },
    onError: () => {
      message.error('Không thể tạo mã giảm giá');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateDiscount(id, data),
    onSuccess: () => {
      message.success('Cập nhật mã giảm giá thành công');
      navigate('/admin/discounts');
    },
    onError: () => {
      message.error('Không thể cập nhật mã giảm giá');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      start_date: data.date_range[0],
      end_date: data.date_range[1],
    };
    delete payload.date_range;

    isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  return (
    <div className="p-6 rounded-lg max-w-[1100px] mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        {isEdit ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá'}
      </h2>
      <Form layout="vertical" className="space-y-6">
        <Card title="Thông tin mã giảm giá" className="shadow-sm">
          <Controller
            name="discount_code"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Mã giảm giá"
                required
                validateStatus={errors.discount_code ? 'error' : ''}
                help={errors.discount_code?.message}
              >
                <Input {...field} />
              </Form.Item>
            )}
          />
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Form.Item label="Tiêu đề">
                <Input {...field} />
              </Form.Item>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Form.Item label="Mô tả">
                <Input.TextArea {...field} rows={3} />
              </Form.Item>
            )}
          />
        </Card>

        <Card title="Thiết lập giảm giá" className="shadow-sm">
          <div className="grid grid-cols-3 gap-6">
            <Controller
              name="discount_type"
              control={control}
              render={({ field }) => (
                <Form.Item label="Loại giảm giá">
                  <Select {...field}>
                    <Select.Option value="percentage">Theo phần trăm</Select.Option>
                    <Select.Option value="fixed">Giảm cố định</Select.Option>
                    <Select.Option value="free_shipping">Miễn phí vận chuyển</Select.Option>
                  </Select>
                </Form.Item>
              )}
            />
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <Form.Item label="Giá trị giảm">
                  <InputNumber
                    {...field}
                    min={0}
                    className="w-full"
                    onChange={(val) => field.onChange(val === null ? undefined : val)}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="usage_limit"
              control={control}
              render={({ field }) => (
                <Form.Item label="Giới hạn sử dụng">
                  <InputNumber
                    {...field}
                    min={0}
                    className="w-full"
                    onChange={(val) => field.onChange(val === null ? undefined : val)}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="min_order_amount"
              control={control}
              render={({ field }) => (
                <Form.Item label="Đơn hàng tối thiểu">
                  <InputNumber
                    {...field}
                    min={0}
                    className="w-full"
                    onChange={(val) => field.onChange(val === null ? undefined : val)}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="max_discount_amount"
              control={control}
              render={({ field }) => (
                <Form.Item label="Mức giảm tối đa">
                  <InputNumber
                    {...field}
                    min={0}
                    className="w-full"
                    onChange={(val) => field.onChange(val === null ? undefined : val)}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Form.Item label="Kích hoạt">
                  <Switch checked={field.value} onChange={field.onChange} />
                </Form.Item>
              )}
            />
            <Controller
              name="date_range"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Thời gian áp dụng"
                  validateStatus={errors.date_range ? 'error' : ''}
                  help={errors.date_range?.message}
                >
                  <DatePicker.RangePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    value={field.value?.map((d) => dayjs(d))}
                    onChange={(dates) => field.onChange(dates?.map((d) => d?.toDate()))}
                  />
                </Form.Item>
              )}
            />
          </div>
        </Card>

        <Card title="Áp dụng cho" className="shadow-sm">
          <Controller
            name="product_ids"
            control={control}
            render={({ field }) => (
<Form.Item label="Sản phẩm">
  <Select
    {...field}
    mode="multiple"
    allowClear
    placeholder="Chọn sản phẩm (để trống để áp dụng cho tất cả)"
    options={productOptions}
  />
</Form.Item>

            )}
          />
          <Controller
            name="variant_ids"
            control={control}
            render={({ field }) => (
              <Form.Item label="Biến thể">
                <Select
                  {...field}
                  mode="multiple"
                  allowClear
                  placeholder="Chọn biến thể"
                  options={variantOptions}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="user_ids"
            control={control}
            render={({ field }) => (
              <Form.Item label="Khách hàng">
                <Select
                  {...field}
                  mode="multiple"
                  allowClear
                  placeholder="Chọn khách hàng"
                  options={userOptions}
                />
              </Form.Item>
            )}
          />
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="default" onClick={() => navigate('/admin/discounts')}>
            Hủy
          </Button>
          <Button
            type="primary"
            loading={createMutation.isLoading || updateMutation.isLoading}
            onClick={() => handleSubmit(onSubmit)()}
          >
            {isEdit ? 'Cập nhật' : 'Tạo'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default DiscountEditor;