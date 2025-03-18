import { Input, Button } from 'antd';
 import { SearchOutlined, HeartOutlined, ShoppingCartOutlined, MenuOutlined } from '@ant-design/icons';
 import { useState } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className='sticky top-0 z-50 bg-white shadow-sm'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
             <h1 className='text-2xl font-bold text-gray-800'>FashionStore</h1>
             <Button
               type='text'
               icon={<MenuOutlined className='text-gray-600 text-xl md:hidden' />}
               onClick={() => setMenuOpen(!menuOpen)}
             />
           </div>
 
           <div className='hidden md:flex flex-1 max-w-lg mx-4'>
            <Input
              placeholder='Tìm kiếm sản phẩm...'
              prefix={<SearchOutlined className='text-gray-400' />}
              className='w-full rounded-full hover:border-gray-400 focus:border-gray-500'
                          />
          </div>
          <div className='flex items-center space-x-4 md:space-x-6'>
                        <Button
              type='text'
              shape='circle'
              icon={<HeartOutlined style={{ fontSize: '18px' }} className='text-gray-600 text-xl' />}
            />
            <Button
              type='text'
              shape='circle'
              icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} className='text-gray-600 text-xl' />}
            />
            <Button type='primary' shape='round' className='hidden md:block bg-gray-800 hover:bg-gray-700'>
              Đăng nhập
            </Button>
          </div>
        </div>
        <nav
           className={`mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-gray-600 
             overflow-x-auto transition-all duration-300 ${menuOpen ? 'block' : 'hidden md:flex'}`}
         >
          {['Sản phẩm mới', 'Áo', 'Quần', 'Đầm/Váy', 'Phụ kiện', 'Sale'].map((item) => (
            <a key={item} href='#' className='hover:text-gray-900 whitespace-nowrap'>
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};


export default Header;
