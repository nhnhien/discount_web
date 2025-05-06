import { Button, Col, Grid, Row } from 'antd';
 import React from 'react';
 import {
   FacebookOutlined,
   InstagramOutlined,
   YoutubeOutlined,
   TwitterOutlined,
   FacebookFilled,
   InstagramFilled,
   YoutubeFilled,
 } from '@ant-design/icons';
const Footer = () => {
  return (
    <footer className='bg-gray-50 border-t mt-16'>
      <div className='container mx-auto px-4 py-12'>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <h3 className='text-lg font-semibold mb-4'>Customer Support</h3>
            <div className='space-y-2 text-gray-600'>
              <p>Hotline: 1900 1234</p>
              <p>Email: support@fashionstore.com</p>
              <p>Working hours: 8:00 AM - 10:00 PM</p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <h3 className='text-lg font-semibold mb-4'>About Us</h3>
            <div className='flex flex-col space-y-2'>
              {['About', 'Careers', 'Store Locator'].map((item) => (
                <a key={item} href='#' className='text-gray-600 hover:text-gray-900'>
                  {item}
                </a>
              ))}
            </div>
          </Col>

          <Col xs={24} md={8}>
            <h3 className='text-lg font-semibold mb-4'>Policies</h3>
            <div className='flex flex-col space-y-2'>
              {['	Privacy Policy', 'Return Policy', 'Terms of Service'].map((item) => (
                <a key={item} href='#' className='text-gray-600 hover:text-gray-900'>
                  {item}
                </a>
              ))}
            </div>
          </Col>
        </Row>

        <div className='mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-gray-600'>© 2024 FashionStore. All rights reserved</p>
          <div className='flex space-x-4 mt-4 md:mt-0'>
            <div className='flex space-x-4 mt-3'>
              <Button type='text' icon={<FacebookFilled style={{ fontSize: '24px', color: '#1877F2' }} />} />
              <Button type='text' icon={<InstagramFilled style={{ fontSize: '24px', color: '#E4405F' }} />} />
              <Button type='text' icon={<YoutubeFilled style={{ fontSize: '24px', color: '#FF0000' }} />} />
              <Button type='text' icon={<TwitterOutlined style={{ fontSize: '24px', color: '#1DA1F2' }} />} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
