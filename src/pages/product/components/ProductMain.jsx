import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const ProductMain = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Title level={2}>Hello from ProductMain 👋</Title>
      <p>Welcome to the Product Section</p>
    </div>
  );
};

export default ProductMain;
