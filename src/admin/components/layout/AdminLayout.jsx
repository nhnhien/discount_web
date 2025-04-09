import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from '../breadcrumb/Breadcrumbs';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { FloatButton } from 'antd';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='h-screen flex flex-col'>
      <AdminHeader className='h-[100px] flex-shrink-0 z-30' />
      <button
        className='md:hidden fixed top-[70px] left-2 z-40 bg-primary p-2 rounded-full shadow-lg'
        onClick={toggleSidebar}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <line x1='3' y1='12' x2='21' y2='12'></line>
          <line x1='3' y1='6' x2='21' y2='6'></line>
          <line x1='3' y1='18' x2='21' y2='18'></line>
        </svg>
      </button>

      <div className='main-container'>
        {sidebarOpen && (
          <div className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-20' onClick={toggleSidebar}></div>
        )}

        <div
          className={`sidebar-fixed md:w-[260px] w-[240px] md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='sidebar-content fixed '>
            <AdminSidebar />
          </div>
        </div>
        <main className={`main-content md:ml-[260px] ml-0`}>
          <div className='mt-8 ml-2'>
            <Breadcrumbs />
          </div>
          <div className='mt-10'>
            <Outlet />
          </div>
        </main>
      </div>
      <FloatButton.BackTop />
    </div>
  );
};

export default AdminLayout;