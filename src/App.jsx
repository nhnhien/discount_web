import { RouterProvider } from 'react-router-dom';
import mainRouter from './router/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/i18n/i18n';
import i18n from '@/i18n/i18n';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { setCurrentUser } from '@/context/slice/auth';
import { Spin } from 'antd';
import { loginSuccess, logoutSuccess } from '@/context/slice/auth';
import { syncUser } from './service/user';
import { mergeWishlistOnLogin, clearWishlist } from '@/context/slice/wishlist';
import { store } from '@/context/store';

const queryClient = new QueryClient();

function App() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const [authReady, setAuthReady] = useState(false);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const wishlist = useSelector((state) => state.wishlist);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const user = await syncUser(token); // Gọi API backend
  
          let guestWishlist = [];
          let userWishlist = [];
          try {
            const guestData = localStorage.getItem('wishlist_guest');
            if (guestData) guestWishlist = JSON.parse(guestData);
            const userData = localStorage.getItem(`wishlist_${user.id}`);
            if (userData) userWishlist = JSON.parse(userData);
          } catch {}

          // Chỉ merge guestWishlist nếu user chưa có wishlist riêng
          if (userWishlist.length > 0) {
            dispatch(mergeWishlistOnLogin({ guestWishlist: [], userWishlist }));
          } else {
            dispatch(mergeWishlistOnLogin({ guestWishlist, userWishlist: [] }));
          }
          localStorage.removeItem('wishlist_guest');
          // Lưu wishlist mới cho user vào localStorage
          const mergedWishlist = store.getState().wishlist;
          try {
            localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(mergedWishlist));
          } catch {}
        } catch (err) {
          console.error('❌ Lỗi khi syncUser:', err);
        }
      } else {
        // Lưu wishlist hiện tại vào localStorage cho guest trước khi clear
        const wishlist = store.getState().wishlist;
        if (wishlist) {
          try {
            localStorage.setItem('wishlist_guest', JSON.stringify(wishlist));
          } catch {}
        }
        dispatch(logoutSuccess());
        dispatch(clearWishlist());
      }
  
      setAuthReady(true);
    });
  
    return () => unsubscribe();
  }, [dispatch]);
  
  useEffect(() => {
    if (currentUser && currentUser.id) {
      try {
        localStorage.setItem(`wishlist_${currentUser.id}`, JSON.stringify(wishlist));
      } catch {}
    }
  }, [wishlist, currentUser]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang khởi tạo..." />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={mainRouter} />
    </QueryClientProvider>
  );
}

export default App;