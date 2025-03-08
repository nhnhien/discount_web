// src/components/NotFoundScreen.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import notFound from '../assets/images/404.png';

const NotFoundScreen = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[55vh] bg-gray-100'>
      <img src={notFound} alt='404 Not Found' className='' />

      <h1 className='text-4xl font-bold text-red-600'>404</h1>
      <p className='text-xl text-gray-700 mt-2'>Oops! Page not found.</p>

      <Link to='/'>
        <Button type='primary' className='mt-4'>
          Go to Home
        </Button>
      </Link>
    </div>
  );
};

<<<<<<< HEAD
export default NotFoundScreen;
=======
export default NotFoundScreen;
>>>>>>> 578b5de (update: UI admin)
