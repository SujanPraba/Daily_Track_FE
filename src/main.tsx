import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import { store } from './app/store';

// Import styles
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
          <App />
          <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);