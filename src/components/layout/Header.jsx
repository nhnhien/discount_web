import {
  Input,
  Button,
  Dropdown,
  Menu,
  Select,
  Badge,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '@/context/slice/language';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { logoutSuccess } from '@/context/slice/auth';
import { useCartSummary } from '@/hooks/useCartSummary';
import { getAuth, signOut } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';

const languages = [
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: cartData } = useCartSummary();
  const cartCount = cartData?.data?.item_count || 0;

  const handleLanguageChange = (value) => {
    dispatch(setLanguage(value));
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth); // Đăng xuất khỏi Firebase
      dispatch(logoutSuccess()); // Reset Redux state
      localStorage.removeItem('user'); // Xóa localStorage nếu có
      queryClient.clear(); // Clear react-query cache
      navigate('/'); // Chuyển hướng về trang chủ
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key='profile' icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Hồ sơ cá nhân
      </Menu.Item>
      <Menu.Item key='orders' icon={<UnorderedListOutlined />} onClick={() => navigate('/orders')}>
        Đơn hàng của tôi
      </Menu.Item>
      <Menu.Item key='logout' icon={<LogoutOutlined />} onClick={handleLogout}>
        {t('home.logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <header className='sticky top-0 z-50 bg-white shadow-sm'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Link to='/'>
              <h1 className='text-2xl font-bold text-gray-800'>FashionStore</h1>
            </Link>
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
            <Button type='text' shape='circle' icon={<HeartOutlined className='text-gray-600 text-xl' />} />
            <Badge count={cartCount} offset={[-2, 2]}>
              <Button
                type='text'
                shape='circle'
                icon={<ShoppingCartOutlined className='text-gray-600 text-xl' />}
                onClick={() => navigate('/cart')}
              />
            </Badge>

            {currentUser ? (
              <Dropdown overlay={userMenu} trigger={['click']}>
                <Button type='text' className='flex items-center space-x-2'>
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt='avatar'
                      className='w-6 h-6 rounded-full object-cover border'
                    />
                  ) : (
                    <UserOutlined className='text-gray-600 text-xl' />
                  )}
                  <span className='hidden md:inline'>{currentUser.name}</span>
                  <DownOutlined />
                </Button>
              </Dropdown>
            ) : (
              <Button
                type='primary'
                shape='round'
                className='hidden md:block bg-gray-800 hover:bg-gray-700'
                onClick={() => navigate('/sign-in')}
              >
                {t('home.sign_in')}
              </Button>
            )}

            <Select value={language} onChange={handleLanguageChange} className='w-24 md:w-36'>
              {languages.map((lang) => (
                <Select.Option key={lang.key} value={lang.key}>
                  <span className='flex items-center space-x-2'>
                    <span>{lang.flag}</span>
                    <span className='hidden md:inline'>{lang.label}</span>
                  </span>
                </Select.Option>
              ))}
            </Select>
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
          {currentUser && (
            <Link to='/orders' className='hover:text-gray-900 whitespace-nowrap text-blue-600 font-medium'>
              <UnorderedListOutlined className='mr-1' /> Đơn hàng của tôi
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;