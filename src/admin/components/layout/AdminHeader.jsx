import { Button, Menu, Popover } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { NavLink } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';

const AdminHeader = () => {
  const menu = (
    <Menu>
      <Menu.Item key='1' className='hover:bg-gray-700 text-white'>
        Profile
      </Menu.Item>
      <Menu.Item key='2' className='hover:bg-gray-700 text-white'>
        Logout
      </Menu.Item>
    </Menu>
  );
  return (
    <Header className='bg-header-admin h-[60px]  w-full text-white shadow-md  flex justify-between items-center'>
      <div className='flex items-center'>
        <NavLink to='/' className='text-xl font-bold text-white'>
          <img
            src='https://lh3.googleusercontent.com/pw/ADCreHd5PMvwKUSbjtSRpUfeyDaazAbdXF1H0arvHtS62AyfivDEAN6hRSq-GTJ6wKiyn-9IEr63aaiNtFq6J2fP_I6VtpGAIwqAQu4B2mL64M2h2HHkPY4VhRWoDpag5VXN3Dxtwb277ZDkXPa0mnDxTTGL=w256'
            alt='Lotteria Logo'
            width='150px'
          />
        </NavLink>
      </div>

      <div className='flex items-center'>
        <Popover content={menu} trigger='click'>
          <Button
            type='text'
            className='text-white hover:text-red-500 flex items-center space-x-2'
          >
            <span className='font-semibold'>Xin chào, Admin</span>
            <DownOutlined />
          </Button>
        </Popover>
      </div>
    </Header>
  );
};

export default AdminHeader;