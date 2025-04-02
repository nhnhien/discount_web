import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Row,
  Col,
  Breadcrumb,
  Typography,
  Button,
  InputNumber,
  Rate,
  Tabs,
  Divider,
  Tag,
  Skeleton,
  Image,
  message,
  Badge,
  Empty,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { getProductApplyCPById, getProductById } from '@/service/product';
import PriceTrendChart from './PriceTrendChart';
import { cartService } from '@/service/cart';
import { useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const userId = currentUser?.id || '';

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableVariants, setAvailableVariants] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const queryClient = useQueryClient();
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', id, userId],
    queryFn: () => getProductApplyCPById(id, userId),
    enabled: !!id && !!userId,
    });

  const product = productData?.data;
  console.log('🟡 [DEBUG] Product:', product);
  console.log('🟡 [DEBUG] Product final_price:', product?.final_price);
  console.log('🟡 [DEBUG] Product appliedRule:', product?.appliedRule);
  console.log('🟡 [DEBUG] Selected variant:', selectedVariant);
  console.log('🟡 [DEBUG] Selected variant final_price:', selectedVariant?.final_price);
  console.log('🟡 [DEBUG] Selected variant appliedRule:', selectedVariant?.appliedRule);
  
  useEffect(() => {
    if (product?.has_variant && product.variants?.length > 0) {
      setAvailableVariants(product.variants);
  
      // Nếu chưa có selectedAttributes thì set mặc định từ variant đầu tiên
      if (!selectedVariant && product.variants[0]) {
        const defaultAttrs = {};
        product.variants[0].attributes?.forEach((attr) => {
          defaultAttrs[attr.attribute_name.toLowerCase()] = attr.value;
        });
  
        setSelectedAttributes(defaultAttrs);
        setSelectedVariant(product.variants[0]);
      }
    } else {
      setSelectedVariant(null);
      setSelectedAttributes({});
    }
  }, [product]);
  
  

  const getUniqueAttributeValues = (attributeName) => {
    if (!product || !product.variants) return [];

    const values = new Set();
    product.variants.forEach((variant) => {
      const attr = variant.attributes?.find((a) => a.attribute_name.toLowerCase() === attributeName.toLowerCase());
      if (attr && attr.value) {
        values.add(attr.value);
      }
    });

    return Array.from(values);
  };

  const getAttributeTypes = () => {
    if (!product?.variants) return [];
  
    const types = new Set();
    product.variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        types.add(attr.attribute_name.toLowerCase());
      });
    });
  
    return Array.from(types);
  };
  
  const handleSelectAttribute = (attributeName, value) => {
    const updatedAttributes = {
      ...selectedAttributes,
      [attributeName.toLowerCase()]: value,
    };
  
    setSelectedAttributes(updatedAttributes);
  
    const matchedVariant = findMatchingVariant(updatedAttributes);
    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    } else {
      setSelectedVariant(null); // fallback nếu không có variant khớp
    }
  };
  

  const findMatchingVariant = (attributes) => {
    if (!product || !product.variants) return null;

    return product.variants.find((variant) => {
      return getAttributeTypes().every((attrType) => {
        const selectedValue = attributes[attrType];
        if (!selectedValue) return true;

        const variantAttr = variant.attributes?.find((attr) => attr.attribute_name.toLowerCase() === attrType);

        return variantAttr && variantAttr.value === selectedValue;
      });
    });
  };

  const getFinalPrice = () => {
    if (product?.has_variant) {
      if (selectedVariant) {
        return parseFloat(selectedVariant.final_price);
      }
      const prices = product.variants
        ?.map((v) => parseFloat(v.final_price))
        .filter((v) => !isNaN(v) && v > 0);
  
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return { min, max };
      }
      return 0;
    }
    return parseFloat(product?.final_price || 0);
  };
  
  const getOriginalPrice = () => {
    if (product?.has_variant) {
      if (selectedVariant) {
        return parseFloat(selectedVariant.original_price);
      }
      const prices = product.variants
        ?.map((v) => parseFloat(v.original_price))
        .filter((v) => !isNaN(v) && v > 0);
  
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return { min, max };
      }
      return 0;
    }
    return parseFloat(product?.original_price || 0);
  };
  
  

  const getDiscountPercent = () => {
    const original = getOriginalPrice();
    const final = getFinalPrice();
  
    if (typeof original === 'number' && typeof final === 'number' && original > final) {
      return Math.round(((original - final) / original) * 100);
    }
  
    if (typeof original === 'object' && typeof final === 'object' && original.min > final.min) {
      return Math.round(((original.min - final.min) / original.min) * 100);
    }
  
    return 0;
  };
  
  

  const isAttributeValueAvailable = (attributeName, value) => {
    if (!product || !product.variants) return false;

    const testAttributes = { ...selectedAttributes };
    testAttributes[attributeName.toLowerCase()] = value;

    return product.variants.some((variant) => {
      return getAttributeTypes().every((attrType) => {
        const selectedValue = testAttributes[attrType];
        if (!selectedValue) return true;

        const variantAttr = variant.attributes?.find((attr) => attr.attribute_name.toLowerCase() === attrType);

        return variantAttr && variantAttr.value === selectedValue;
      });
    });
  };

  const isInStock = () => {
    if (product?.has_variant && selectedVariant) {
      return selectedVariant.stock_quantity > 0;
    }
    return product?.stock_quantity > 0;
  };

  const getStockQuantity = () => {
    if (product?.has_variant && selectedVariant) {
      return selectedVariant.stock_quantity;
    }
    return product?.stock_quantity || 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const addToCartMutation = useMutation({
    mutationFn: (productData) => cartService.addToCart(productData),
    onSuccess: (data) => {
      if (data.success) {
        message.success('Đã thêm sản phẩm vào giỏ hàng');
        queryClient.invalidateQueries(['cart']);
      } else {
        message.error(data.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
      }
    },
    onError: (error) => {
      message.error('Không thể thêm sản phẩm vào giỏ hàng: ' + (error.message || 'Đã xảy ra lỗi'));
    },
  });

  const handleAddToCart = () => {
    if (!isInStock()) {
      message.error('Sản phẩm đã hết hàng');
      return;
    }
    const productToAdd = {
      userId: userId,
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      quantity: quantity,
    };
    addToCartMutation.mutate(productToAdd);
  };

  const handleAddToWishlist = () => {
    message.info('Chức năng này sẽ được cập nhật trong thời gian tới!');
  };

  const handleShareProduct = () => {
    message.info('Chức năng này sẽ được cập nhật trong thời gian tới!');
  };

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Skeleton active paragraph={{ rows: 1 }} />
        <Row gutter={[32, 24]} className='mt-6'>
          <Col xs={24} md={12}>
            <Skeleton.Image className='w-full h-[400px]' active />
            <Row gutter={[8, 8]} className='mt-4'>
              {[1, 2, 3, 4].map((i) => (
                <Col span={6} key={i}>
                  <Skeleton.Image className='w-full h-20' active />
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs={24} md={12}>
            <Skeleton active paragraph={{ rows: 12 }} />
          </Col>
        </Row>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <Title level={3} className='text-red-500'>
          Không thể tải thông tin sản phẩm
        </Title>
        <Button type='primary' onClick={() => navigate('/products')}>
          Quay lại trang sản phẩm
        </Button>
      </div>
    );
  }

  const productImages = [product.image_url, ...(product.variants?.map((v) => v.image_url) || [])].filter(Boolean);

  if (selectedVariant?.image_url) {
    if (!productImages.includes(selectedVariant.image_url)) {
      productImages.unshift(selectedVariant.image_url);
    }
  }

  return (
    <div className='bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <Breadcrumb className='mb-4'>
          <Breadcrumb.Item href='/'>
            <HomeOutlined /> Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item href='/products'>Sản phẩm</Breadcrumb.Item>
          {product.category?.name && (
            <Breadcrumb.Item href={`/category/${product.category_id}`}>{product.category.name}</Breadcrumb.Item>
          )}
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[32, 24]}>
          <Col xs={24} md={12}>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='relative'>
                <Image
                  className='rounded-md object-cover w-full'
                  style={{ maxHeight: '500px' }}
                  src={productImages[currentImage] || 'https://via.placeholder.com/500'}
                  alt={product.name}
                  preview={{
                    visible: false,
                    src: productImages[currentImage],
                    mask: <div className='text-white'>Xem</div>,
                  }}
                />

                {productImages.length > 1 && (
                  <>
                    <Button
                      className='absolute top-1/2 left-2 transform -translate-y-1/2'
                      shape='circle'
                      icon={<LeftOutlined />}
                      onClick={() => setCurrentImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    />
                    <Button
                      className='absolute top-1/2 right-2 transform -translate-y-1/2'
                      shape='circle'
                      icon={<RightOutlined />}
                      onClick={() => setCurrentImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    />
                  </>
                )}

                {getDiscountPercent() > 0 && (
                  <Badge.Ribbon text={`-${getDiscountPercent()}%`} color='red' className='absolute top-0 left-0' />
                )}
              </div>
              {productImages.length > 1 && (
                <Row gutter={[8, 8]} className='mt-4'>
                  {productImages.map((img, index) => (
                    <Col span={6} key={index}>
                      <div
                        className={`cursor-pointer border rounded-md overflow-hidden ${
                          currentImage === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                        }`}
                        onClick={() => {
                          setCurrentImage(index);
                        
                          const variant = product.variants?.find(v => v.image_url === img);
                          if (variant) {
                            setSelectedVariant(variant);
                            const attrs = {};
                            variant.attributes?.forEach(attr => {
                              attrs[attr.attribute_name.toLowerCase()] = attr.value;
                            });
                            setSelectedAttributes(attrs);
                          }
                        }}
                      >
                        <img
                          src={img || 'https://via.placeholder.com/100'}
                          alt={`Thumbnail ${index + 1}`}
                          className='w-full h-20 object-cover'
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className='bg-white rounded-lg p-6 shadow-sm'>
              <div className='flex justify-between items-start mb-2'>
                <div>
                  <Title level={2} className='mb-2'>
                    {product.name}
                  </Title>
                  <div className='flex items-center mb-4'>
                    <Rate disabled defaultValue={4.5} className='text-yellow-500 text-sm' />
                    <Text className='ml-2 text-gray-500'>(120 đánh giá)</Text>
                    <Divider type='vertical' className='mx-3' />
                    <Text className='text-gray-500'>Đã bán: 350</Text>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    shape='circle'
                    icon={<HeartOutlined />}
                    onClick={handleAddToWishlist}
                    className='flex items-center justify-center'
                  />
                  <Button
                    shape='circle'
                    icon={<ShareAltOutlined />}
                    onClick={handleShareProduct}
                    className='flex items-center justify-center'
                  />
                </div>
              </div>

              {/* Giá */}
{/* Giá */}
<div className='bg-gray-50 p-4 rounded-lg mb-6'>
  <div className='flex items-baseline'>
  <>
  <Title level={2} className='text-red-600 m-0'>
    {(() => {
      const final = getFinalPrice();
      if (typeof final === 'number') return formatCurrency(final);
      if (final.min === final.max) return formatCurrency(final.min);
      return `Từ ${formatCurrency(final.min)} đến ${formatCurrency(final.max)}`;
    })()}
  </Title>

  {(() => {
    const original = getOriginalPrice();
    const final = getFinalPrice();
    if (typeof original === 'number' && typeof final === 'number' && original > final) {
      return (
        <Text delete className='ml-3 text-gray-500 text-lg'>
          {formatCurrency(original)}
        </Text>
      );
    }

    if (typeof original === 'object' && original.min > final.min) {
      return (
        <Text delete className='ml-3 text-gray-500 text-lg'>
          {original.min === original.max
            ? formatCurrency(original.min)
            : `Từ ${formatCurrency(original.min)} đến ${formatCurrency(original.max)}`}
        </Text>
      );
    }

    return null;
  })()}
</>

  </div>

  {(selectedVariant?.appliedRule || product.appliedRule) && (
  <div className='mt-2 flex items-center'>
    <Tag color='gold' className='mr-2'>
      Khuyến mãi
    </Tag>
    <Text className='text-sm'>
      {(selectedVariant?.appliedRule || product.appliedRule).name}
      {(selectedVariant?.appliedRule || product.appliedRule).discount_type === 'percentage'
        ? ` (-${(selectedVariant?.appliedRule || product.appliedRule).discount_value}%)`
        : ` (-${formatCurrency((selectedVariant?.appliedRule || product.appliedRule).discount_value)})`}
    </Text>
  </div>
)}

</div>


              <div className='mb-6'>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <div className='flex items-center'>
                      <Text className='text-gray-500 mr-2'>Trạng thái:</Text>
                      {isInStock() ? (
                        <Tag color='success' icon={<CheckCircleFilled />}>
                          Còn hàng ({getStockQuantity()})
                        </Tag>
                      ) : (
                        <Tag color='error'>Hết hàng</Tag>
                      )}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className='flex items-center'>
                      <Text className='text-gray-500 mr-2'>SKU:</Text>
                      <Text>{selectedVariant?.sku || product.sku || 'N/A'}</Text>
                    </div>
                  </Col>
                  {product.category?.name && (
                    <Col span={12}>
                      <div className='flex items-center'>
                        <Text className='text-gray-500 mr-2'>Danh mục:</Text>
                        <Tag color='blue'>{product.category.name}</Tag>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              {product.has_variant && getAttributeTypes().length > 0 && (
                <div className='mb-6'>
                  <Divider>Tùy chọn sản phẩm</Divider>

                  {getAttributeTypes().map((attrType) => (
                    <div key={attrType} className='mb-4'>
                      <Text strong className='block mb-2'>
                        {attrType.charAt(0).toUpperCase() + attrType.slice(1)}:
                      </Text>
                      <div className='flex flex-wrap gap-2'>
                        {getUniqueAttributeValues(attrType).map((value) => {
                          const isSelected = selectedAttributes[attrType] === value;
                          const isAvailable = isAttributeValueAvailable(attrType, value);

                          return (
                            <Button
                              key={value}
                              type={isSelected ? 'primary' : 'default'}
                              className={!isAvailable ? 'opacity-50' : ''}
                              onClick={() => isAvailable && handleSelectAttribute(attrType, value)}
                              disabled={!isAvailable}
                            >
                              {value}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Số lượng và thêm vào giỏ */}
              <div className='mb-6'>
                <Text strong className='block mb-2'>
                  Số lượng:
                </Text>
                <div className='flex items-center gap-4'>
                  <InputNumber
                    min={1}
                    max={getStockQuantity()}
                    value={quantity}
                    onChange={(value) => setQuantity(value)}
                    className='w-[120px]'
                  />
                  <Text className='text-gray-500'>{getStockQuantity()} sản phẩm có sẵn</Text>
                </div>
              </div>

              <div className='flex gap-4 mb-6'>
                <Button
                  type='primary'
                  size='large'
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className='flex-1'
                  disabled={!isInStock()}
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button type='default' size='large' onClick={handleAddToWishlist}>
                  <HeartOutlined /> Yêu thích
                </Button>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                <Title level={5} className='mb-3'>
                  Cam kết từ chúng tôi
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className='flex items-center'>
                      <SafetyCertificateOutlined className='text-green-500 text-xl mr-2' />
                      <Text>Chính hãng 100%</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className='flex items-center'>
                      <EnvironmentOutlined className='text-blue-500 text-xl mr-2' />
                      <Text>Giao hàng toàn quốc</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className='flex items-center'>
                      <ClockCircleOutlined className='text-orange-500 text-xl mr-2' />
                      <Text>Đổi trả trong 7 ngày</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className='flex items-center'>
                      <InfoCircleOutlined className='text-purple-500 text-xl mr-2' />
                      <Text>Tư vấn 24/7</Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>

        <div className='bg-white rounded-lg shadow-sm mt-8 p-6'>
          <Tabs defaultActiveKey='description'>
            <TabPane tab='Mô tả sản phẩm' key='description'>
              <div className='py-4'>
                {product.description ? (
                  <div className='product-description' dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <Empty description='Chưa có mô tả cho sản phẩm này' />
                )}
              </div>
            </TabPane>
            <TabPane tab='Thông số kỹ thuật' key='specifications'>
              <div className='py-4'>
                <Empty description='Chưa có thông số kỹ thuật cho sản phẩm này' />
              </div>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <LineChartOutlined /> Lịch sử giá
                </span>
              }
              key='price-history'
            >
              <div className='py-4'>
                {!product.has_variant ? (
                  <PriceTrendChart productId={product.id} isVariant={false} title='Lịch sử biến động giá sản phẩm' />
                ) : (
                  <div>
                    <PriceTrendChart productId={product.id} isVariant={false} title='Lịch sử biến động giá sản phẩm' />

                    {selectedVariant && (
                      <>
                        <Divider orientation='left'>Lịch sử biến động giá biến thể hiện tại</Divider>
                        <PriceTrendChart
                          variantId={selectedVariant.id}
                          isVariant={true}
                          title={`Lịch sử biến động giá - ${selectedVariant.sku || 'Biến thể'}`}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tab='Đánh giá (120)' key='reviews'>
              <div className='py-4 text-center'>
                <Empty description='Tính năng đánh giá đang được phát triển' className='my-10' />
                <Button type='primary'>Viết đánh giá đầu tiên</Button>
              </div>
            </TabPane>
          </Tabs>
        </div>

        <div className='bg-white rounded-lg shadow-sm mt-8 p-6'>
          <Title level={4} className='mb-4'>
            Sản phẩm liên quan
          </Title>
          <Empty description='Tính năng sản phẩm liên quan đang được phát triển' className='my-10' />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;