import React from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className='h-screen flex flex-col'>
      <AdminHeader />
      <div className='flex flex-1'>
        <div className='w-[260px] fixed left-0 top-[60px] bottom-0'>
          <AdminSidebar />
        </div>
        <main className='flex-1 p-4 overflow-auto bg-content-admin ml-[260px]'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;