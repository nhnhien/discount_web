import { Layout } from 'antd';
import React from 'react';
import { AdminNavigationItems } from '../../../constants';
import { NavLink } from 'react-router-dom';

const { Sider } = Layout;

const AdminSidebar = () => {
  return (
    <Sider width={260} className='h-screen bg-sidebar-admin'>
      <div className='mt-8 space-y-3'>
        {AdminNavigationItems.map((item) => (
          <div key={item.id} className='px-2'>
            <NavLink
              to={item.link}
              end={item.link === '/admin'}
              className={({ isActive }) =>
                `block px-4 py-1 flex items-center space-x-4 hover:text-inherit rounded-md ${
                  isActive ? 'bg-white font-semibold' : 'hover:bg-white'
                }`
              }
            >
              <div>{item.icon}</div>
              <p className='mt-[3px] text-base font-normal'>{item.title}</p>
            </NavLink>
          </div>
        ))}
      </div>
    </Sider>
  );
};

export default AdminSidebar;