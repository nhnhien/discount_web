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
      message.error('Error loading shipping fee list');
    } finally {
      setLoading(false);
    }
  };
  

  const handleToggle = async (id, isActive) => {
    try {
      await shippingFeeService.toggle(id, isActive);
      message.success('Status updated successfully');
      fetchShippingFees();
    } catch {
      message.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await shippingFeeService.remove(id);
      message.success('Shipping fee deleted');
      fetchShippingFees();
    } catch {
      message.error('Delete failed');
    }
  };

  useEffect(() => {
    fetchShippingFees();
  }, []);

  const columns = [
    {
      title: 'Area',
      dataIndex: 'region',
      render: (value, record) => {
        const createdAt = new Date(record.createdAt);
        const isNew = (Date.now() - createdAt.getTime()) < 5 * 60 * 1000; // 5 minutes
    
        return (
          <>
            {value} {isNew && <Tag color="green">New</Tag>}
          </>
        );
      }
    },
    {
      title: 'Method',
      dataIndex: 'method',
    },
    {
      title: 'Fee (VND)',
      dataIndex: 'fee',
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) => handleToggle(record.id, checked)}
        />
      ),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => navigate(`/admin/shipping-fee/edit/${record.id}`)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Shipping Fee Management</h2>
      <Button type="primary" onClick={() => navigate('/admin/shipping-fee/create')} style={{ marginBottom: 16 }}>
        Create New
      </Button>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default ShippingFeeManager;
