import { useState, useEffect } from 'react';
 import { auth, provider, signInWithPopup, signOut } from '../../config/firebase.config';
 import { Button, Card, Avatar, message } from 'antd';
 import { GoogleOutlined, LogoutOutlined } from '@ant-design/icons';
 
 const API_URL = 'http://localhost:8000/api/auth/sync-user';

const SignInScreen = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
        if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider.setCustomParameters({ prompt: 'select_account' }));
      const idToken = await result.user.getIdToken();
       console.log('🚀 ~ handleLogin ~ idToken:', idToken);
 
       const response = await fetch(API_URL, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${idToken}`,
         },
       });
 
       const data = await response.json();
 
       if (response.ok) {
         setUser(data.user);
         localStorage.setItem('user', JSON.stringify(data.user));
       } else {
         throw new Error(data.message);
       }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
       message.error('Đăng nhập thất bại!');    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
    <Card className='shadow-lg p-6 rounded-lg w-96 text-center'>
        {user ? (
          <>
 <Avatar size={64} src={user.avatar} />
             <h2 className='mt-2 text-lg font-semibold'>{user.username}</h2>
             <p className='text-gray-500'>{user.email}</p>
             <Button type='primary' danger icon={<LogoutOutlined />} className='mt-4 w-full' onClick={handleLogout}>
              Đăng xuất
            </Button>
          </>
        ) : (
          <>
            <h2 className='text-lg font-semibold mb-4'>Đăng nhập</h2>
             <Button type='primary' icon={<GoogleOutlined />} className='w-full' onClick={handleLogin}>
              Đăng nhập với Google
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};


export default SignInScreen;
