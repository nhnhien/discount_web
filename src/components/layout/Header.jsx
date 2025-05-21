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
  
  console.log('Header - currentUser:', currentUser);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const wishlist = useSelector((state) => state.wishlist || []);
  const wishlistCount = Array.isArray(wishlist)
  ? wishlist.filter(item => item?.productId).length
  : 0;
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
      Profile
      </Menu.Item>
      <Menu.Item key='orders' icon={<UnorderedListOutlined />} onClick={() => navigate('/orders')}>
      My Orders
      </Menu.Item>
      <Menu.Item key='logout' icon={<LogoutOutlined />} onClick={handleLogout}>
        {t('home.logout')}
      </Menu.Item>
    </Menu>
  );
const navItems = [
  {
    label: t('nav.discounted'),
    path: '/products?discount=true',
  },
  {
    label: t('nav.non_discounted'),
    path: '/products?discount=false',
  },
];

  return (
    <header className='sticky top-0 z-50 bg-white shadow-sm'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Link to='/'>
              <h1 className='text-2xl font-bold text-gray-800'>IUWE STORE</h1>
              <p className='text-sm text-gray-500 tracking-wide'>SMART PRICING</p>
            </Link>
            <Button
              type='text'
              icon={<MenuOutlined className='text-gray-600 text-xl md:hidden' />}
              onClick={() => setMenuOpen(!menuOpen)}
            />
          </div>

          <div className='hidden md:flex flex-1 max-w-lg mx-4'>
          <Input.Search
  placeholder='Search for products...'
  allowClear
  enterButton={<SearchOutlined />}
  onSearch={(value) => {
    if (value?.trim()) {
      navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    }
  }}
  onPressEnter={(e) => {
    const value = e.target.value;
    if (value?.trim()) {
      navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    }
  }}
  className='w-full rounded-full hover:border-gray-400 focus:border-gray-500'
/>


          </div>

          <div className='flex items-center space-x-4 md:space-x-6'>
          <Badge count={wishlistCount} size='small' offset={[-2, 2]} showZero={false}>
  <Button
    type='text'
    shape='circle'
    icon={<HeartOutlined className='text-gray-600 text-xl' />}
    onClick={() => navigate('/wishlist')}
  />
</Badge>


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
                      src={`https://images.weserv.nl/?url=${encodeURIComponent(currentUser.avatar)}&w=24&h=24&fit=cover`}
                      alt='avatar'
                      className='w-6 h-6 rounded-full object-cover border'
                      style={{
                        display: 'block',
                        width: '24px',
                        height: '24px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '1px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        console.error('Error loading avatar:', e);
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&size=24`;
                      }}
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&size=24`}
                      alt='avatar'
                      className='w-6 h-6 rounded-full object-cover border'
                      style={{
                        display: 'block',
                        width: '24px',
                        height: '24px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '1px solid #e5e7eb'
                      }}
                    />
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

{/* Thay thế phần <nav> cũ bằng đoạn này: */}
<nav
  className={`mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-gray-600 
    overflow-x-auto transition-all duration-300 ${menuOpen ? 'block' : 'hidden md:flex'}`}
>
  {navItems.map((item) => (
    <Link key={item.path} to={item.path} className='hover:text-gray-900 whitespace-nowrap'>
      {item.label}
    </Link>
  ))}

  {currentUser && (
    <Link to='/orders' className='hover:text-gray-900 whitespace-nowrap text-blue-600 font-medium'>
      <UnorderedListOutlined className='mr-1' /> {t('home.my_orders')}
    </Link>
  )}
</nav>

      </div>
    </header>
  );
};

export default Header;