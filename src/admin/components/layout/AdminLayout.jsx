import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from '../breadcrumb/Breadcrumbs';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='h-screen flex flex-col'>
    <AdminHeader className='h-[60px] flex-shrink-0 z-30' />
 
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

 <div className='flex flex-1'>
   {sidebarOpen && (
     <div className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-20' onClick={toggleSidebar}></div>
   )}

   <div
     className={`
     fixed left-0 top-[60px] bottom-0 z-30
     md:w-[260px] w-[240px] 
     md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
     transition-transform duration-300 ease-in-out
     bg-white shadow-lg 
   `}
   >
          <AdminSidebar />
        </div>
        <main
           className={`
           flex-1 p-4 overflow-auto bg-content-admin
           md:ml-[260px] ml-0
           transition-all duration-300
         `}
         >
          <div className='mt-8 ml-2'>
            <Breadcrumbs />
          </div>
          <div className='mt-10'>
            <Outlet />

          </div>
        </main>
      </div>
    </div>
  );
};


export default AdminLayout;
