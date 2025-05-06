import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Table, Tag, Image, Button, Tooltip, Skeleton, Empty, Alert, Space, Rate } from 'antd';
import { 
  ShoppingCartOutlined, 
  ShoppingOutlined, 
  SyncOutlined, 
  RiseOutlined, 
  FallOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { formatVND } from '@/utils/format';
import apiClient from '@/config/axios.config';
import { useEffect } from 'react';

const { Title, Text } = Typography;

// ✅ Thêm props mới
const PriceComparison = ({ productId, variantId, isTabActive }) => {
  const [isComparing, setIsComparing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // đã từng fetch hay chưa

  const shouldFetch = isTabActive && !hasFetched;

  const fetchPriceComparison = async () => {
    setIsComparing(true);
    try {
      const url = variantId 
        ? `/api/price-comparison/product/${productId}/variant/${variantId}`
        : `/api/price-comparison/product/${productId}`;
      const response = await apiClient.get(url);
      return response.data.data || { our_product: {}, comparisons: [] };
    } catch (error) {
      console.error('Error fetching price comparison:', error);
      return { our_product: {}, comparisons: [] };
    } finally {
      setIsComparing(false);
    }
  };

  const {
    data: comparisonData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['priceComparison', productId, variantId],
    queryFn: fetchPriceComparison,
    enabled: shouldFetch,
  });

  // ✅ Cập nhật đã fetch lần đầu khi tab mở
  useEffect(() => {
    if (isTabActive && !hasFetched) {
      setHasFetched(true);
    }
  }, [isTabActive, hasFetched]);


  const handleCompare = () => {
    refetch();
  };

  const columns = [
    {
      title: '',
      dataIndex: 'image',
      key: 'image',
      width: '80px',
      render: (_, record) => {
        const imgSrc = record.image || record.image_url;
        return imgSrc ? (
          <Image 
            src={imgSrc}
            alt={record.title || record.name}
            width={60}
            height={60}
            preview={false}
            className="object-cover rounded border"
            style={{ objectFit: 'cover' }}
            fallback="data:image/png;base64,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"
          />
        ) : null;
      }
    },
    {
      title: 'Marketplace',
      dataIndex: 'source',
      key: 'source',
      width: '15%',
      render: (source, record) => {
        // Thêm cờ quốc gia và logo
        const country = record.country || 'VN';
        let flagEmoji = '🇻🇳';
        if (country === 'US') flagEmoji = '🇺🇸';
        else if (country === 'UK') flagEmoji = '🇬🇧';
        
        let tagColor = 'blue';
        
        switch(source) {
          case 'our_store':
            tagColor = 'blue';
            return <Tag color={tagColor}>Our Store</Tag>;
          case 'tiki':
            tagColor = 'green';
            break;
          case 'amazon':
            tagColor = 'orange';
            break;
          case 'ebay':
            tagColor = 'red';
            break;
          case 'shopee':
            tagColor = 'volcano';
            break;
          case 'lazada':
            tagColor = 'purple';
            break;
          default:
            tagColor = 'default';
        }
        
        return (
          <div>
            <Tag color={tagColor} className="mb-1">
              <span style={{ marginRight: '4px' }}>{flagEmoji}</span>
              {source.charAt(0).toUpperCase() + source.slice(1)}
            </Tag>
            {record.shop_name && (
              <div className="text-xs text-gray-500 mt-1">
                {record.shop_name}
              </div>
            )}
            {record.similarity && (
              <Tag color="blue" className="text-xs mt-1" size="small">
                Similarity: {Math.round(record.similarity * 100)}%
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Product',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (title, record) => {
        const displayTitle = title || record.name || 'Product';
        
        return (
          <div>
            <Tooltip title={displayTitle}>
              <Text ellipsis={{ tooltip: displayTitle }} style={{ maxWidth: 250 }}>
                {displayTitle}
              </Text>
            </Tooltip>
            {record.rating && (
              <div className="flex items-center mt-1">
                <Rate disabled defaultValue={record.rating} className="text-xs" style={{ fontSize: '12px' }} />
                <Text type="secondary" className="ml-1 text-xs">({record.rating})</Text>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: '20%',
      render: (price, record) => {
        // Thêm format tiền tệ theo quốc gia
        const country = record.country || 'VN';
        let priceDisplay = formatVND(price);
        
        // Hiển thị biểu tượng xu hướng giá dựa vào so sánh giá
        let priceComparison = null;
        if (record.source !== 'our_store' && comparisonData?.our_product?.price) {
          const ourPrice = comparisonData.our_product.price;
          const priceDiffValue = ourPrice - record.price;
        
          if (priceDiffValue > 0) {
            priceComparison = (
              <Text type="success" className="flex items-center">
                <RiseOutlined className="mr-1" />
                Cheaper by {formatVND(priceDiffValue)} compared to our store
              </Text>
            );
          } else if (priceDiffValue < 0) {
            priceComparison = (
              <Text type="danger" className="flex items-center">
                <FallOutlined className="mr-1" />
                More expensive by {formatVND(Math.abs(priceDiffValue))} compared to our store
              </Text>
            );
          }
        }
        
        
        // Nếu là sản phẩm quốc tế, hiển thị thêm giá gốc bằng USD
        if (country === 'US') {
          const usdPrice = (price / 25000).toFixed(2);
          return (
            <div>
              <Text strong>{priceDisplay}</Text>
              <div className="text-xs text-gray-500 mt-1">≈ ${usdPrice}</div>
              {priceComparison && <div className="mt-1">{priceComparison}</div>}
            </div>
          );
        }
        
        return (
          <div>
            <Text strong>{priceDisplay}</Text>
            {priceComparison && <div className="mt-1">{priceComparison}</div>}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (_, record) => {
        if (record.source === 'our_store') return null;
        
        let tooltipText = `View on ${record.source.charAt(0).toUpperCase() + record.source.slice(1)}`;
        
        return (
          <Tooltip title={tooltipText}>
            <Button 
              type="primary"
              icon={<ExportOutlined />}
              onClick={() => window.open(record.url, '_blank')}
              size="middle"
            >
              View
            </Button>
          </Tooltip>
        );
      },
    },
  ];
  
  return (
    <Card 
      title={
        <div className="flex items-center">
          <ShoppingCartOutlined className="mr-2 text-blue-500" />
          <span>Compare Prices on Marketplaces</span>
        </div>
      }
      extra={
        <Button 
          type="primary" 
          icon={<SyncOutlined spin={isComparing} />} 
          onClick={handleCompare}
          loading={isLoading}
        >
          Compare Prices
        </Button>
      }
      className="mt-6"
    >
      {!comparisonData && !isLoading && !isError && (
        <Empty 
          description="Press the Compare Prices button to view prices from marketplaces" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {isLoading && (
        <div className="py-8">
          <Skeleton active />
        </div>
      )}

      {isError && (
        <Alert
          message="Error fetching price comparison"
          description={error?.message || "No matching products found"}
          type="error"
          showIcon
        />
      )}

      {comparisonData && !isLoading && (
        <>
          {comparisonData.comparisons.length === 0 ? (
            <Alert
              message="Không tìm thấy sản phẩm tương đương"
              description="No equivalent products found on marketplaces. The SKU might not match or the product might not exist on the marketplaces."
              type="info"
              showIcon
            />
          ) : (
            <Table 
              dataSource={[comparisonData.our_product, ...comparisonData.comparisons]} 
              columns={columns}
              rowKey={(record) => record.source + (record.id || '')}
              pagination={false}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default PriceComparison;