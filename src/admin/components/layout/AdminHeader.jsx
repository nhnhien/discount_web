import { Button, Menu, Popover, Select } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { NavLink, useNavigate } from 'react-router-dom';
import { DownOutlined, LogoutOutlined } from '@ant-design/icons';
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
      <Menu.Item key='logout' icon={<LogoutOutlined />} className='hover:bg-gray-700 text-white' onClick={handleLogout}>
        {t('logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className='bg-header-admin h-[60px] w-full text-white shadow-md flex justify-between items-center px-4'>
      <div className='flex items-center'>
      <NavLink to='/' className='text-2xl font-extrabold text-white tracking-wider'>
  ADMIN
</NavLink>

      </div>

      <div className='flex items-center space-x-4'>
        <Select
          value={language}
          className='w-28 text-black'
          onChange={handleLanguageChange}
          // Thay dropdownClassName bằng popupClassName
          popupClassName="custom-dropdown"
          // Thay bordered bằng variant
          variant="outlined"
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
      
      {/* Xóa style JSX với thuộc tính jsx và global */}
    </Header>
  );
};

export default AdminHeader;