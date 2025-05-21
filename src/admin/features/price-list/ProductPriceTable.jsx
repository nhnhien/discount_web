import React, { useEffect, useMemo, useState } from 'react';
import { Table, InputNumber, Checkbox, Typography, Image, Tag } from 'antd';

const ProductPriceTable = ({ products = [], customPrices = [], setCustomPrices }) => {
  const [selectedKeys, setSelectedKeys] = useState([]);

  // ✅ Đồng bộ selectedKeys khi customPrices thay đổi (edit mode)
  useEffect(() => {
    const keys = customPrices.map((item) =>
      item.variant_id ? `variant-${item.variant_id}` : `product-${item.product_id}`
    );
    setSelectedKeys(keys);
  }, [customPrices]);

  const getAmount = (item) => {
    const match = customPrices.find((p) =>
      item.variant_id !== undefined && item.variant_id !== null
        ? p.variant_id === item.variant_id
        : p.product_id === item.product_id && !p.variant_id
    );
    return match ? Number(match.amount) : null;
  };

  const handleAmountChange = (item, value) => {
    const updated = [...customPrices];
    const index = updated.findIndex((p) =>
      item.variant_id !== undefined && item.variant_id !== null
        ? p.variant_id === item.variant_id
        : p.product_id === item.product_id && !p.variant_id
    );

    if (index !== -1) {
      updated[index].amount = value;
    } else {
      updated.push({
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        amount: value,
      });
    }

    setCustomPrices(updated);
  };

  const handleCheckboxChange = (item, checked) => {
    const key = item.key;
    let updatedKeys = [...selectedKeys];

    if (checked) {
      updatedKeys.push(key);
      handleAmountChange(item, getAmount(item));
    } else {
      updatedKeys = updatedKeys.filter((k) => k !== key);
      setCustomPrices((prev) =>
        prev.filter((p) =>
          item.variant_id !== undefined && item.variant_id !== null
            ? p.variant_id !== item.variant_id
            : p.product_id !== item.product_id || p.variant_id
        )
      );
    }

    setSelectedKeys(updatedKeys);
  };

  const productColumns = [
    {
      title: '',
      dataIndex: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedKeys.includes(record.key)}
          onChange={(e) => handleCheckboxChange(record, e.target.checked)}
        />
      ),
    },
    {
      title: 'Product',
      dataIndex: 'name',
      render: (_, record) => (
        <div className='flex items-center gap-2'>
          {record.image_url && (
            <Image
              src={record.image_url}
              alt={record.name}
              width={40}
              height={40}
              preview={false}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <div>
            <Typography.Text strong>{record.name}</Typography.Text>
            {record.variant_name && (
              <div className='text-xs text-gray-500'>{record.variant_name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Attributes',
      dataIndex: 'attributes',
      render: (_, record) =>
        record.attributes?.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {record.attributes.map((attr, i) => (
              <Tag key={i} color='blue'>
                {attr.attribute_name}: {attr.value}
              </Tag>
            ))}
          </div>
        ) : (
          <Typography.Text type='secondary'>None</Typography.Text>
        ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      render: (sku) => <Typography.Text code>{sku}</Typography.Text>,
    },
    {
      title: 'Custom Price (₫)',
      dataIndex: 'amount',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={getAmount(record)}
          onChange={(value) => handleAmountChange(record, Number(value) || 0)}
          disabled={!selectedKeys.includes(record.key)}
          style={{ width: '100%' }}
          placeholder='Enter price'
        />
      ),
    },
  ];

  const data = useMemo(() => {
    const flat = [];

    products.forEach((product) => {
      if (product.variants?.length > 0) {
        flat.push({
          key: `product-${product.id}`,
          id: product.id,
          name: product.name,
          image_url: product.image_url,
          children: product.variants.map((variant) => ({
            key: `variant-${variant.id}`,
            product_id: product.id,
            variant_id: variant.id,
            name: product.name,
            image_url: variant.image_url,
            sku: variant.sku,
            variant_name: variant.sku,
            attributes: variant.attributes || [],
          })),
        });
      } else {
        flat.push({
          key: `product-${product.id}`,
          product_id: product.id,
          variant_id: null,
          name: product.name,
          image_url: product.image_url,
          sku: product.sku,
          attributes: [],
        });
      }
    });

    return flat;
  }, [products]);

  return (
    <Table
      columns={productColumns}
      dataSource={data}
      rowKey='key'
      pagination={{ pageSize: 20, showSizeChanger: true }}
      scroll={{ y: 600 }}
    />
  );
};

export default ProductPriceTable;