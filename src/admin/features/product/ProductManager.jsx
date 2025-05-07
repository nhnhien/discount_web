"use client"

import { useState, useMemo, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Spin,
  Image,
  message,
  Modal,
  Typography,
  Card,
  Tag,
  Tooltip,
  Badge,
  Drawer,
  Statistic,
  Row,
  Col,
  Divider,
  Grid,
  List,
  Avatar,
} from "antd"
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
  TagsOutlined,
  MenuOutlined,
  AppstoreOutlined,
  DownloadOutlined,
} from "@ant-design/icons"
import { deleteProduct, getProductApplyCP, exportProductsToExcel } from "../../../service/product"
import { formatVND } from "../../../utils/format"
import { useNavigate } from "react-router-dom"
import { getCategory } from "../../../service/category"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { getAllUsers } from "@/service/user"
import ExcelImportModal from "./ExcelImportModal"

const { Search } = Input
const { Option } = Select
const { confirm } = Modal
const { Title, Text } = Typography
const { useBreakpoint } = Grid

const ProductManager = () => {
  const screens = useBreakpoint()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [viewMode, setViewMode] = useState(() => {
    return screens.xs ? "list" : "table"
  })
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false)
  const currentUser = useSelector((state) => state.auth.currentUser)
  const userId = currentUser?.id
  const [selectedUser, setSelectedUser] = useState(null)
  const [importModalVisible, setImportModalVisible] = useState(false)

  useEffect(() => {
    if (screens.xs && viewMode === "table") {
      setViewMode("list")
    }
  }, [screens, viewMode])

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["category"],
    queryFn: getCategory,
  })

  const { data: userList } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  })

  // Fetch product theo userId
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["product", selectedUser?.id || "all"],
    queryFn: () => {
      console.log("🧪 userId gửi lên:", selectedUser?.id)
      return getProductApplyCP({ userId: selectedUser?.id })
    },
    enabled: selectedUser !== undefined,
    onSuccess: (data) => {
      console.log("✅ Products:", data.data)
      data.data.forEach((p) => {
        console.log(`[${p.name}] Final price: ${p.final_price}, Rule:`, p.appliedRule)
      })
    },
  })

  const isLoading = categoriesLoading || productsLoading

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      message.success("Product deleted successfully!")
      queryClient.invalidateQueries(["product"])
    },
    onError: (error) => {
      if (error.response?.status === 400) {
        message.error("Cannot delete product that is being used in orders")
      } else {
        message.error("Error deleting product!")
      }
    },
  })

  const showDeleteConfirm = (productId, e) => {
    if (e) e.stopPropagation()

    confirm({
      title: "Are you sure you want to delete this product?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone!",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteMutation.mutate(productId)
      },
    })
  }

  const handleExportExcel = () => {
    try {
      const filters = {}
      if (categoryFilter) filters.categoryId = categoryFilter
      if (searchTerm) filters.search = searchTerm

      exportProductsToExcel(filters)
    } catch (error) {
      console.error("Error exporting products:", error)
      message.error(error.message || "Unable to export Excel file")
    }
  }

  const handleImportSuccess = () => {
    setImportModalVisible(false)
    refetchProducts()
    message.success("Import product successfully!")
  }

  const handleImportError = (error) => {
    message.error(error.message || "Error importing products. Please check the file format.")
  }

  // Validate category filter
  const validateCategoryFilter = (categoryId) => {
    if (!categoryId) return true;
    return categories?.data?.some(cat => cat.id === categoryId);
  }

  // Update category filter with validation
  const handleCategoryFilterChange = (value) => {
    if (validateCategoryFilter(value)) {
      setCategoryFilter(value);
    } else {
      message.error("Selected category no longer exists");
      setCategoryFilter(null);
    }
  };

  // Update search term with validation
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length > 100) {
      message.warning("Search term is too long");
      return;
    }
    setSearchTerm(value);
  };

  // Validate product data before display
  const validateProductData = (product) => {
    if (!product) return false;
    
    const requiredFields = ['name', 'category_id', 'price'];
    return requiredFields.every(field => product[field] !== undefined && product[field] !== null);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.data?.filter((product) => {
      if (!validateProductData(product)) {
        console.error('Invalid product data:', product);
        return false;
      }

      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter ? product.category_id === categoryFilter : true
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  const getCategoryName = (categoryId) => {
    if (!categories?.data) return "N/A"
    const category = categories.data.find((cat) => cat.id === categoryId)
    return category ? category.name : "N/A"
  }

  const getStockStatusTag = (quantity) => {
    if (quantity > 20) return <Tag color="success">In stock</Tag>
    if (quantity > 0) return <Tag color="warning">Low stock</Tag>
    return <Tag color="error">Out of stock</Tag>
  }

  const expandedRowRender = (record) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className={`bg-gray-50 mb-4 ${screens.xs ? "p-2" : ""}`}>
        <Title level={5} className="mb-3">
        Product variant details
        </Title>
        {screens.xs ? (
          <List
            dataSource={record.variants}
            renderItem={(variant) => (
              <List.Item>
                <Card className="w-full" size="small">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <Text strong>SKU:</Text>
                      <Text copyable>{variant.sku}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Original price:</Text>
                      <Text type="secondary">{formatVND(variant.original_price)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Final price:</Text>
                      <Text type="success">{formatVND(variant.final_price)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Stock:</Text>
                      {getStockStatusTag(variant.stock_quantity)}
                    </div>
                    <div>
                      <Text strong>Attributes:</Text>
                      <div className="mt-1">
                        <Space wrap size={[0, 4]}>
                          {variant.attributes.map((attr, index) => (
                            <Tag key={index} color="blue">{`${attr.attribute_name}: ${attr.value}`}</Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Table
            columns={variantColumns}
            dataSource={record.variants}
            rowKey="id"
            pagination={false}
            size="small"
            className="border rounded-lg shadow-sm"
            scroll={{ x: "max-content" }}
          />
        )}
      </Card>
    </motion.div>
  )

  const showProductDetails = (product) => {
    setSelectedProduct(product)
    setDetailsVisible(true)
  }

  const variantColumns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku) => <Text copyable>{sku}</Text>,
    },
    {
      title: "Original price",
      dataIndex: "original_price",
      key: "original_price",
      render: (price) => <Text type="secondary">{formatVND(price)}</Text>,
    },
    {
      title: "Final price",
      dataIndex: "final_price",
      key: "final_price",
      render: (price) => <Text strong>{formatVND(price)}</Text>,
    },
    {
      title: "Stock",
      dataIndex: "stock_quantity",
      key: "stock_quantity",
      render: (quantity) => getStockStatusTag(quantity),
    },
    {
      title: "Attributes",
      dataIndex: "attributes",
      key: "attributes",
      render: (attributes) => (
        <Space wrap>
          {attributes.map((attr, index) => (
            <Tag key={index} color="blue">{`${attr.attribute_name}: ${attr.value}`}</Tag>
          ))}
        </Space>
      ),
    },
  ]

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image_url",
      width: 100,
      render: (image) => (
        <Image
          width={80}
          height={80}
          src={image || "https://via.placeholder.com/80"}
          alt="Product Image"
          className="object-cover rounded-lg shadow-sm"
          preview={{
            mask: <EyeOutlined />,
          }}
        />
      ),
    },
    {
      title: "Product name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <Text
            strong
            className="text-lg hover:text-blue-500 cursor-pointer"
            onClick={() => {
              console.log("🧪 Rule đang áp dụng:", record.appliedRule)
              showProductDetails(record)
            }}
          >
            {name}
          </Text>
          <div className="mt-1">
            <Tag color="cyan" icon={<TagsOutlined />}>
              {getCategoryName(record.category_id)}
            </Tag>
            {record.has_variant && <Tag color="purple">Has variants</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      responsive: ["md"],
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          <Text ellipsis={true} className="max-w-xs">
            {description}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => {
        const rule = record.appliedRule
        const ruleType = rule?.is_price_list
          ? "Price List"
          : rule?.discount_type === "percentage"
            ? `Giảm ${rule.discount_value}%`
            : rule?.discount_type === "fixed price"
              ? `Giảm ${formatVND(rule.discount_value)}`
              : ""

        if (record.has_variant) {
          const variantPrices = record.variants?.map((v) => Number.parseFloat(v.final_price)).filter((p) => !isNaN(p))
          const minPrice = variantPrices?.length > 0 ? Math.min(...variantPrices) : 0

          return (
            <div>
              <Text type="secondary">Price from:</Text>{" "}
              <Text strong className="text-red-600 ml-1">
                {formatVND(minPrice)}
              </Text>
              {rule && (
                <Tag color="blue" className="ml-2">
                  {ruleType}
                </Tag>
              )}
            </div>
          )
        } else {
          return (
            <div>
              {record.original_price !== record.final_price && (
                <Text delete type="secondary">
                  {formatVND(record.original_price)}
                </Text>
              )}
              <Text strong className="text-red-600 block">
                {formatVND(record.final_price)}
              </Text>
              {rule && <Tag color="blue">{ruleType}</Tag>}
            </div>
          )
        }
      },
    },
    {
      title: "Stock",
      key: "stock",
      responsive: ["lg"],
      render: (_, record) => (
        <div>
          {record.has_variant ? (
            <Badge count={record.variants?.length || 0} showZero overflowCount={99}>
              <Text type="secondary">Variant</Text>
            </Badge>
          ) : (
            getStockStatusTag(record.stock_quantity)
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: screens.sm ? 200 : 100,
      render: (_, record) => (
        <Space size={screens.sm ? "middle" : "small"}>
          {screens.sm && (
            <Tooltip title="Xem chi tiết">
              <Button
                onClick={() => showProductDetails(record)}
                icon={<EyeOutlined />}
                shape="circle"
                size={screens.xs ? "small" : "middle"}
              />
            </Tooltip>
          )}
          <Tooltip title="Chỉnh sửa">
            <Button
              onClick={() => navigate(`edit/${record.id}`)}
              icon={<EditOutlined />}
              type="primary"
              shape="circle"
              size={screens.xs ? "small" : "middle"}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              shape="circle"
              size={screens.xs ? "small" : "middle"}
              loading={deleteMutation.isLoading && deleteMutation.variables === record.id}
              onClick={(e) => showDeleteConfirm(record.id, e)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const resetFilters = () => {
    setSearchTerm("")
    setCategoryFilter(null)
  }

  const headerStatistics = [
    { title: "Total products", value: products?.data?.length || 0, icon: <ShoppingOutlined /> },
    {
      title: "Product variants",
      value: products?.data?.filter((p) => p.has_variant).length || 0,
      icon: <TagsOutlined />,
    },
    { title: "Category", value: categories?.data?.length || 0, icon: <TagsOutlined /> },
  ]

  const renderDrawerContent = () => {
    if (!selectedProduct) return null

    return (
      <div>
        <div className="text-center mb-6">
          <Image
            src={selectedProduct.image_url || "https://via.placeholder.com/300"}
            alt={selectedProduct.name}
            width={screens.xs ? 150 : 200}
            className="rounded-lg shadow-md mb-4"
          />
          <Title level={4}>{selectedProduct.name}</Title>
          <Tag color="cyan">{getCategoryName(selectedProduct.category_id)}</Tag>
        </div>

        <Divider />

        <div className="mb-6">
          <Title level={5}>Product Details</Title>
          <Text>{selectedProduct.description}</Text>
        </div>

        {!selectedProduct.has_variant ? (
          <div className="mb-6">
            <Row gutter={16} className="mb-4">
              <Col span={24}>
                <Statistic title="Mã SKU" value={selectedProduct.sku || "Không có"} prefix={<BarcodeOutlined />} />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={screens.xs ? 24 : 12} className={screens.xs ? "mb-4" : ""}>
                <Statistic
                  title="Giá gốc"
                  value={selectedProduct.original_price}
                  formatter={(value) => formatVND(value)}
                />
              </Col>
              <Col span={screens.xs ? 24 : 12}>
                <Statistic
                  title="Giá bán"
                  value={selectedProduct.final_price}
                  formatter={(value) => formatVND(value)}
                  valueStyle={{ color: "#f5222d" }}
                />
              </Col>
            </Row>
            <Divider />
            <Statistic
              title="Tồn kho"
              value={selectedProduct.stock_quantity}
              prefix={<BarcodeOutlined />}
              valueStyle={{ color: selectedProduct.stock_quantity > 0 ? "#52c41a" : "#ff4d4f" }}
            />
          </div>
        ) : (
          <div>
            <Title level={5}>Biến thể sản phẩm</Title>
            {screens.xs ? (
              <List
                dataSource={selectedProduct.variants}
                renderItem={(variant) => (
                  <List.Item>
                    <Card className="w-full" size="small">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <Text strong>SKU:</Text>
                          <Text copyable>{variant.sku}</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text strong>Giá gốc:</Text>
                          <Text type="secondary">{formatVND(variant.original_price)}</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text strong>Giá cuối:</Text>
                          <Text type="success">{formatVND(variant.final_price)}</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text strong>Tồn kho:</Text>
                          {getStockStatusTag(variant.stock_quantity)}
                        </div>
                        <div>
                          <Text strong>Thuộc tính:</Text>
                          <div className="mt-1">
                            <Space wrap size={[0, 4]}>
                              {variant.attributes.map((attr, index) => (
                                <Tag key={index} color="blue">{`${attr.attribute_name}: ${attr.value}`}</Tag>
                              ))}
                            </Space>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Table
                columns={variantColumns}
                dataSource={selectedProduct.variants}
                rowKey="id"
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  const renderFilterDrawer = () => (
    <Drawer
      title="Filters"
      placement="right"
      onClose={() => setFilterDrawerVisible(false)}
      open={filterDrawerVisible}
      width={screens.xs ? 300 : 400}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Text strong>Search</Text>
          <Search
            placeholder="Search products"
            value={searchTerm}
            onChange={handleSearchChange}
            allowClear
            className="w-full mt-2"
          />
        </div>

        <div>
          <Text strong>Category</Text>
          <Select
            placeholder="Select category"
            value={categoryFilter}
            allowClear
            onChange={handleCategoryFilterChange}
            className="w-full mt-2"
            loading={categoriesLoading}
          >
            {categories?.data?.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              resetFilters()
              setFilterDrawerVisible(false)
            }}
            block
          >
            Reset filters
          </Button>
        </div>
      </div>
    </Drawer>
  )

  const renderMobileList = () => (
    <List
      loading={isLoading}
      itemLayout="horizontal"
      dataSource={filteredProducts}
      renderItem={(item) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <List.Item
            className="mb-4 border ..."
            onClick={() => {
              console.log("🧪 Rule đang áp dụng (mobile):", item.appliedRule)
              showProductDetails(item)
            }}
          >
            <div className="flex w-full">
              <div className="mr-4">
                <Avatar
                  src={item.image_url || "https://via.placeholder.com/60"}
                  size={64}
                  shape="square"
                  className="rounded-md"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <div>
                    <Text strong className="text-lg">
                      {item.name}
                    </Text>
                  </div>
                  <div>
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        shape="circle"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`edit/${item.id}`)
                        }}
                      />
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        shape="circle"
                        onClick={(e) => showDeleteConfirm(item.id, e)}
                      />
                    </Space>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  <Tag color="cyan">{getCategoryName(item.category_id)}</Tag>
                  {item.has_variant && <Tag color="purple">Có biến thể</Tag>}
                </div>

                <div className="flex justify-between">
                  <div>
                    {!item.has_variant ? (
                      <div>
                        <Text delete type="secondary" className="block text-xs">
                          {formatVND(item.original_price)}
                        </Text>
                        <Text strong className="block text-red-500">
                          {formatVND(item.final_price)}
                        </Text>
                      </div>
                    ) : (
                      <Tag color="processing">Nhiều giá</Tag>
                    )}
                  </div>
                  <div>
                    {!item.has_variant ? (
                      getStockStatusTag(item.stock_quantity)
                    ) : (
                      <Badge count={item.variants?.length || 0} showZero overflowCount={99}>
                        <Text type="secondary">Biến thể</Text>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </List.Item>
        </motion.div>
      )}
      pagination={{
        pageSize: 10,
        size: "small",
        showSizeChanger: false,
        showTotal: (total) => `Total ${total} products`,
      }}
      locale={{
        emptyText: (
          <div className="text-center py-8">
            <Title level={5} type="secondary">
              No products found
            </Title>
            <Text type="secondary">Try changing filters or add new products</Text>
          </div>
        ),
      }}
    />
  )

  return (
    <div className="bg-white rounded-xl h-[80vh] overflow-y-auto shadow-lg">
      <div className="p md:p-6 border-b">
        <Row gutter={[16, 16]} className="mb-4">
          {headerStatistics.map((stat, index) => (
            <Col xs={24} sm={8} key={index}>
              <Card bordered={false} className="shadow-sm">
                <Statistic title={stat.title} value={stat.value} prefix={stat.icon} />
              </Card>
            </Col>
          ))}
        </Row>

        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="mb-0">
          Product management
          </Title>
          {screens.md && (
            <Space>
              <Button
                icon={viewMode === "table" ? <AppstoreOutlined /> : <MenuOutlined />}
                onClick={() => setViewMode(viewMode === "table" ? "list" : "table")}
              >
                {viewMode === "table" ? "View in grid" : "Xem dạng bảng"}
              </Button>
            </Space>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-between items-center">
          {screens.md ? (
            <div className="flex flex-wrap gap-2 items-center">
              <Search
                placeholder="Search products"
                value={searchTerm}
                onChange={handleSearchChange}
                allowClear
                prefix={<SearchOutlined />}
                style={{ width: screens.lg ? 250 : 200 }}
              />
              <Select
                placeholder="Select category"
                value={categoryFilter}
                allowClear
                onChange={handleCategoryFilterChange}
                style={{ width: screens.lg ? 200 : 150 }}
                loading={categoriesLoading}
              >
                {categories?.data?.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
              {(searchTerm || categoryFilter) && (
                <Button icon={<ReloadOutlined />} onClick={resetFilters} size="middle">
                  Reset
                </Button>
              )}
              <Select
                placeholder="Select user to view prices"
                value={selectedUser?.id}
                allowClear
                style={{ width: 250 }}
                onChange={(value) => {
                  const user = userList?.data?.find((u) => u.id === value)
                  console.log("🧪 Selected user:", user)
                  setSelectedUser(user || null)
                }}
                loading={!userList}
              >
                <Option value="">Tất cả người dùng</Option>
                {userList?.data?.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.email || user.name || `User ${user.id}`}
                  </Option>
                ))}
              </Select>
            </div>
          ) : (
            <Button icon={<FilterOutlined />} onClick={() => setFilterDrawerVisible(true)}>
              Filters {(searchTerm || categoryFilter) && <Badge count="!" />}
            </Button>
          )}

          <div className="space-x-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("create")}
              className="bg-green-600 hover:bg-green-700"
            >
              {screens.sm ? "Add product" : "Add"}
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
              {screens.sm ? "Import Excel" : "Import"}
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
              {screens.sm ? "Export Excel" : "Export"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <>
            {screens.xs || viewMode === "list" ? (
              renderMobileList()
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Table
                  dataSource={filteredProducts}
                  columns={columns}
                  rowKey="id"
                  expandable={{
                    expandedRowRender,
                    expandRowByClick: false,
                    expandIcon: ({ expanded, onExpand, record }) =>
                      record.has_variant ? (
                        expanded ? (
                          <Button
                            type="text"
                            icon={<UploadOutlined rotate={180} />}
                            onClick={(e) => onExpand(record, e)}
                          />
                        ) : (
                          <Button type="text" icon={<UploadOutlined />} onClick={(e) => onExpand(record, e)} />
                        )
                      ) : null,
                  }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: screens.lg,
                    showQuickJumper: screens.lg,
                    showTotal: (total) => `Total ${total} products`,
                    size: screens.sm ? "default" : "small",
                  }}
                  bordered={false}
                  className="custom-table"
                  loading={isLoading}
                  rowClassName="hover:bg-gray-50 transition-colors"
                  scroll={{ x: "max-content" }}
                />
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Title level={4} type="secondary">
              No products found
            </Title>
            <Text type="secondary">Try changing filters or add new products</Text>
            <div className="mt-4">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("create")}>
              Add product
              </Button>
            </div>
          </div>
        )}
      </div>

      <Drawer
        title="Product Details"
        width={screens.xs ? "100%" : 520}
        placement={screens.xs ? "bottom" : "right"}
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        height={screens.xs ? "85vh" : undefined}
        extra={
          selectedProduct && (
            <Space>
              <Button onClick={() => navigate(`edit/${selectedProduct.id}`)} icon={<EditOutlined />} type="primary">
                Edit
              </Button>
            </Space>
          )
        }
      >
        {renderDrawerContent()}
      </Drawer>

      {renderFilterDrawer()}

      <ExcelImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onSuccess={handleImportSuccess}
        onError={handleImportError}
      />
    </div>
  )
}

export default ProductManager
