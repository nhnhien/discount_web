import { GoHomeFill } from 'react-icons/go';
import { IoPricetag } from 'react-icons/io5';
import { FaUser, FaTags } from 'react-icons/fa';
import { BsFillCartCheckFill } from 'react-icons/bs';
import { RiDiscountPercentFill } from 'react-icons/ri';
import { MdLocalShipping } from 'react-icons/md'; 

const getAdminNavigationItems = (t) => [
  {
    id: 1,
    title: t('sidebar.home'), // ✅ Dùng key từ JSON
    icon: <GoHomeFill size='18' />,
    link: '/admin',
  },
  {
    id: 2,
    title: t('sidebar.orders'),
    icon: <BsFillCartCheckFill size='18' />,
    link: '/admin/orders',
  },
  {
    id: 3,
    title: t('sidebar.product'),
    icon: <IoPricetag size='18' />,
    link: '/admin/product',
    children: [
      {
        id: 31,
        title: 'Sản phẩm',
        link: '/admin/product',
      },
      {
        id: 32,
        title: 'Danh mục',
        link: '/admin/category',
      },
    ],
  },
  {
    id: 4,
    title: t('sidebar.customers'),
    icon: <FaUser size='18' />,
    link: '/admin/customer',
  },
  {
    id: 5,
    title: t('sidebar.discounts'),
    icon: <RiDiscountPercentFill size='18' />,
    link: '/admin/discounts',
    children: [
      {
        id: 50,
        title: t('sidebar.voucher'),
        link: '/admin/discounts',
      },
      {
        id: 51,
        title: t('sidebar.custom_pricing'),
        link: '/admin/discounts/cp',
      },
      {
        id: 52,
        title: t('sidebar.price_list'),
        link: '/admin/discounts/pl',
      },
      {
        id: 53,
        title: t('sidebar.quantity_break'),
        link: '/admin/discounts/qb',
      },
    ],
  },

  {
    id: 6,
    title: t('sidebar.shipping_fee'),
    icon: <MdLocalShipping size='18' />,
    link: '/admin/shipping-fee',
  },
];
export { getAdminNavigationItems };