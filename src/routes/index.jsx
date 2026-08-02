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

// Protected Dashboards
import ProtectedRoute from '../components/ProtectedRoute';
import OwnerDashboard from '../pages/dashboard/OwnerDashboard';
import VetDashboard from '../pages/dashboard/VetDashboard';
import ShelterDashboard from '../pages/dashboard/ShelterDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
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
      }
    ]
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute allowedRoles={['Pet Owner', 'Veterinarian', 'Shelter Manager', 'Admin']} />,
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
        element: <AdminDashboard />
      }
    ]
  }
]);
