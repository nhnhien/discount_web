import { GoHomeFill } from 'react-icons/go';
import { IoPricetag } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { BsFillCartCheckFill } from 'react-icons/bs';
import { RiDiscountPercentFill } from 'react-icons/ri';
const AdminNavigationItems = [
  {
    id: 1,
    title: 'Home',
    icon: <GoHomeFill size='18' />,
    link: '/admin',
  },
  {
    id: 2,
    title: 'Orders',
    icon: <BsFillCartCheckFill size='18' />,
    link: '/admin/orders',
  },
  {
    id: 3,
    title: 'Product',
    icon: <IoPricetag size='18' />,
    link: '/admin/product',
  },
  {
    id: 4,
    title: 'Customers',
    icon: <FaUser size='18' />,
    link: '/admin/customer',
  },
  {
    id: 5,
    title: 'Discounts',
    icon: <RiDiscountPercentFill size='18' />,
    link: '/admin/discounts',
    children: [
      {
        id: 51,
        title: 'Custom Pricing',
        link: '/admin/discounts/cp',
      },
      {
        id: 52,
        title: 'Price List',
        link: '/admin/discounts/pl',
      },
      {
        id: 53,
        title: 'Quantity Break',
        link: '/admin/discounts/qb',
      },
    ],
  },
];


export { AdminNavigationItems };
