import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './fonts.css';
import './index.css';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import ParkingDesigner from './pages/ParkingDesigner';
import ProtectedRoute from './routes/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <NotificationProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<App />} />
          <Route path="/designer" element={<ParkingDesigner />} />
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  </NotificationProvider>
);