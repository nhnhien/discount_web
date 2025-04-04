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

const queryClient = new QueryClient();

function App() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const [authReady, setAuthReady] = useState(false);

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
  
          dispatch(loginSuccess(user)); // ✅ Cập nhật Redux, bao gồm role_id
        } catch (err) {
          console.error('❌ Lỗi khi syncUser:', err);
        }
      } else {
        dispatch(logoutSuccess()); // logout => clear Redux
      }
  
      setAuthReady(true);
    });
  
    return () => unsubscribe();
  }, [dispatch]);
  

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