import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 서비스 워커 등록을 위한 import
import { register } from './serviceWorkerRegistration.js';  // src/serviceWorkerRegistration.js로 수정

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 서비스 워커 등록
register();
