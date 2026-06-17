import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RoleProvider } from './context/RoleContext';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline video caching
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {},
    onOfflineReady() {
      console.log('App ready for offline use (Service Worker active)');
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoleProvider>
      <App />
    </RoleProvider>
  </StrictMode>,
);
