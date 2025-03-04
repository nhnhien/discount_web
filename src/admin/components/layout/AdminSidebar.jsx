import { Layout } from 'antd';
import React from 'react';

const { Sider } = Layout;

const AdminSidebar = () => {
  return (
    <Sider width={260} className='h-screen bg-sidebar-admin'>
      <div>Hello</div>
    </Sider>
  );
};

export default AdminSidebar;