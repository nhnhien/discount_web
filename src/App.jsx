import { RouterProvider } from 'react-router-dom';
import mainRouter from './router/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/i18n';
import { useEffect } from 'react';
import i18n from '@/i18n';
import { useSelector } from 'react-redux';

const queryClient = new QueryClient();


function App() {
  const language = useSelector((state) => state.language.language);
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={mainRouter} />
    </QueryClientProvider>
  );
}


export default App;
