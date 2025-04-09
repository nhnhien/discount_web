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
dayjs.locale('vi');

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const DashboardAdmin = () => {
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
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
      start_date: dateRange[0].format('YYYY-MM-DD'),
      end_date: dateRange[1].format('YYYY-MM-DD'),
      limit: 100 // Get enough orders to calculate stats
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: productsData, 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ['product-stats'],
    queryFn: getProduct,
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: customersData, 
    isLoading: isLoadingCustomers 
  } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomer,
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate all statistics directly from order data
  const { recentOrders, revenueData, categoryData, stats, topProducts, dailyOrders, paymentMethodData } = React.useMemo(() => {
    if (!ordersData?.data || !productsData?.data) {
      return {
        recentOrders: [],
        revenueData: [{ month: 'Không có dữ liệu', revenue: 0 }],
        categoryData: [{ category: 'Không có dữ liệu', value: 0 }],
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
    const orders = ordersData.data;
    
    // Get recent orders (sorted by date)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    const recent = sortedOrders.slice(0, 5);
    
    // Calculate total sales and orders
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Count orders by status
    const pendingOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length;
    
    const shippedOrders = orders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    // Create a map of product IDs to their sales count and revenue
    const productSalesMap = {};
    
    // Create a map of product name (as category) to order counts
    // We'll use product names as categories since we don't have direct category access
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
      revenueByPeriod[monthKey] = 0; // Initialize all months with 0
    }
    
    // Initialize last 14 days for daily chart
    for (let i = 13; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dateKey = date.format('DD/MM');
      dailyOrdersMap[dateKey] = 0;
    }
    
    // Process all orders to build our statistics
    orders.forEach(order => {
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
        // Get product info
        const productId = item.product_id;
        const productName = item.product_name || `Product ${productId}`;
        
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
            // Generate a random growth for demo purposes
            growth: Math.floor(Math.random() * 30) - 5
          };
        }
        productSalesMap[productId].sales += parseInt(item.quantity || 0);
        productSalesMap[productId].revenue += parseFloat(item.subtotal || 0);
      });
    });
    
    // Format revenue data for chart
    const revenueChartData = Object.entries(revenueByPeriod)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/');
        const [bMonth, bYear] = b.month.split('/');
        // Compare years first, then months
        return aYear !== bYear 
          ? parseInt(aYear) - parseInt(bYear)
          : parseInt(aMonth) - parseInt(bMonth);
      });
    
    // Format daily orders data
    const dailyOrdersData = Object.entries(dailyOrdersMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [aDay, aMonth] = a.date.split('/');
        const [bDay, bMonth] = b.date.split('/');
        return aMonth !== bMonth 
          ? parseInt(aMonth) - parseInt(bMonth) 
          : parseInt(aDay) - parseInt(bDay);
      });
    
    // Format payment methods data
    const paymentMethodsData = Object.entries(paymentMethodsMap)
      .map(([method, count]) => ({ 
        method: method === 'vnpay' ? 'VNPay' : 
                method === 'cod' ? 'Tiền mặt' : 
                method === 'bank_transfer' ? 'Chuyển khoản' : 
                method === 'momo' ? 'MoMo' : 
                method.charAt(0).toUpperCase() + method.slice(1),
        count,
        percent: Math.round((count / totalOrders) * 100)
      }));
    
    // Format category data for chart (using product names)
    const categoryChartData = Object.entries(productCategoryMap)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Limit to top 5 to avoid chart crowding
    
    // Prepare top products
    const topProductsList = Object.entries(productSalesMap)
      .map(([id, data]) => ({
        id: parseInt(id),
        name: data.name,
        sales: data.sales,
        revenue: data.revenue,
        growth: data.growth
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Calculate month over month growth (based on actual data)
    const thisMonth = dayjs().format('MM/YYYY');
    const lastMonth = dayjs().subtract(1, 'month').format('MM/YYYY');
    const thisMonthRevenue = revenueByPeriod[thisMonth] || 0;
    const lastMonthRevenue = revenueByPeriod[lastMonth] || 0;
    
    const monthGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;
    
    // Weekly growth calculation (based on actual data)
    const thisWeek = dayjs().startOf('week').format('YYYY-MM-DD');
    const lastWeek = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
    
    const thisWeekOrders = orders.filter(o => dayjs(o.created_at).isAfter(thisWeek)).length;
    const lastWeekOrders = orders.filter(o => 
      dayjs(o.created_at).isAfter(lastWeek) && dayjs(o.created_at).isBefore(thisWeek)
    ).length;
    
    const weekGrowth = lastWeekOrders > 0
      ? Math.round(((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100)
      : 0;
    
    // Ensure we have at least one data point for charts
    const finalRevenueData = revenueChartData.length > 0 
      ? revenueChartData 
      : [{ month: 'Không có dữ liệu', revenue: 0 }];
      
    const finalCategoryData = categoryChartData.length > 0 
      ? categoryChartData 
      : [{ category: 'Không có dữ liệu', value: 0 }];
    
    return {
      recentOrders: recent,
      revenueData: finalRevenueData,
      categoryData: finalCategoryData,
      dailyOrders: dailyOrdersData,
      paymentMethodData: paymentMethodsData,
      stats: {
        totalSales,
        totalOrders,
        totalCustomers: customersData?.data?.length || 0,
        conversionRate: totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0,
        todayVisitors: orders.filter(o => dayjs(o.created_at).isSame(dayjs(), 'day')).length || 0,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        monthGrowth,
        weekGrowth,
        avgOrderValue
      },
      topProducts: topProductsList
    };
  }, [ordersData, productsData, customersData]);

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_number',
      key: 'id',
      render: (text) => (
        <Tooltip title="Nhấn để xem chi tiết">
          <Text className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div className='flex items-center'>
          <Avatar 
            icon={<UserOutlined />} 
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          />
          <span className='ml-2 font-medium'>{customer?.name || 'Khách hàng'}</span>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
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
      title: 'Giá trị',
      dataIndex: 'total_amount',
      key: 'amount',
      render: (amount) => (
        <Text className="font-bold text-emerald-600">{formatVND(parseFloat(amount) || 0)}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'delivered':
            color = 'green';
            text = 'Đã giao hàng';
            break;
          case 'confirmed':
            color = 'cyan';
            text = 'Đã xác nhận';
            break;
          case 'processing':
            color = 'blue';
            text = 'Đang xử lý';
            break;
          case 'shipped':
            color = 'geekblue';
            text = 'Đang giao hàng';
            break;
          case 'cancelled':
            color = 'red';
            text = 'Đã hủy';
            break;
          case 'pending':
            color = 'orange';
            text = 'Chờ xác nhận';
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
              <Menu.Item key='1' icon={<EyeOutlined />}>Xem chi tiết</Menu.Item>
              <Menu.Item key='2' icon={<EditOutlined />}>Cập nhật trạng thái</Menu.Item>
              <Menu.Divider />
              <Menu.Item key='3' danger icon={<DeleteOutlined />}>Hủy đơn</Menu.Item>
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
        formatter: (m) => m
      }
    },
    color: '#1890ff',
    areaStyle: {
      fill: 'l(270) 0:#1890ff 0.5:#1890ff 1:rgba(255,255,255,0.1)',
    },
    xAxis: {
      label: {
        formatter: (text) => text
      }
    },
    minColumnWidth: 60,
    maxColumnWidth: 120,
    appendPadding: [10, 0, 0, 0],
    tooltip: {
      formatter: (datum) => {
        return { name: 'Doanh thu', value: formatVND(datum.revenue) };
      },
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
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
        formatter: (text) => text
      }
    },
    meta: {
      value: {
        alias: 'Số lượng đơn hàng',
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
      type: 'inner',
      offset: '-50%',
      autoRotate: false,
      content: '{percentage}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    statistic: {
      title: {
        content: 'Phương thức',
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  const dailyOrdersConfig = {
    data: dailyOrders,
    xField: 'date',
    yField: 'count',
    xAxis: {
      label: {
        formatter: (text) => text,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Số đơn hàng', value: datum.count };
      },
    },
  };

  // Sử dụng Column thay vì Line để tránh vấn đề hiển thị khi chỉ có một điểm dữ liệu
  const RevenueChart = () => {
    // Đảm bảo dữ liệu phù hợp với biểu đồ
    const chartData = revenueData.filter(item => item.month !== 'Không có dữ liệu');
    
    // Nếu không có dữ liệu hoặc chỉ có "không có dữ liệu"
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Empty 
            description="Không có dữ liệu doanh thu trong khoảng thời gian này" 
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
            formatter: (v) => formatVND(v.revenue)
          }}
          color="#1890ff"
          xAxis={{
            label: {
              formatter: (text) => text
            }
          }}
          tooltip={{
            formatter: (datum) => {
              return { name: 'Doanh thu', value: formatVND(datum.revenue) };
            },
          }}
        />
      );
    }
    
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
      setDateRange(dates);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingCustomers || isLoadingCategories;

  if (ordersError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert 
          message="Lỗi tải dữ liệu"
          description="Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau."
          type="error"
          showIcon
          action={
            <Button icon={<ReloadOutlined />} onClick={refetchOrders}>
              Tải lại
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
                  <span className='text-gray-600 font-medium'>Tổng doanh thu</span>
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
              <span className='text-gray-500 text-xs'>từ tháng trước</span>
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
                  <span className='text-gray-600 font-medium'>Tổng đơn hàng</span>
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
              <span className='text-gray-500 text-xs'>từ tuần trước</span>
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
                  <span className='text-gray-600 font-medium'>Tổng khách hàng</span>
                  <UserOutlined className="text-purple-500 text-xl" />
                </div>
              }
              value={stats.totalCustomers}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
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
          <Card 
            hoverable 
            className='shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500'
          >
            <Statistic
              title={
                <div className="flex items-center justify-between">
                  <span className='text-gray-600 font-medium'>Đơn chờ xử lý</span>
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
                <span className='font-semibold text-gray-700'>Doanh thu theo thời gian</span>
                <Segmented
                  options={[
                    {
                      value: 'line',
                      icon: <LineChartOutlined />,
                      label: 'Đường',
                    },
                    {
                      value: 'column',
                      icon: <BarChartOutlined />,
                      label: 'Cột',
                    },
                    {
                      value: 'area',
                      icon: <AreaChartOutlined />,
                      label: 'Vùng',
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
                      7 ngày qua
                    </Menu.Item>
                    <Menu.Item key='2' onClick={() => setDateRange([dayjs().subtract(30, 'day'), dayjs()])}>
                      30 ngày qua
                    </Menu.Item>
                    <Menu.Item key='3' onClick={() => setDateRange([dayjs().subtract(90, 'day'), dayjs()])}>
                      3 tháng qua
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
              <RevenueChart />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span className='font-semibold text-gray-700'>Đơn hàng theo danh mục</span>}
            className='shadow-sm h-full'
            extra={
              <Tooltip title="Biểu đồ thể hiện số lượng đơn hàng cho mỗi sản phẩm">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            }
          >
            <div className='h-[300px]'>
              {categoryData.length > 0 && categoryData[0].category !== 'Không có dữ liệu' ? (
                <Column {...categoryConfig} />
              ) : (
                <Empty 
                  description="Không có dữ liệu danh mục trong khoảng thời gian này" 
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
                <span className='font-semibold text-gray-700'>Đơn hàng gần đây</span>
              </div>
            }
            className='shadow-sm'
            extra={
              <Button type="link" icon={<RightOutlined />} href='/admin/orders'>
                Xem tất cả
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
              <Empty description="Chưa có đơn hàng nào" />
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
                <span className='font-semibold text-gray-700'>Sản phẩm bán chạy</span>
              </div>
            }
            className='shadow-sm'
            extra={
              <Button type="link" icon={<RightOutlined />} href='/admin/product'>
                Xem tất cả
              </Button>
            }
          >
            {topProducts.length > 0 ? (
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
                          <div className='text-xs text-gray-500'>sản phẩm</div>
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
                            <Tooltip title="Bán chạy">
                              <FireOutlined className='text-red-500 text-lg' />
                            </Tooltip>
                          ) : product.growth > 5 ? (
                            <Tooltip title="Tăng trưởng tốt">
                              <RiseOutlined className='text-green-500 text-lg' />
                            </Tooltip>
                          ) : product.growth < 0 ? (
                            <Tooltip title="Đang giảm">
                              <ArrowDownOutlined className='text-red-500 text-lg' />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Đang tăng">
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
              <Empty description="Chưa có dữ liệu sản phẩm" />
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
              title="Đơn hàng chờ xử lý"
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
              title="Đơn đang giao"
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
              title="Đơn đã giao"
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
              title="Đơn đã hủy"
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
                <span className="font-semibold">Đơn hàng theo ngày</span>
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
                <span className="font-semibold">Phương thức thanh toán</span>
              </div>
            }
            className='shadow-sm'
          >
            <div className="h-[300px]">
              {paymentMethodData.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <Empty description="Không có dữ liệu thanh toán" />
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
                <span className="font-semibold">Chỉ số kinh doanh</span>
              </div>
            }
            className='shadow-sm'
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card className="border-0 shadow-none bg-gray-50">
                  <Statistic 
                    title="Giá trị đơn hàng trung bình" 
                    value={stats.avgOrderValue} 
                    formatter={(value) => formatVND(value)}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className="border-0 shadow-none bg-gray-50">
                  <Statistic 
                    title="Tỷ lệ chuyển đổi" 
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
                    title="Tỷ lệ hoàn thành" 
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
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      )}
      
      <div className='mb-4 flex flex-col md:flex-row justify-between items-start md:items-center'>
        <div className="mb-4 md:mb-0">
          <h1 className='text-2xl font-bold text-gray-800 flex items-center'>
            <DashboardOutlined className="mr-2" /> Dashboard
          </h1>
          <p className="text-gray-500">Chào mừng quay trở lại! Dưới đây là tổng quan hoạt động kinh doanh.</p>
        </div>
        <div className="flex items-center">
          <Button 
            type="default" 
            icon={<ReloadOutlined />} 
            onClick={refetchOrders} 
            className="mr-3"
          >
            Làm mới
          </Button>
          <RangePicker 
            className='w-64' 
            placeholder={['Từ ngày', 'Đến ngày']} 
            allowClear={false}
            value={dateRange}
            onChange={handleDateRangeChange}
            ranges={{
              'Hôm nay': [dayjs(), dayjs()],
              '7 ngày qua': [dayjs().subtract(6, 'day'), dayjs()],
              '30 ngày qua': [dayjs().subtract(29, 'day'), dayjs()],
              'Tháng này': [dayjs().startOf('month'), dayjs().endOf('month')],
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
              <DashboardOutlined className="mr-1" /> Tổng quan
            </span>
          } 
          key="overview"
        >
          {renderOverviewTab()}
        </TabPane>
        <TabPane 
          tab={
            <span className="px-2 flex items-center">
              <PieChartOutlined className="mr-1" /> Phân tích
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