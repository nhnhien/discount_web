import { Table, Checkbox, Image, Typography } from 'antd';

const ProductSelector = ({ value = [], onChange, products }) => {
  const toggleProduct = (productId) => {
    const newSelected = value.includes(productId)
      ? value.filter((id) => id !== productId)
      : [...value, productId];
    onChange(newSelected);
  };

  const columns = [
    {
      title: 'Select',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <Checkbox
          checked={value.includes(id)}
          onChange={() => toggleProduct(id)}
          disabled={record.has_variant}
        />
      ),
    },
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className='flex items-center space-x-3'>
          <Image src={record.image_url} width={50} height={50} className='rounded-md object-cover' />
          <Typography.Text strong>
            {record.name}
            {record.has_variant && (
              <span className='ml-2 text-xs text-gray-500'>(Has variants - not applicable)</span>
            )}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'original_price',
      key: 'original_price',
      render: (price) => (
        <span className='text-red-500'>{Number(price).toLocaleString()}đ</span>
      ),
    },
  ];

  return <Table columns={columns} dataSource={products} rowKey='id' pagination={false} />;
};

export default ProductSelector;
