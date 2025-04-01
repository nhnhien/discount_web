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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        dispatch(
          setCurrentUser({
            id: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            token,
          })
        );
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