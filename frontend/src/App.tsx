import React from 'react';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PackageDetailPage } from './pages/PackageDetailPage';
import { CartPage } from './pages/CartPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersListPage } from './pages/OrdersListPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:service" element={<ServicesPage />} />
        <Route path="/service-package/:packageId" element={<PackageDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Navigate to="/cart" replace />} />
        <Route path="/checkout/slot" element={<Navigate to="/cart" replace />} />
        <Route path="/checkout/review" element={<Navigate to="/cart" replace />} />
        {/* Orders (parent order view) */}
        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/orders/:orderId/success" element={<OrderSuccessPage />} />
        {/* Bookings (per-service booking view) */}
        <Route path="/bookings" element={<Navigate to="/orders" replace />} />
        <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
        {/* Profile & Auth */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  );
};
