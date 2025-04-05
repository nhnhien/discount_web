import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { calculateCPPrice } from '@/utils/caculation';

const ProductListPreview = ({ products, productSelected, variantSelected, discountValue, discountType, productType }) => {
  const renderProductRows = () => {
    const filteredProducts = products?.filter((p) => productSelected.includes(p.id)) || [];

    return filteredProducts.map((product) => ({
      key: `product-${product.id}`,
      name: product.name,
      image_url: product.image_url,
      original_price: product.original_price,
      final_price: calculateCPPrice(product.original_price, discountValue, discountType),
      stock_quantity: product.stock_quantity,
    }));
  };

  const renderVariantRows = () => {
    const variants = [];

    products?.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variantSelected.includes(variant.id)) {
          variants.push({
            key: `variant-${variant.id}`,
            name: `${product.name} - ${variant.sku}`,
            image_url: variant.image_url || product.image_url,
            original_price: variant.original_price,
            final_price: calculateCPPrice(variant.original_price, discountValue, discountType),
            stock_quantity: variant.stock_quantity,
          });
        }
      });
    });

    return variants;
  };

  const dataSource = productType === 'variant' ? renderVariantRows() : renderProductRows();

  const columns = [
    {
      title: productType === 'variant' ? 'Biến thể' : 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className='flex items-center gap-3'>
          <img src={record.image_url} alt={text} className='w-14 h-14 object-cover rounded shadow' />
          <span className='font-medium'>{text}</span>
        </div>
      ),
    },
    {
      title: 'Giá gốc',
      dataIndex: 'original_price',
      key: 'original_price',
      render: (price) => (
        <span className='text-gray-500 line-through'>
          {Number(price).toLocaleString()}đ
        </span>
      ),
    },
    {
      title: 'Giảm giá',
      key: 'discount',
      render: () =>
        discountValue > 0 ? (
          <Tooltip title={`Giảm: ${discountValue} ${discountType === 'percentage' ? '%' : 'đ'}`}>
            <Tag color='red' className='text-sm'>
              -{discountValue}
              {discountType === 'percentage' ? '%' : 'đ'}
            </Tag>
          </Tooltip>
        ) : (
          <span className='text-gray-400'>Không giảm</span>
        ),
    },
    {
      title: 'Giá cuối',
      dataIndex: 'final_price',
      key: 'final_price',
      render: (final) => (
        <span className='text-red-500 font-bold'>
          {Number(final).toLocaleString()}đ
        </span>
      ),
    },
    {
      title: 'Kho',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (qty) => <span className='text-blue-500'>{qty}</span>,
    },
  ];

  return (
    <div className='p-4 bg-white rounded-lg shadow'>
      <Table columns={columns} dataSource={dataSource} rowKey='key' pagination={false} />
    </div>
  );
};

export default ProductListPreview;
