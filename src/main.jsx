import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './assets/styles/dashboard.css'; 
import { Provider } from 'react-redux';
import { persistor, store } from './context/store.js';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
);
