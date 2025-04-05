import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Badge, Avatar, Progress, Dropdown, Menu, DatePicker } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  MoreOutlined,
  EyeOutlined,
  FireOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';

const { RangePicker } = DatePicker;

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalSales: 124850000,
    totalOrders: 348,
    totalCustomers: 2145,
    conversionRate: 3.6,
    todayVisitors: 128,
    pendingOrders: 24,
    monthGrowth: 8.2,
    weekGrowth: -2.5,
  });

  const recentOrders = [
    {
      key: '1',
      id: 'ORD-3921',
      customer: { name: 'Đỗ Văn An', avatar: 'https://xsgames.co/randomusers/avatar.php?g=male' },
      date: '15/03/2025',
      amount: 1250000,
      status: 'Đã thanh toán',
    },
    {
      key: '2',
      id: 'ORD-3920',
      customer: { name: 'Nguyễn Thị Lam', avatar: 'https://xsgames.co/randomusers/avatar.php?g=female' },
      date: '15/03/2025',
      amount: 3450000,
      status: 'Đang xử lý',
    },
    {
      key: '3',
      id: 'ORD-3919',
      customer: { name: 'Trần Văn Minh', avatar: 'https://xsgames.co/randomusers/avatar.php?g=male' },
      date: '15/03/2025',
      amount: 890000,
      status: 'Đã vận chuyển',
    },
    {
      key: '4',
      id: 'ORD-3918',
      customer: { name: 'Lê Thị Hồng', avatar: 'https://xsgames.co/randomusers/avatar.php?g=female' },
      date: '14/03/2025',
      amount: 2120000,
      status: 'Đã hủy',
    },
    {
      key: '5',
      id: 'ORD-3917',
      customer: { name: 'Phạm Quang Huy', avatar: 'https://xsgames.co/randomusers/avatar.php?g=male' },
      date: '14/03/2025',
      amount: 1730000,
      status: 'Đã thanh toán',
    },
  ];

  const topProducts = [
    { name: 'Áo thun Unisex', sales: 283, revenue: 24_055_000, growth: 12 },
    { name: 'Quần jean skinny', sales: 258, revenue: 36_120_000, growth: 8 },
    { name: 'Áo khoác bomber', sales: 192, revenue: 38_400_000, growth: 22 },
    { name: 'Áo sơ mi ngắn tay', sales: 168, revenue: 20_160_000, growth: -5 },
    { name: 'Giày thể thao', sales: 143, revenue: 32_890_000, growth: 3 },
  ];

  const revenueData = [
    { month: 'Tháng 1', revenue: 95000000 },
    { month: 'Tháng 2', revenue: 85000000 },
    { month: 'Tháng 3', revenue: 124850000 },
  ];

  const categoryData = [
    { category: 'Áo', value: 124 },
    { category: 'Quần', value: 98 },
    { category: 'Giày dép', value: 65 },
    { category: 'Phụ kiện', value: 42 },
    { category: 'Túi xách', value: 19 },
  ];

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div className='flex items-center'>
          <Avatar src={customer.avatar} />
          <span className='ml-2'>{customer.name}</span>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Giá trị',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'Đã thanh toán':
            color = 'green';
            break;
          case 'Đang xử lý':
            color = 'blue';
            break;
          case 'Đã vận chuyển':
            color = 'gold';
            break;
          case 'Đã hủy':
            color = 'red';
            break;
          default:
            color = 'default';
        }
        return <Badge color={color} text={status} />;
      },
    },
    {
      title: '',
      key: 'action',
      render: () => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key='1'>Xem chi tiết</Menu.Item>
              <Menu.Item key='2'>Cập nhật trạng thái</Menu.Item>
              <Menu.Item key='3' danger>
                Hủy đơn
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOutlined className='cursor-pointer text-lg' />
        </Dropdown>
      ),
    },
  ];
  const revenueConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'revenue',
    smooth: true,
    meta: {
      revenue: {
        formatter: (v) => `${(v / 1000000).toFixed(1)}M`,
      },
    },
    color: '#1890ff',
    areaStyle: {
      fill: 'l(270) 0:#1890ff 0.5:#1890ff 1:rgba(255,255,255,0.1)',
    },
  };

  const categoryConfig = {
    data: categoryData,
    xField: 'category',
    yField: 'value',
    color: '#5B8FF9',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      value: {
        alias: 'Số lượng đơn hàng',
      },
    },
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='mb-6 flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-800'>Dashboard</h1>
        <RangePicker className='w-64' placeholder={['Từ ngày', 'Đến ngày']} />
      </div>

      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className='shadow-sm hover:shadow-md transition-shadow'>
            <Statistic
              title={<span className='text-gray-600 font-medium'>Tổng doanh thu</span>}
              value={stats.totalSales}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix='₫'
              formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <div className='mt-2 flex items-center'>
              <span className={`text-${stats.monthGrowth >= 0 ? 'green' : 'red'}-500 mr-1`}>
                {stats.monthGrowth >= 0 ? '+' : ''}
                {stats.monthGrowth}%
              </span>
              <span className='text-gray-500 text-xs'>từ tháng trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className='shadow-sm hover:shadow-md transition-shadow'>
            <Statistic
              title={<span className='text-gray-600 font-medium'>Tổng đơn hàng</span>}
              value={stats.totalOrders}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
            <div className='mt-2 flex items-center'>
              <span className={`text-${stats.weekGrowth >= 0 ? 'green' : 'red'}-500 mr-1`}>
                {stats.weekGrowth >= 0 ? '+' : ''}
                {stats.weekGrowth}%
              </span>
              <span className='text-gray-500 text-xs'>từ tuần trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className='shadow-sm hover:shadow-md transition-shadow'>
            <Statistic
              title={<span className='text-gray-600 font-medium'>Tổng khách hàng</span>}
              value={stats.totalCustomers}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
            />
            <div className='mt-2 flex justify-between items-center'>
              <div className='flex items-center'>
                <Badge color='green' className='mr-1' />
                <span className='text-gray-500 text-xs'>Mới hôm nay: {stats.todayVisitors}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className='shadow-sm hover:shadow-md transition-shadow'>
            <Statistic
              title={<span className='text-gray-600 font-medium'>Đơn chờ xử lý</span>}
              value={stats.pendingOrders}
              valueStyle={{ color: '#faad14' }}
              prefix={<ShoppingOutlined />}
            />
            <div className='mt-2'>
              <Progress
                percent={Math.round((stats.pendingOrders / stats.totalOrders) * 100)}
                showInfo={false}
                strokeColor='#faad14'
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={24} lg={16}>
          <Card
            title={<span className='font-semibold text-gray-700'>Doanh thu theo thời gian</span>}
            className='shadow-sm'
            extra={
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key='1'>7 ngày qua</Menu.Item>
                    <Menu.Item key='2'>30 ngày qua</Menu.Item>
                    <Menu.Item key='3'>3 tháng qua</Menu.Item>
                  </Menu>
                }
              >
                <span className='cursor-pointer text-blue-500 text-sm'>3 tháng qua ▾</span>
              </Dropdown>
            }
          >
            <div className='h-[300px]'>
              <Line {...revenueConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span className='font-semibold text-gray-700'>Đơn hàng theo danh mục</span>}
            className='shadow-sm h-full'
          >
            <div className='h-[300px]'>
              <Column {...categoryConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Đơn hàng gần đây */}
      <Row gutter={[16, 16]} className='mb-6'>
        <Col span={24}>
          <Card
            title={<span className='font-semibold text-gray-700'>Đơn hàng gần đây</span>}
            className='shadow-sm'
            extra={
              <a href='#' className='text-blue-500 text-sm'>
                Xem tất cả
              </a>
            }
          >
            <Table dataSource={recentOrders} columns={orderColumns} pagination={false} className='custom-table' />
          </Card>
        </Col>
      </Row>

      {/* Sản phẩm bán chạy */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={<span className='font-semibold text-gray-700'>Sản phẩm bán chạy</span>}
            className='shadow-sm'
            extra={
              <a href='#' className='text-blue-500 text-sm'>
                Xem tất cả
              </a>
            }
          >
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Sản phẩm
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Số lượng bán
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Doanh thu
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Tăng trưởng
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Xu hướng
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {topProducts.map((product, index) => (
                    <tr key={index} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-lg'>
                            <span className='text-blue-500 font-semibold'>{index + 1}</span>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>{product.sales}</div>
                        <div className='text-xs text-gray-500'>sản phẩm</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            product.revenue,
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={`text-sm ${product.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {product.growth > 0 ? '+' : ''}
                          {product.growth}%
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {product.growth > 15 ? (
                          <FireOutlined className='text-red-500 text-lg' title='Bán chạy' />
                        ) : product.growth > 5 ? (
                          <RiseOutlined className='text-green-500 text-lg' title='Tăng trưởng tốt' />
                        ) : product.growth < 0 ? (
                          <ArrowDownOutlined className='text-red-500 text-lg' title='Đang giảm' />
                        ) : (
                          <ArrowUpOutlined className='text-green-500 text-lg' title='Đang tăng' />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardAdmin;
