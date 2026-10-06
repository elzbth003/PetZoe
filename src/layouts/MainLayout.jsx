import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PetZoeChatbot from '../components/chat/PetZoeChatbot';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
      <PetZoeChatbot />
    </div>
  );
}
