import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import AppContextProvider from './context/AppContext';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AppContextProvider>
    <StrictMode>
    <App/>
  </StrictMode>
  </AppContextProvider>
  </BrowserRouter>
)
