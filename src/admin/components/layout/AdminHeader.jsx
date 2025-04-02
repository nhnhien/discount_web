import { Button, Menu, Popover, Select } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { NavLink, useNavigate } from 'react-router-dom';
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '@/context/slice/language';
import { getAuth, signOut } from 'firebase/auth';

const AdminHeader = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);

  // 👉 Lấy user từ Redux nếu có, fallback từ Firebase
  const auth = getAuth();
  const firebaseUser = auth.currentUser;

  const name =
    useSelector((state) => state.auth?.user?.name) ||
    firebaseUser?.displayName ||
    firebaseUser?.email?.split('@')[0] ||
    'Admin';

  const handleLanguageChange = (value) => {
    dispatch(setLanguage(value));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token'); // nếu bạn dùng token trong localStorage
      navigate('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key='profile' icon={<UserOutlined />} className='hover:bg-gray-700 text-white'>
        {t('profile')}
      </Menu.Item>
      <Menu.Item key='logout' icon={<LogoutOutlined />} className='hover:bg-gray-700 text-white' onClick={handleLogout}>
        {t('logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className='bg-header-admin h-[60px] w-full text-white shadow-md flex justify-between items-center px-4'>
      <div className='flex items-center'>
        <NavLink to='/' className='text-xl font-bold text-white'>
          <img
            src='https://lh3.googleusercontent.com/pw/ADCreHd5PMvwKUSbjtSRpUfeyDaazAbdXF1H0arvHtS62AyfivDEAN6hRSq-GTJ6wKiyn-9IEr63aaiNtFq6J2fP_I6VtpGAIwqAQu4B2mL64M2h2HHkPY4VhRWoDpag5VXN3Dxtwb277ZDkXPa0mnDxTTGL=w256'
            alt='Logo'
            width='150px'
          />
        </NavLink>
      </div>

      <div className='flex items-center space-x-4'>
        <Select
          value={language}
          className='w-28 text-black'
          onChange={handleLanguageChange}
          options={[
            { value: 'vi', label: '🇻🇳 Tiếng Việt' },
            { value: 'en', label: '🇬🇧 English' },
          ]}
        />

        <Popover content={menu} trigger='click'>
          <Button type='text' className='text-white hover:text-red-500 flex items-center space-x-2'>
            <span className='font-semibold'>{name}</span>
            <DownOutlined />
          </Button>
        </Popover>
      </div>
    </Header>
  );
};

export default AdminHeader;