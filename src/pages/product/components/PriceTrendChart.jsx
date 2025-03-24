// components/charts/PriceTrendChart.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Typography,
  Radio,
  Tabs,
  Empty,
  Spin,
  Table,
  Tag,
  Tooltip,
  Space,
  Select,
  Button,
  DatePicker,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  LineChartOutlined,
  TableOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  DashOutlined,
  HistoryOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { vi } from 'date-fns/locale';
import { formatVND } from '@/utils/format';
import { getProductPriceHistory, getVariantPriceHistory } from '@/service/price-history';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
ChartJS.register(TimeScale);

const PriceTrendChart = ({ productId, variantId, isVariant = false, title = 'Biến động giá' }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [priceType, setPriceType] = useState('final');
  const [timeRange, setTimeRange] = useState('all');
  const [customDateRange, setCustomDateRange] = useState(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['priceHistory', isVariant ? 'variant' : 'product', isVariant ? variantId : productId, priceType],
    queryFn: () => (isVariant ? getVariantPriceHistory(variantId) : getProductPriceHistory(productId)),
    enabled: Boolean(isVariant ? variantId : productId),
  });

  const chartData = useMemo(() => {
    if (!data?.data?.price_history?.length) return null;
    let filteredData = data.data.price_history.filter((item) => item.price_type === priceType);

    if (timeRange !== 'all' && !customDateRange) {
      const now = new Date();
      let startDate = new Date();

      if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (timeRange === '90d') startDate.setDate(now.getDate() - 90);
      else if (timeRange === '1y') startDate.setFullYear(now.getFullYear() - 1);

      filteredData = filteredData.filter((item) => new Date(item.changed_at) >= startDate);
    } else if (customDateRange) {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.changed_at);
        return itemDate >= customDateRange[0].toDate() && itemDate <= customDateRange[1].toDate();
      });
    }

    filteredData.sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));

    return {
      labels: filteredData.map((item) => new Date(item.changed_at)),
      datasets: [
        {
          label: priceType === 'final' ? 'Giá bán' : 'Giá gốc',
          data: filteredData.map((item) => item.new_price),
          borderColor: priceType === 'final' ? '#f5222d' : '#1890ff',
          backgroundColor: priceType === 'final' ? 'rgba(245, 34, 45, 0.1)' : 'rgba(24, 144, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: priceType === 'final' ? '#f5222d' : '#1890ff',
          borderWidth: 2,
        },
      ],
    };
  }, [data, priceType, timeRange, customDateRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatVND(context.parsed.y)}`;
          },
          title: function (tooltipItems) {
            return new Date(tooltipItems[0].parsed.x).toLocaleString('vi-VN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 13,
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: determineTimeUnit(timeRange),
          tooltipFormat: 'dd/MM/yyyy HH:mm',
          displayFormats: {
            day: 'dd/MM',
            week: 'dd/MM',
            month: 'MM/yyyy',
          },
        },
        adapters: {
          date: {
            locale: vi,
          },
        },
        title: {
          display: true,
          text: 'Thời gian',
          font: {
            size: 14,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Giá (VNĐ)',
          font: {
            size: 14,
          },
        },
        ticks: {
          callback: function (value) {
            return formatVND(value);
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
      },
    },
  };

  function determineTimeUnit(range) {
    switch (range) {
      case '30d':
        return 'day';
      case '90d':
        return 'week';
      case '1y':
      case 'all':
        return 'month';
      default:
        return 'day';
    }
  }
  const calculatePercentChange = (oldPrice, newPrice) => {
    if (!oldPrice) return null;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };
  const tableData = useMemo(() => {
    if (!data?.data?.price_history?.length) return [];

    let filteredData = data.data.price_history.filter((item) => item.price_type === priceType);

    if (timeRange !== 'all' && !customDateRange) {
      const now = new Date();
      let startDate = new Date();

      if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (timeRange === '90d') startDate.setDate(now.getDate() - 90);
      else if (timeRange === '1y') startDate.setFullYear(now.getFullYear() - 1);

      filteredData = filteredData.filter((item) => new Date(item.changed_at) >= startDate);
    } else if (customDateRange) {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.changed_at);
        return itemDate >= customDateRange[0].toDate() && itemDate <= customDateRange[1].toDate();
      });
    }

    return filteredData
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
      .map((item, index) => ({
        key: index,
        id: item.id,
        changed_at: item.changed_at,
        old_price: item.old_price,
        new_price: item.new_price,
        change_amount: item.new_price - item.old_price,
        change_percentage: calculatePercentChange(item.old_price, item.new_price),
        change_reason: item.change_reason || 'Không có thông tin',
        changed_by: item.user?.username || 'Hệ thống',
      }));
  }, [data, priceType, timeRange, customDateRange]);

  const getPriceChangeDisplay = (changeAmount, changePercentage) => {
    if (!changePercentage && changePercentage !== 0) return <Text type='secondary'>Giá đầu tiên</Text>;

    if (changeAmount > 0) {
      return (
        <Text type='danger'>
          <RiseOutlined /> +{formatVND(changeAmount)} ({changePercentage.toFixed(2)}%)
        </Text>
      );
    } else if (changeAmount < 0) {
      return (
        <Text type='success'>
          <FallOutlined /> {formatVND(changeAmount)} ({changePercentage.toFixed(2)}%)
        </Text>
      );
    } else {
      return (
        <Text>
          <DashOutlined /> Không thay đổi (0%)
        </Text>
      );
    }
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'changed_at',
      key: 'changed_at',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString('vi-VN')}>{new Date(date).toLocaleDateString('vi-VN')}</Tooltip>
      ),
    },
    {
      title: 'Giá cũ',
      dataIndex: 'old_price',
      key: 'old_price',
      render: (price) => (price ? formatVND(price) : '-'),
    },
    {
      title: 'Giá mới',
      dataIndex: 'new_price',
      key: 'new_price',
      render: (price) => <Text strong>{formatVND(price)}</Text>,
    },
    {
      title: 'Thay đổi',
      key: 'change',
      render: (_, record) => getPriceChangeDisplay(record.change_amount, record.change_percentage),
    },
    {
      title: 'Người thay đổi',
      dataIndex: 'changed_by',
      key: 'changed_by',
      render: (user) => <Tag color='blue'>{user}</Tag>,
    },
    {
      title: 'Lý do',
      dataIndex: 'change_reason',
      key: 'change_reason',
      ellipsis: {
        showTitle: false,
      },
      render: (reason) => (
        <Tooltip title={reason}>
          <span>{reason || 'Không có thông tin'}</span>
        </Tooltip>
      ),
    },
  ];

  const handleCustomDateChange = (dates) => {
    if (dates) {
      setTimeRange('custom');
      setCustomDateRange(dates);
    } else {
      setTimeRange('all');
      setCustomDateRange(null);
    }
  };

  const renderPriceSummary = () => {
    if (!data?.data?.price_history?.length) return null;

    const currentPrice =
      data.data[isVariant ? 'variant' : 'product'][priceType === 'final' ? 'final_price' : 'original_price'];
    const filteredHistory = data.data.price_history.filter((item) => item.price_type === priceType);

    let firstPrice = 0;
    let highestPrice = 0;
    let lowestPrice = Number.MAX_VALUE;
    let priceChangeCount = 0;

    if (filteredHistory.length > 0) {
      const sortedByTime = [...filteredHistory].sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));
      firstPrice = sortedByTime[0].new_price;

      filteredHistory.forEach((item) => {
        highestPrice = Math.max(highestPrice, item.new_price);
        lowestPrice = Math.min(lowestPrice, item.new_price);
      });

      priceChangeCount = filteredHistory.length;
    }

    const totalChange = currentPrice - firstPrice;
    const totalChangePercentage = firstPrice > 0 ? (totalChange / firstPrice) * 100 : 0;

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <Card size='small'>
          <Statistic
            title='Giá cao nhất / thấp nhất'
            value={`${formatVND(highestPrice)} / ${lowestPrice < Number.MAX_VALUE ? formatVND(lowestPrice) : '-'}`}
          />
        </Card>
        <Card size='small'>
          <Statistic
            title='Số lần thay đổi giá'
            value={priceChangeCount}
            suffix={`lần ${priceType === 'final' ? '(giá bán)' : '(giá gốc)'}`}
          />
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center py-16'>
          <Spin size='large' tip='Đang tải dữ liệu biến động giá...' />
        </div>
      );
    }

    if (error) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Không thể tải dữ liệu biến động giá. <br />
              Vui lòng thử lại sau.
            </span>
          }
        />
      );
    }

    if (!data?.data?.price_history?.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Chưa có dữ liệu biến động giá cho sản phẩm này. <br />
              Thay đổi giá sẽ được ghi lại tự động trong hệ thống.
            </span>
          }
        />
      );
    }

    if (activeTab === 'chart') {
      return (
        <>
          {renderPriceSummary()}
          <div style={{ height: 350 }}>
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Empty description='Không có dữ liệu thỏa mãn điều kiện lọc' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </>
      );
    } else {
      return (
        <>
          {renderPriceSummary()}
          <Table
            columns={columns}
            dataSource={tableData}
            size='small'
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              showTotal: (total) => `Tổng cộng ${total} bản ghi`,
            }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: 'Không có dữ liệu thỏa mãn điều kiện lọc',
            }}
          />
        </>
      );
    }
  };

  return (
    <Card
      title={
        <Space>
          <HistoryOutlined />
          <span>{title}</span>
        </Space>
      }
      className='shadow-sm mb-4'
      extra={
        <Button type='text' icon={<DownloadOutlined />} onClick={() => {}} title='Xuất dữ liệu'>
          Xuất
        </Button>
      }
    >
      <div className='mb-4 flex flex-wrap gap-3 justify-between'>
        <Space wrap>
          <Radio.Group
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            buttonStyle='solid'
            size='middle'
          >
            <Radio.Button value='final'>Giá bán</Radio.Button>
            <Radio.Button value='original'>Giá gốc</Radio.Button>
          </Radio.Group>

          <Radio.Group
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            buttonStyle='solid'
            size='middle'
          >
            <Radio.Button value='chart'>
              <LineChartOutlined /> Biểu đồ
            </Radio.Button>
            <Radio.Button value='table'>
              <TableOutlined /> Bảng
            </Radio.Button>
          </Radio.Group>
        </Space>

        <Space wrap>
          <Select
            value={timeRange}
            onChange={(value) => {
              setTimeRange(value);
              if (value !== 'custom') setCustomDateRange(null);
            }}
            style={{ width: 120 }}
          >
            <Option value='all'>Tất cả</Option>
            <Option value='30d'>30 ngày</Option>
            <Option value='90d'>90 ngày</Option>
            <Option value='1y'>1 năm</Option>
            <Option value='custom'>Tùy chỉnh</Option>
          </Select>

          {timeRange === 'custom' && (
            <RangePicker format='DD/MM/YYYY' onChange={handleCustomDateChange} value={customDateRange} allowClear />
          )}
        </Space>
      </div>

      {renderContent()}
    </Card>
  );
};

export default PriceTrendChart;
