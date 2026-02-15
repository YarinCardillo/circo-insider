import React from 'react';
import ReactDOM from 'react-dom/client';
import { SocketProvider } from './contexts/SocketContext';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </React.StrictMode>
);
