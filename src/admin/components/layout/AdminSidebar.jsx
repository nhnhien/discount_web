import { Layout } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import { getAdminNavigationItems } from '../../../constants';
import { NavLink, useLocation } from 'react-router-dom';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Sider } = Layout;

const AdminSidebar = () => {
  const { t } = useTranslation();
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  
  // Sử dụng useMemo để caching lại AdminNavigationItems
  const AdminNavigationItems = useMemo(() => getAdminNavigationItems(t), [t]);

  // Sửa useEffect để tránh infinite loop
  useEffect(() => {
    // Tìm menu cha của đường dẫn hiện tại và mở nó
    const currentPath = location.pathname;
    
    let initialOpenMenus = {};
    AdminNavigationItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          child.link === currentPath || 
          (currentPath.startsWith(child.link) && child.link !== '/')
        );
        
        if (hasActiveChild) {
          initialOpenMenus[item.id] = true;
        }
      }
    });
    
    // Chỉ cập nhật state nếu có menu cần mở
    if (Object.keys(initialOpenMenus).length > 0) {
      setOpenMenus(prevState => {
        // Chỉ cập nhật nếu có sự thay đổi
        const hasChanges = Object.keys(initialOpenMenus).some(key => !prevState[key]);
        if (!hasChanges) return prevState;
        
        return {
          ...prevState,
          ...initialOpenMenus
        };
      });
    }
  }, [location.pathname, AdminNavigationItems]); // Thêm dependency array

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Sider width={260} className='h-screen bg-sidebar-admin'>
      <div className='mt-8 space-y-3'>
        {AdminNavigationItems.map((item) => (
          <div key={item.id} className='px-2'>
            {item.children ? (
              <div>
                <div
                  className={`flex justify-between items-center px-4 py-1 cursor-pointer rounded-md ${
                    openMenus[item.id] ? 'bg-white font-semibold' : 'hover:bg-white'
                  }`}
                  onClick={() => toggleMenu(item.id)}
                >
                  <div className='flex items-center space-x-4'>
                    <div>{item.icon}</div>
                    <p className='mt-[3px] text-base font-normal'>{item.title}</p>
                  </div>
                  {openMenus[item.id] ? <UpOutlined /> : <DownOutlined />}
                </div>

                {openMenus[item.id] && (
                  <div className='ml-4 mt-2 space-y-2'>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.link}
                        className={({ isActive }) =>
                          `block px-4 py-1 text-sm text-gray-700 hover:text-gray-600 rounded-md ${
                            isActive ? 'bg-white font-semibold' : 'hover:bg-gray-200'
                          }`
                        }
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>
        ))}
      </div>
    </Sider>
  );
};

export default AdminSidebar;