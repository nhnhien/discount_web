import { RouterProvider } from 'react-router-dom';
import mainRouter from './router/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
<<<<<<< HEAD
=======

>>>>>>> 578b5de (update: UI admin)
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={mainRouter} />
    </QueryClientProvider>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 578b5de (update: UI admin)
