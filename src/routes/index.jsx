import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPassword';
import AdminLogin from '../pages/AdminLogin';

// Protected Dashboards
import ProtectedRoute from '../components/ProtectedRoute';
import OwnerDashboard from '../pages/dashboard/OwnerDashboard';
import VetDashboard from '../pages/dashboard/VetDashboard';
import ShelterDashboard from '../pages/dashboard/ShelterDashboard';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardHome from '../pages/dashboard/admin/AdminDashboardHome';
import VerificationQueue from '../pages/dashboard/admin/VerificationQueue';
import UserManagement from '../pages/dashboard/admin/UserManagement';
import ProductModeration from '../pages/dashboard/admin/ProductModeration';
import AdoptionReview from '../pages/dashboard/admin/AdoptionReview';
import AdminSettings from '../pages/dashboard/admin/AdminSettings';
import SellerDashboard from '../pages/dashboard/SellerDashboard';

// Marketplace Pages
import MarketplaceHome from '../pages/marketplace/MarketplaceHome';
import ProductListingPage from '../pages/marketplace/ProductListingPage';
import ProductDetailPage from '../pages/marketplace/ProductDetailPage';
import CartPage from '../pages/marketplace/CartPage';
import WishlistPage from '../pages/marketplace/WishlistPage';
import OrderHistoryPage from '../pages/marketplace/OrderHistoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      // Public Marketplace Routes
      {
        path: 'marketplace',
        element: <MarketplaceHome />
      },
      {
        path: 'marketplace/products',
        element: <ProductListingPage />
      },
      {
        path: 'marketplace/products/:id',
        element: <ProductDetailPage />
      },
      // Protected Marketplace Routes (require login but any role can buy)
      {
        path: 'marketplace/cart',
        element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager', 'Admin', 'Marketplace Seller']} />,
        children: [{ index: true, element: <CartPage /> }]
      },
      {
        path: 'marketplace/wishlist',
        element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager', 'Admin', 'Marketplace Seller']} />,
        children: [{ index: true, element: <WishlistPage /> }]
      },
      {
        path: 'marketplace/orders',
        element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager', 'Admin', 'Marketplace Seller']} />,
        children: [{ index: true, element: <OrderHistoryPage /> }]
      }
    ]
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />
      },
      {
        path: 'admin-login',
        element: <AdminLogin />
      }
    ]
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager', 'Admin', 'Marketplace Seller']} />,
    children: [
      {
        path: 'owner',
        element: <OwnerDashboard />
      },
      {
        path: 'vet',
        element: <VetDashboard />
      },
      {
        path: 'shelter',
        element: <ShelterDashboard />
      },

      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardHome /> },
          { path: 'users', element: <UserManagement /> },
          { path: 'vets', element: <VerificationQueue entityType="Veterinarian" title="Veterinarian Verification" /> },
          { path: 'shelters', element: <VerificationQueue entityType="Shelter Manager" title="Shelter Verification" /> },
          { path: 'sellers', element: <VerificationQueue entityType="Marketplace Seller" title="Seller Verification" /> },
          { path: 'products', element: <ProductModeration /> },
          { path: 'adoptions', element: <AdoptionReview /> },
          { path: 'settings', element: <AdminSettings /> }
        ]
      },
      {
        path: 'seller',
        element: <SellerDashboard />
      }
    ]
  }
]);
