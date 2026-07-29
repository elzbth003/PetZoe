import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PawPrint, Heart, Stethoscope, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      
      {/* Left Panel: Decorative Graphics (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-tr from-primary-600 via-primary-700 to-secondary-600 text-white p-12 flex-col justify-between overflow-hidden shadow-2xl">
        {/* Floating background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group z-10 self-start">
          <div className="p-2 bg-white/10 rounded-xl text-white backdrop-blur-md border border-white/20 group-hover:scale-105 transition-transform duration-300">
            <PawPrint size={24} className="fill-current text-white" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-white">
            Pet<span className="text-secondary-300">Verse</span>
          </span>
        </Link>

        {/* Content Showcase */}
        <div className="my-auto z-10 relative space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-secondary-200 text-xs font-bold border border-white/10">
              <Stethoscope size={12} />
              Digital Health Platform
            </span>
            <h1 className="font-display font-black text-4xl leading-tight tracking-tight">
              Caring for Your <br />
              Companions is Our <br />
              <span className="text-secondary-300">Highest Calling</span>
            </h1>
            <p className="text-slate-200 text-sm max-w-sm leading-relaxed">
              Log in to access digital medical charts, book real-time vet consultations, and join the local pet healthcare network.
            </p>
          </motion.div>

          {/* Bullet points */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg text-secondary-300 mt-0.5">
                <Heart size={14} className="fill-current" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Comprehensive Medical History</h3>
                <p className="text-xs text-slate-200 mt-0.5">Track every immunization, treatment, and lab result in one secure dashboard.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg text-secondary-300 mt-0.5">
                <ShieldCheck size={14} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Secure Professional Database</h3>
                <p className="text-xs text-slate-200 mt-0.5">All patient data is encrypted and managed under strict security guidelines.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="z-10 text-[10px] text-slate-300 flex justify-between border-t border-white/10 pt-4">
          <span>&copy; PetVerse Healthcare</span>
          <span>Verified Security Standard</span>
        </div>
      </div>

      {/* Right Panel: Authentication Form Outlet */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-20 relative overflow-hidden bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 relative z-10">
          
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-xl text-white shadow-md">
                <PawPrint size={20} className="fill-current" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                Pet<span className="text-primary-600">Verse</span>
              </span>
            </Link>
          </div>

          {/* Animated Route Wrapper */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
