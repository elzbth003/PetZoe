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
import VeterinarianManagement from '../pages/dashboard/admin/VeterinarianManagement';
import VeterinarianReview from '../pages/dashboard/admin/VeterinarianReview';
import VerificationQueue from '../pages/dashboard/admin/VerificationQueue';
import UserManagement from '../pages/dashboard/admin/UserManagement';
import ProductModeration from '../pages/dashboard/admin/ProductModeration';
import ShelterVerificationReview from '../pages/dashboard/admin/ShelterVerificationReview';
import AdoptionListingReview from '../pages/dashboard/admin/AdoptionListingReview';
import AdminSettings from '../pages/dashboard/admin/AdminSettings';
import SellerDashboard from '../pages/dashboard/SellerDashboard';

// Marketplace Pages
import MarketplaceHome from '../pages/marketplace/MarketplaceHome';
import ProductListingPage from '../pages/marketplace/ProductListingPage';
import ProductDetailPage from '../pages/marketplace/ProductDetailPage';
import CartPage from '../pages/marketplace/CartPage';
import WishlistPage from '../pages/marketplace/WishlistPage';
import OrderHistoryPage from '../pages/marketplace/OrderHistoryPage';

// Adoption Pages
import AdoptionListingsPage from '../pages/adoption/AdoptionListingsPage';
import AdoptionDetailPage from '../pages/adoption/AdoptionDetailPage';
import AdoptionApplicationPage from '../pages/adoption/AdoptionApplicationPage';

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
      // Public Adoption Routes
      {
        path: 'adopt',
        element: <AdoptionListingsPage />
      },
      {
        path: 'adopt/:id',
        element: <AdoptionDetailPage />
      },
      {
        path: 'adopt/:id/apply',
        element: <ProtectedRoute allowedRoles={['Pet Owner']} />,
        children: [{ index: true, element: <AdoptionApplicationPage /> }]
      },
      // Protected Marketplace Routes (require login but any role can buy)
      {
        path: 'marketplace/cart',
        element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager']} />,
        children: [{ index: true, element: <CartPage /> }]
      },
      {
        path: 'marketplace/wishlist',
        element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager']} />,
        children: [{ index: true, element: <WishlistPage /> }]
      },
      {
        path: 'marketplace/orders',
        element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager']} />,
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
    path: '/admin-login',
    element: <AdminLogin />
  },
  {
    path: '/dashboard',
    // Requiring login here is enough to redirect anonymous users to /login;
    // each role's own dashboard below is still individually role-gated so a
    // logged-in user of one role can't reach another role's dashboard by URL.
    element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager', 'Admin', 'Marketplace Seller']} />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['Pet Owner']} />,
        children: [{ path: 'owner', element: <OwnerDashboard /> }]
      },
      {
        element: <ProtectedRoute allowedRoles={['Veterinarian']} />,
        children: [{ path: 'vet', element: <VetDashboard /> }]
      },
      {
        element: <ProtectedRoute allowedRoles={['Shelter Manager']} />,
        children: [{ path: 'shelter', element: <ShelterDashboard /> }]
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['Admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardHome /> },
              { path: 'users', element: <UserManagement /> },
              { path: 'veterinarians', element: <VeterinarianManagement /> },
              { path: 'veterinarians/:id', element: <VeterinarianReview /> },
              { path: 'shelters', element: <ShelterVerificationReview /> },
              { path: 'sellers', element: <VerificationQueue entityType="Marketplace Seller" title="Seller Verification" /> },
              { path: 'products', element: <ProductModeration /> },
              { path: 'adoptions', element: <AdoptionListingReview /> },
              { path: 'settings', element: <AdminSettings /> }
            ]
          }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={['Marketplace Seller']} />,
        children: [{ path: 'seller', element: <SellerDashboard /> }]
      }
    ]
  }
]);
