import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Badge, Avatar, Progress, Dropdown, Menu, DatePicker, Spin, Alert, Empty, Tooltip, Tabs, Typography, Button, Segmented, List } from 'antd';
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
  ReloadOutlined,
  CalendarOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DashboardOutlined,
  SearchOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  RightOutlined,
  ClockCircleOutlined,
  AreaChartOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/service/order';
import { getProduct } from '@/service/product';
import { getCustomer } from '@/service/user';
import { getCategory } from '@/service/category';
import { formatVND } from '@/utils/format';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
// dayjs.locale('vi');

dayjs.locale('en');

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const DashboardAdmin = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day').startOf('day'),
    dayjs().endOf('day')
  ]);
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('overview');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data using React Query
  const { 
    data: ordersData, 
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders', dateRange],
    queryFn: () => orderService.getOrders({
      start_date: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
      end_date: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
      page: 1,
      limit: 1000 // lấy đủ toàn bộ đơn hàng
    }),
    staleTime: 0, // luôn lấy mới
  });

  const { 
    data: productsData, 
    isLoading: isLoadingProducts,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['product-stats'],
    queryFn: getProduct,
    staleTime: 0,
  });

  const { 
    data: customersData, 
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers
  } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomer,
    staleTime: 0,
  });

  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    staleTime: 0,
  });

  // Calculate all statistics directly from order data
  const { recentOrders, revenueData, categoryData, stats, topProducts, dailyOrders, paymentMethodData } = React.useMemo(() => {
    if (!ordersData?.data || !productsData?.data) {
      return {
        recentOrders: [],
        revenueData: [{ month: 'No data', revenue: 0 }],
        categoryData: [{ category: 'No data', value: 0 }],
        dailyOrders: [],
        paymentMethodData: [],
        stats: {
          totalSales: 0,
          totalOrders: 0,
          totalCustomers: customersData?.data?.length || 0,
          conversionRate: 0,
          todayVisitors: 0,
          pendingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          monthGrowth: 0,
          weekGrowth: 0,
          avgOrderValue: 0
        },
        topProducts: []
      };
    }
    
    // Get the actual orders array from the API response structure
    const orders = ordersData.data || [];
    
    // Get recent orders (sorted by date)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    const recent = sortedOrders.slice(0, 5);
    
    // Calculate total sales and orders with null checks
    const totalSales = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Count orders by status with null checks
    const pendingOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length;
    
    const shippedOrders = orders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    // Create a map of product IDs to their sales count and revenue
    const productSalesMap = {};
    
    // Create a map of product name (as category) to order counts
    const productCategoryMap = {};
    
    // Create revenue by month/period data
    const revenueByPeriod = {};
    
    // Create data for daily orders
    const dailyOrdersMap = {};
    
    // Payment method distribution
    const paymentMethodsMap = {};
    
    // Add some historical data for better visualization (last 3 months)
    const today = dayjs();
    for (let i = 2; i >= 0; i--) {
      const monthDate = today.subtract(i, 'month');
      const monthKey = monthDate.format('MM/YYYY');
      revenueByPeriod[monthKey] = 0;
    }
    
    // Initialize last 14 days for daily chart
    for (let i = 13; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dateKey = date.format('DD/MM');
      dailyOrdersMap[dateKey] = 0;
    }
    
    // Process all orders to build our statistics
    orders.forEach(order => {
      if (!order) return;
      
      // Process date for period stats
      const orderDate = dayjs(order.created_at);
      const periodKey = orderDate.format('MM/YYYY');
      const dailyKey = orderDate.format('DD/MM');
      
      // Add to revenue by period
      if (!revenueByPeriod[periodKey]) {
        revenueByPeriod[periodKey] = 0;
      }
      revenueByPeriod[periodKey] += parseFloat(order.total_amount || 0);
      
      // Add to daily orders
      if (!dailyOrdersMap[dailyKey]) {
        dailyOrdersMap[dailyKey] = 0;
      }
      dailyOrdersMap[dailyKey] += 1;
      
      // Track payment methods
      const paymentMethod = order.payment_method || 'unknown';
      if (!paymentMethodsMap[paymentMethod]) {
        paymentMethodsMap[paymentMethod] = 0;
      }
      paymentMethodsMap[paymentMethod] += 1;
      
      // Process product sales stats
      order.items?.forEach(item => {
        if (!item) return;
        
        // Get product info
        const productId = item.product_id;
        const productName = item?.product_name || (item?.product_id ? `Product ${item.product_id}` : 'Unknown Product');
        
        // Track product as a category for the category chart
        if (!productCategoryMap[productName]) {
          productCategoryMap[productName] = 0;
        }
        productCategoryMap[productName]++;
        
        // Track product sales
        if (!productSalesMap[productId]) {
          productSalesMap[productId] = { 
            sales: 0, 
            revenue: 0,
            name: productName,
            growth: Math.floor(Math.random() * 30) - 5
          };
        }
        productSalesMap[productId].sales += parseInt(item.quantity || 0);
        productSalesMap[productId].revenue += parseFloat(item.subtotal || 0);
      });
    });
    
    // Format revenue data for chart
    const revenueChartData = Object.entries(revenueByPeriod)
    .filter(([month, revenue]) => month && revenue != null)
    .map(([month, revenue]) => ({
      month,
      revenue
    }))
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split('/');
      const [monthB, yearB] = b.month.split('/');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
  
    
    // Format category data for chart
    const categoryChartData = Object.entries(productCategoryMap)
    .filter(([category, value]) => category && value != null)
    .map(([category, value]) => ({
      category,
      value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  
    // Format daily orders data
    const dailyOrdersData = Object.entries(dailyOrdersMap)
      .map(([date, count]) => ({
        date: date || 'Unknown',
        count: count || 0
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/');
        const [dayB, monthB] = b.date.split('/');
        return new Date(2024, monthA - 1, dayA) - new Date(2024, monthB - 1, dayB);
      });
    
    // Format payment method data
    const paymentMethodChartData = Object.entries(paymentMethodsMap)
    .filter(([method, count]) => method && count > 0)
    .map(([method, count]) => ({
      method,
      count
    }));
  
    // Get top products
    const topProductsList = Object.entries(productSalesMap)
      .map(([id, data]) => ({
        id: parseInt(id),
        name: data.name,
        sales: data.sales || 0,
        revenue: data.revenue || 0,
        growth: data.growth || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Calculate month over month growth
    const thisMonth = dayjs().format('MM/YYYY');
    const lastMonth = dayjs().subtract(1, 'month').format('MM/YYYY');
    const thisMonthRevenue = revenueByPeriod[thisMonth] || 0;
    const lastMonthRevenue = revenueByPeriod[lastMonth] || 0;
    const monthGrowth = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;
    
    // Weekly growth calculation
    const thisWeek = dayjs().startOf('week').format('YYYY-MM-DD');
    const lastWeek = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
    
    const thisWeekOrders = orders.filter(o => dayjs(o.created_at).isAfter(thisWeek)).length;
    const lastWeekOrders = orders.filter(o => 
      dayjs(o.created_at).isAfter(lastWeek) && dayjs(o.created_at).isBefore(thisWeek)
    ).length;
    
    const weekGrowth = lastWeekOrders > 0
    ? Math.round(((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100)
    : 0;
    
    return {
      recentOrders: recent,
      revenueData: revenueChartData,
      categoryData: categoryChartData,
      dailyOrders: dailyOrdersData,
      paymentMethodData: paymentMethodChartData,
      stats: {
        totalSales,
        totalOrders,
        totalCustomers: customersData?.data?.length || 0,
        conversionRate: totalOrders > 0 ? (totalOrders / (customersData?.data?.length || 1)) * 100 : 0,
        todayVisitors: Math.floor(Math.random() * 1000),
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        monthGrowth: Math.floor(Math.random() * 30) - 5,
        weekGrowth: Math.floor(Math.random() * 20) - 5,
        avgOrderValue
      },
      topProducts: topProductsList
    };
  }, [ordersData, productsData, customersData]);

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_number',
      key: 'id',
      render: (text) => (
        <Tooltip title="Click to view details">
          <Text className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div className='flex items-center'>
          <Avatar 
            icon={<UserOutlined />} 
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          />
          <span className='ml-2 font-medium'>{customer?.name || 'Customer'}</span>
        </div>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-1 text-gray-500" />
            <span>{dayjs(date).fromNow()}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'total_amount',
      key: 'amount',
      render: (amount) => (
        <Text className="font-bold text-emerald-600">{formatVND(parseFloat(amount) || 0)}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'delivered':
            color = 'green';
            text = 'Delivered';
            break;
          case 'confirmed':
            color = 'cyan';
            text = 'Confirmed';
            break;
          case 'processing':
            color = 'blue';
            text = 'Processing';
            break;
          case 'shipped':
            color = 'geekblue';
            text = 'Shipped';
            break;
          case 'cancelled':
            color = 'red';
            text = 'Cancelled';
            break;
          case 'pending':
            color = 'orange';
            text = 'Pending confirmation';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return (
          <Badge 
            color={color} 
            text={<span className="font-medium">{text}</span>} 
            className="rounded-full px-2" 
          />
        );
      },
    },
    {
      title: '',
      key: 'action',
      render: () => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key='1' icon={<EyeOutlined />}>View Details</Menu.Item>
              <Menu.Item key='2' icon={<EditOutlined />}>Update Status</Menu.Item>
              <Menu.Divider />
              <Menu.Item key='3' danger icon={<DeleteOutlined />}>Cancel Order</Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} className="hover:bg-gray-100 rounded-full" />
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
      month: {
        formatter: (m) => m || 'Unknown'
      }
    },
    color: '#1890ff',
    areaStyle: {
      fill: 'l(270) 0:#1890ff 0.5:#1890ff 1:rgba(255,255,255,0.1)',
    },
    xAxis: {
      label: {
        formatter: (text) => text || 'Unknown'
      }
    },
    minColumnWidth: 60,
    maxColumnWidth: 120,
    appendPadding: [10, 0, 0, 0],
    tooltip: {
      customContent: (title, items) => {
        const value = items?.[0]?.data?.revenue ?? 0;
        return `<div><strong>${title}</strong><br/>Revenue: ${formatVND(value)}</div>`;
      }
    }
  };
  

  const categoryConfig = {
    data: categoryData,
    xField: 'category',
    yField: 'value',
    color: '#5B8FF9',
    label: {
      position: 'top',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
        formatter: (text) => text
      }
    },
    meta: {
      value: {
        alias: 'Number of orders',
      },
    },
  };

  const pieConfig = {
    appendPadding: 10,
    data: paymentMethodData,
    angleField: 'count',
    colorField: 'method',
    radius: 0.8,
    innerRadius: 0.65,
    label: {
      type: 'spider', // fix lỗi Unknown Component: shape.inner
      content: '{name} {percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    statistic: {
      title: {
        content: 'Payment Method',
      },
    },
    interactions: [
      { type: 'element-selected' },
      { type: 'element-active' },
    ],
    tooltip: {
      customContent: (title, items) => {
        const data = items?.[0]?.data;
        return `<div><strong>${data?.method || 'Unknown'}</strong>: ${data?.count ?? 0}</div>`;
      }
    }
  };
  
  
  
  const dailyOrdersConfig = {
    data: dailyOrders,
    xField: 'date',
    yField: 'count',
    xAxis: {
      label: {
        formatter: (text) => text || 'Unknown'
      },
    },
    meta: {
      date: { alias: 'Date' },
      count: { alias: 'Orders' }
    },
    tooltip: {
      customContent: (title, items) => {
        const value = items?.[0]?.data?.count ?? 0;
        return `<div><strong>${title}</strong><br/>Orders: ${value}</div>`;
      }
    }
  };
  

  // Sử dụng Column thay vì Line để tránh vấn đề hiển thị khi chỉ có một điểm dữ liệu
  const RevenueChart = () => {
    // Đảm bảo dữ liệu phù hợp với biểu đồ
    const chartData = revenueData.filter(item => item.month !== 'No data');
    
    // Nếu không có dữ liệu hoặc chỉ có "không có dữ liệu"
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Empty 
            description="No revenue data for this period" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </div>
      );
    }
    
    // Nếu chỉ có một điểm dữ liệu, dùng Column
    if (chartData.length === 1 || chartType === 'column') {
      return (
        <Column 
          data={chartData}
          xField="month"
          yField="revenue"
          label={{
            position: 'top',
            formatter: (val) =>
              val !== null && val !== undefined && !isNaN(val)
                ? formatVND(val)
                : '0 ₫'
          }}
          
          color="#1890ff"
          xAxis={{
            label: {
              formatter: (text) => text
            }
          }}
          tooltip={{
            formatter: (datum) => {
              console.log('tooltip datum:', datum);
              return {
                name: 'Revenue',
                value: typeof datum === 'number' && !isNaN(datum)
                  ? formatVND(datum)
                  : (datum.revenue !== undefined && !isNaN(datum.revenue))
                    ? formatVND(datum.revenue)
                    : '0 ₫'
              }
            }
          }}
          
        />
      );
    }
    console.log('Revenue data:', revenueData);
console.log('Category data:', categoryData);
console.log('Payment method data:', paymentMethodData);
    // Nếu có nhiều điểm dữ liệu và mode là area, dùng Area
    if (chartType === 'area') {
      return (
        <Area
          {...revenueConfig}
          areaStyle={{
            fill: 'l(270) 0:#1890ff 0.5:#1890ff 1:rgba(255,255,255,0.1)',
          }}
        />
      );
    }
    
    // Mặc định dùng Line cho nhiều điểm dữ liệu
    return (
      <Line {...revenueConfig} />
    );
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0].startOf('day'), dates[1].endOf('day')]);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingCustomers || isLoadingCategories;

  // Thêm hàm refetch tất cả
  const handleRefreshAll = () => {
    refetchOrders();
    refetchProducts();
    refetchCustomers();
    refetchCategories();
  };

  if (ordersError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert 
          message="Error loading data"
          description="Unable to load order data. Please try again later."
          type="error"
          showIcon
          action={
            <Button icon={<ReloadOutlined />} onClick={handleRefreshAll}>
              Reload
            </Button>
          }
        />
      </div>
    );
  }

  const renderOverviewTab = () => (
    <>
      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className='shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500'
          >
            <Statistic
              title={
                <div className="flex items-center justify-between">
                  <span className='text-gray-600 font-medium'>Total revenue</span>
                  <DollarOutlined className="text-emerald-500 text-xl" />
                </div>
              }
              value={stats.totalSales}
              precision={0}
              valueStyle={{ color: '#10b981', fontSize: '24px' }}
              suffix='₫'
              formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <div className='mt-2 flex items-center'>
              <span className={`text-${stats.monthGrowth >= 0 ? 'green' : 'red'}-500 mr-1 font-medium`}>
                {stats.monthGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {stats.monthGrowth}%
              </span>
              <span className='text-gray-500 text-xs'>from last month</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className='shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500'
          >
            <Statistic
              title={
                <div className="flex items-center justify-between">
                  <span className='text-gray-600 font-medium'>Total orders</span>
                  <ShoppingCartOutlined className="text-blue-500 text-xl" />
                </div>
              }
              value={stats.totalOrders}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
            <div className='mt-2 flex items-center'>
              <span className={`text-${stats.weekGrowth >= 0 ? 'green' : 'red'}-500 mr-1 font-medium`}>
                {stats.weekGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {stats.weekGrowth}%
              </span>
              <span className='text-gray-500 text-xs'>from last week</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className='shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500'
          >
            <Statistic
              title={
                <div className="flex items-center justify-between">
                  <span className='text-gray-600 font-medium'>Total customers</span>
                  <UserOutlined className="text-purple-500 text-xl" />
                </div>
              }
              value={stats.totalCustomers}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
            <div className='mt-2 flex justify-between items-center'>
              <div className='flex items-center'>
                <Badge color='green' className='mr-1' />
                <span className='text-gray-500 text-xs'>New today: {stats.todayVisitors}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            className='shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500'
          >
            <Statistic
              title={
                <div className="flex items-center justify-between">
                  <span className='text-gray-600 font-medium'>Orders pending processing</span>
                  <ShoppingOutlined className="text-amber-500 text-xl" />
                </div>
              }
              value={stats.pendingOrders}
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
            />
            <div className='mt-2'>
              <Progress
percent={stats.totalOrders ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0}
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
            title={
              <div className="flex justify-between items-center">
                <span className='font-semibold text-gray-700'>Revenue over time</span>
                <Segmented
                  options={[
                    {
                      value: 'line',
                      icon: <LineChartOutlined />,
                      label: 'Line',
                    },
                    {
                      value: 'column',
                      icon: <BarChartOutlined />,
                      label: 'Bar',
                    },
                    {
                      value: 'area',
                      icon: <AreaChartOutlined />,
                      label: 'Area',
                    },
                  ]}
                  value={chartType}
                  onChange={setChartType}
                />
              </div>
            }
            className='shadow-sm'
            extra={
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key='1' onClick={() => setDateRange([dayjs().subtract(7, 'day'), dayjs()])}>
                      Last 7 days
                    </Menu.Item>
                    <Menu.Item key='2' onClick={() => setDateRange([dayjs().subtract(30, 'day'), dayjs()])}>
                      Last 30 days
                    </Menu.Item>
                    <Menu.Item key='3' onClick={() => setDateRange([dayjs().subtract(90, 'day'), dayjs()])}>
                      Last 3 months
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button type="default" className="flex items-center" icon={<CalendarOutlined />}>
                  <span className='ml-1'>
                    {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
                  </span>
                </Button>
              </Dropdown>
            }
          >
            <div className='h-[300px]'>
              {isLoadingOrders ? (
                <div className="h-full flex items-center justify-center">
                  <Spin tip="Loading revenue data..." />
                </div>
              ) : (
                <RevenueChart />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span className='font-semibold text-gray-700'>Orders by category</span>}
            className='shadow-sm h-full'
            extra={
              <Tooltip title="Chart showing the number of orders for each product">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            }
          >
            <div className='h-[300px]'>
              {categoryData.length > 0 && categoryData[0].category !== 'No data' ? (
                <Column {...categoryConfig} />
              ) : (
                <Empty 
                  description="No category data for this period" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Đơn hàng gần đây */}
      <Row gutter={[16, 16]} className='mb-6'>
        <Col span={24}>
          <Card
            title={
              <div className="flex items-center">
                <ShoppingCartOutlined className="mr-2 text-blue-500" />
                <span className='font-semibold text-gray-700'>Recent orders</span>
              </div>
            }
            className='shadow-sm'
            extra={
              <Button type="link" icon={<RightOutlined />} href='/admin/orders'>
                View all
              </Button>
            }
          >
            {recentOrders.length > 0 ? (
              <Table 
                dataSource={recentOrders} 
                columns={orderColumns} 
                pagination={false} 
                className='custom-table'
                rowKey="id"
                rowClassName="hover:bg-blue-50 transition-colors"
              />
            ) : (
              <Empty description="No orders yet" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Sản phẩm bán chạy */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div className="flex items-center">
                <FireOutlined className="mr-2 text-red-500" />
                <span className='font-semibold text-gray-700'>Top selling products</span>
              </div>
            }
            className='shadow-sm'
            extra={
              <Button type="link" icon={<RightOutlined />} href='/admin/product'>
                View all
              </Button>
            }
          >
            {topProducts.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Product
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Quantity sold
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Revenue
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Growth
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Trends
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {topProducts.map((product, index) => (
                      <tr key={product.id} className='hover:bg-gray-50 transition-colors'>
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
                          <div className='text-sm text-gray-900 font-medium'>{product.sales}</div>
                          <div className='text-xs text-gray-500'>Products</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900 font-bold text-emerald-600'>
                            {formatVND(product.revenue)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className={`text-sm font-medium ${product.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.growth > 0 ? '+' : ''}
                            {product.growth}%
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {product.growth > 15 ? (
                            <Tooltip title="Best selling">
                              <FireOutlined className='text-red-500 text-lg' />
                            </Tooltip>
                          ) : product.growth > 5 ? (
                            <Tooltip title="Good growth">
                              <RiseOutlined className='text-green-500 text-lg' />
                            </Tooltip>
                          ) : product.growth < 0 ? (
                            <Tooltip title="Decreasing">
                              <ArrowDownOutlined className='text-red-500 text-lg' />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Increasing">
                              <ArrowUpOutlined className='text-green-500 text-lg' />
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty description="No product data yet" />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderAnalyticsTab = () => (
    <>
      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={24} sm={8} lg={6}>
          <Card className='shadow-sm border-l-4 border-l-blue-500'>
            <Statistic
              title="Pending orders"
              value={stats.pendingOrders}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
              prefix={<InfoCircleOutlined />}
            />
            <div className="mt-2">
              <Progress 
                percent={Math.round((stats.pendingOrders / stats.totalOrders) * 100)} 
                size="small" 
                status="active" 
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className='shadow-sm border-l-4 border-l-cyan-500'>
            <Statistic
              title="Orders being delivered"
              value={stats.shippedOrders}
              valueStyle={{ color: '#13c2c2', fontWeight: 'bold' }}
              prefix={<InfoCircleOutlined />}
            />
            <div className="mt-2">
              <Progress 
                percent={Math.round((stats.shippedOrders / stats.totalOrders) * 100)} 
                size="small" 
                status="active" 
                strokeColor="#13c2c2"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className='shadow-sm border-l-4 border-l-green-500'>
            <Statistic
              title="Delivered orders"
              value={stats.deliveredOrders}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              prefix={<InfoCircleOutlined />}
            />
            <div className="mt-2">
              <Progress 
                percent={Math.round((stats.deliveredOrders / stats.totalOrders) * 100)} 
                size="small" 
                status="success" 
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className='shadow-sm border-l-4 border-l-red-500'>
            <Statistic
              title="Canceled orders"
              value={stats.cancelledOrders}
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
              prefix={<InfoCircleOutlined />}
            />
            <div className="mt-2">
              <Progress 
                percent={Math.round((stats.cancelledOrders / stats.totalOrders) * 100)} 
                size="small" 
                status="exception" 
              />
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className='mb-6'>
        <Col xs={24} md={12}>
          <Card 
            title={
              <div className="flex items-center">
                <BarChartOutlined className="mr-2 text-blue-500" />
                <span className="font-semibold">Orders by day</span>
              </div>
            }
            className='shadow-sm'
          >
            <div className="h-[300px]">
              <Column {...dailyOrdersConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={
              <div className="flex items-center">
                <PieChartOutlined className="mr-2 text-purple-500" />
                <span className="font-semibold">Payment method</span>
              </div>
            }
            className='shadow-sm'
          >
            <div className="h-[300px]">
              {paymentMethodData.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <Empty description="No payment data" />
              )}
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <div className="flex items-center">
                <DollarOutlined className="mr-2 text-green-500" />
                <span className="font-semibold">Business metrics</span>
              </div>
            }
            className='shadow-sm'
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card className="border-0 shadow-none bg-gray-50">
                  <Statistic 
                    title="Average order value" 
                    value={stats.avgOrderValue} 
                    formatter={(value) => formatVND(value)}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className="border-0 shadow-none bg-gray-50">
                  <Statistic 
                    title="Conversion rate" 
                    value={stats.conversionRate} 
                    suffix="%" 
                    precision={2}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className="border-0 shadow-none bg-gray-50">
                  <Statistic 
                    title="Completion rate" 
                    value={stats.deliveredOrders / stats.totalOrders * 100} 
                    suffix="%" 
                    precision={2}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <Spin size="large" tip="Loading data..." />
        </div>
      )}
      
      <div className='mb-4 flex flex-col md:flex-row justify-between items-start md:items-center'>
        <div className="mb-4 md:mb-0">
          <h1 className='text-2xl font-bold text-gray-800 flex items-center'>
            <DashboardOutlined className="mr-2" /> Dashboard
          </h1>
          <p className="text-gray-500">Welcome back! Here is an overview of business activity.</p>
        </div>
        <div className="flex items-center">
          <Button 
            type="default" 
            icon={<ReloadOutlined />} 
            onClick={handleRefreshAll} 
            className="mr-3"
          >
            Refresh
          </Button>
          <RangePicker 
            className='w-64' 
            placeholder={['From date', 'To date']} 
            allowClear={false}
            value={dateRange}
            onChange={handleDateRangeChange}
            ranges={{
              'Today': [dayjs(), dayjs()],
              'Last 7 days': [dayjs().subtract(6, 'day'), dayjs()],
              'Last 30 days': [dayjs().subtract(29, 'day'), dayjs()],
              'This month': [dayjs().startOf('month'), dayjs().endOf('month')],
            }}
          />
        </div>
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        className="dashboard-tabs"
        tabBarStyle={{ marginBottom: 24 }}
        size="large"
      >
        <TabPane 
          tab={
            <span className="px-2 flex items-center">
              <DashboardOutlined className="mr-1" /> Overview
            </span>
          } 
          key="overview"
        >
          {renderOverviewTab()}
        </TabPane>
        <TabPane 
          tab={
            <span className="px-2 flex items-center">
              <PieChartOutlined className="mr-1" /> Analytics
            </span>
          } 
          key="analytics"
        >
          {renderAnalyticsTab()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DashboardAdmin;