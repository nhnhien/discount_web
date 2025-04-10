import React, { useEffect, useState } from 'react';
import { Table, Button, Switch, Space, message, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { shippingFeeService } from '@/service/shippingFeeService';

const ShippingFeeManager = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShippingFees = async () => {
    try {
      setLoading(true);
      const response = await shippingFeeService.getAll();
  
      // Sắp xếp giảm dần theo thời gian tạo (nếu có createdAt)
      const sorted = [...response].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      setData(sorted);
    } catch (error) {
      message.error('Lỗi khi tải danh sách phí vận chuyển');
    } finally {
      setLoading(false);
    }
  };
  

  const handleToggle = async (id, isActive) => {
    try {
      await shippingFeeService.toggle(id, isActive);
      message.success('Cập nhật trạng thái thành công');
      fetchShippingFees();
    } catch {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    try {
      await shippingFeeService.remove(id);
      message.success('Đã xoá phí vận chuyển');
      fetchShippingFees();
    } catch {
      message.error('Xoá thất bại');
    }
  };

  useEffect(() => {
    fetchShippingFees();
  }, []);

  const columns = [
    {
      title: 'Khu vực',
      dataIndex: 'region',
      render: (value, record) => {
        const createdAt = new Date(record.createdAt);
        const isNew = (Date.now() - createdAt.getTime()) < 5 * 60 * 1000; // 5 phút
    
        return (
          <>
            {value} {isNew && <Tag color="green">Mới</Tag>}
          </>
        );
      }
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
    },
    {
      title: 'Phí (VND)',
      dataIndex: 'fee',
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'is_active',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) => handleToggle(record.id, checked)}
        />
      ),
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
<Button onClick={() => navigate(`/admin/shipping-fee/edit/${record.id}`)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xoá không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý phí vận chuyển</h2>
      <Button type="primary" onClick={() => navigate('/admin/shipping-fee/create')} style={{ marginBottom: 16 }}>
        Tạo mới
      </Button>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default ShippingFeeManager;
