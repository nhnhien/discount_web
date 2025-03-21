import { Input, Button, Dropdown, Menu, Select } from 'antd';
import { SearchOutlined, HeartOutlined, ShoppingCartOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import { setLanguage } from '@/context/slice/language';
import { useTranslation } from 'react-i18next';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const languages = [
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];
const Header = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const handleLanguageChange = (value) => {
    dispatch(setLanguage(value));
  };

  const currentUser = useSelector((state) => state.auth.currentUser);
  const [menuOpen, setMenuOpen] = useState(false);

  const userMenu = (
    <Menu>
      <Menu.Item key='settings' icon={<SettingOutlined />}>
        {t('home.settings')}
      </Menu.Item>
      <Menu.Item key='logout' icon={<LogoutOutlined />}>
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
             <Button type='text' shape='circle' icon={<ShoppingCartOutlined className='text-gray-600 text-xl' />} />
 
             {currentUser ? (
               <Dropdown overlay={userMenu} trigger={['click']}>
                 <Button type='text' className='flex items-center space-x-2'>
                   <UserOutlined className='text-gray-600 text-xl' />
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
        </nav>
      </div>
    </header>
  );
};


export default Header;
