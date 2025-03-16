import { Input, Button, Grid } from 'antd';
 import { SearchOutlined, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
 
const Header = () => {
  return (
    <header className='sticky top-0 z-50 bg-white shadow-sm'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-800'>FashionStore</h1>
          <div className='flex flex-1 max-w-xl ml-10 '>
            <Input
              placeholder='Tìm kiếm sản phẩm...'
              prefix={<SearchOutlined className='text-gray-400' />}
              className='rounded-full hover:border-gray-400 focus:border-gray-500'
            />
          </div>
          <div className='flex items-center space-x-6'>
            <Button
              type='text'
              shape='circle'
              icon={<HeartOutlined className='text-gray-600' style={{ fontSize: '20px' }} />}
            />
            <Button
              type='text'
              shape='circle'
              icon={<ShoppingCartOutlined className='text-gray-600' style={{ fontSize: '20px' }} />}
            />
            <Button type='primary' shape='round' className='bg-gray-800 hover:bg-gray-700'>
              Đăng nhập
            </Button>
          </div>
        </div>
        <nav className='mt-4 flex space-x-6 text-gray-600 overflow-x-auto'>
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
