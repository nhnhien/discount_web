import React from 'react';
 import Header from './Header';
 import { Outlet } from 'react-router-dom';
 import Footer from './Footer';

 const Layout = () => {
  return (
    <div className="min-h-screen bg-orange-100">
      <Header />
      <main className="min-h-[80vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};





export default Layout;
