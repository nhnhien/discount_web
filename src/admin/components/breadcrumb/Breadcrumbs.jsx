import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';

const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/product': 'Sản phẩm',
  '/admin/product/create': 'Thêm sản phẩm',
  '/admin/orders': 'Đơn hàng',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Breadcrumb style={{ marginBottom: 16 }}>
      <Breadcrumb.Item>
        <Link to='/admin'>Trang chủ</Link>
      </Breadcrumb.Item>
      {pathnames.map((segment, index) => {
        let url = `/${pathnames.slice(0, index + 1).join('/')}`;
        if (index === pathnames.length - 1 && !breadcrumbMap[url]) {
          return null;
        }

        return (
          <Breadcrumb.Item key={url}>
            {breadcrumbMap[url] ? (
              <Link to={url}>{breadcrumbMap[url]}</Link>
            ) : (
              'Chỉnh sửa'
            )}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};


export default Breadcrumbs;
