import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout';
import { HomeScreen } from '../pages/home';
import { CheckoutScreen } from '../pages/checkout';
import { SignInScreen } from '../pages/auth';
import { AdminLayout } from '../admin/components/layout';
import { DashboardAdmin } from '../admin/features/dashboard';
import { ProductManager } from '../admin/features/product';
import NotFoundScreen from '../pages/NotFoundScreen';
import ProductEditor from '../admin/features/product/ProductEditor';
import CPManager from '@/admin/features/custom-pricing/components/CPManager';
import CPEditor from '@/admin/features/custom-pricing/components/CPEditor';
import ProductScreen from '@/pages/product/components/ProductScreen';
import ProductMain from '@/pages/product/components/ProductMain';
import ProductCard from '@/pages/product/components/ProductCard';
import CartScreen from '@/pages/cart/components/CartScreen';
import QBManager from '@/admin/features/quantity-break/components/QBManager';
import QBEditor from '../admin/features/quantity-break/components/QBEditor';
// import PaymentSuccess from '@/pages/payment/PaymentSuccess';
import OrderSuccess from '@/pages/payment/OrderSuccess';
import OrdersScreen from '@/pages/order/OrdersScreen';
import OrderManager from '@/admin/features/order/OrderManager';
import CustomerManager from '@/admin/features/customer/CustomerManager';
import ProfileScreen from '@/pages/profile/ProfileScreen';
import PriceListManager from '@/admin/features/price-list/PriceListManager';
import PLEditor from '@/admin/features/price-list/components/PLEditor';
import RequireRole from '@/components/auth/RequireRole';

const mainRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomeScreen />,
      },
      {
        path: '/products',
        element: <ProductScreen />,
      },
      {
        path: '/product/:id',
        element: <ProductMain />,
      },
      {
        path: '/cart',
        element: <CartScreen />,
      },
      {
        path: '/checkout',
        element: <CheckoutScreen />,
      },
      {
        path: '/sign-in',
        element: <SignInScreen />,
      },
      {
        path: '*',
        element: <NotFoundScreen />,
      },
      // {
      //   path: '/payment-success',
      //   element: <PaymentSuccess />,
      // },
      {
        path: '/order-success/:id',
        element: <OrderSuccess />,
      },
      {
        path: '/orders', 
        element: <OrdersScreen />, 
      },
      {
        path: '/profile',
        element: <ProfileScreen />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireRole allowedRoles={[1]}>
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <DashboardAdmin /> },
      { path: 'product', element: <ProductManager /> },
      { path: 'product/create', element: <ProductEditor /> },
      { path: 'product/edit/:id', element: <ProductEditor /> },
      { path: 'discounts/cp', element: <CPManager /> },
      { path: 'discount/cp/create', element: <CPEditor /> },
      { path: 'discount/cp/edit/:id', element: <CPEditor /> },
      { path: 'discounts/qb', element: <QBManager /> },
      { path: 'discount/qb/create', element: <QBEditor /> },
      { path: 'discount/qb/edit/:id', element: <QBEditor /> },
      { path: 'orders', element: <OrderManager /> },
      { path: 'customer', element: <CustomerManager /> },
      { path: 'discounts/pl', element: <PriceListManager /> },
      { path: 'discount/pl/create', element: <PLEditor /> },
      { path: 'discount/pl/edit/:id', element: <PLEditor /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  }
]);

export default mainRouter;