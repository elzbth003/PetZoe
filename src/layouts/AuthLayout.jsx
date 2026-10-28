import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  PawPrint, Stethoscope, ShieldCheck, 
  Activity, Star, CheckCircle2, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Left Panel: High-End Medical & Clinical Technology Showcase (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-[#070F1E] via-[#0B182B] to-[#081222] text-white p-10 xl:p-14 flex-col justify-between overflow-hidden shadow-2xl border-r border-slate-800/80">
        
        {/* Ambient Glow & Precision Radial Lighting */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer group z-10 self-start select-none">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <PawPrint size={22} className="text-[#F6BD60] fill-[#F6BD60]" />
          </div>
          <div>
            <div className="font-display font-black text-2xl tracking-tight text-white flex items-center leading-none">
              PetZoe
            </div>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 block mt-0.5">
              Veterinary Health Network
            </span>
          </div>
        </Link>

        {/* Main Content Showcase */}
        <div className="my-auto z-10 relative space-y-6 py-4 max-w-md">
          
          {/* Header Typography */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3.5"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-300 tracking-wide uppercase">
                Certified Veterinary Health Ecosystem
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl xl:text-[2.5rem] leading-[1.15] tracking-tight text-white">
              Exceptional clinical care for your lifelong companion.
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              A unified digital healthcare platform connecting pet parents, licensed veterinarians, and shelter care with real-time clinical continuity.
            </p>
          </motion.div>



          {/* Three Key Pillars: Modern, Compact, Professional */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Stethoscope size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white">Board-Certified Telehealth</h4>
                <p className="text-[11px] text-slate-300 truncate">On-demand video consults & digital prescriptions</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white">Unified PZ-PET-ID™ Health Pass</h4>
                <p className="text-[11px] text-slate-300 truncate">Verified vaccination registry & medical history</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Activity size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white">Clinical AI Health Screening</h4>
                <p className="text-[11px] text-slate-300 truncate">Instant triage guidance & symptom assessment</p>
              </div>
            </div>
          </div>

          {/* Social Proof & Clinical Trust Rating */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-slate-300 font-semibold">
                <strong className="text-white font-bold">4.9 / 5.0</strong> Clinical Rating
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              15,000+ Enrolled Pets
            </span>
          </div>

        </div>

        {/* Footer Security Badge */}
        <div className="z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Lock size={12} className="text-emerald-400" />
            256-Bit SSL Encrypted Healthcare Records
          </span>
          <span>&copy; {new Date().getFullYear()} PetZoe</span>
        </div>
      </div>

      {/* Right Panel: Authentication Form Outlet */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-y-auto">
        <div className={`w-full ${isRegister ? 'max-w-xl' : 'max-w-md'} bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative z-10 transition-all duration-300 my-auto`}>
          
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link to="/" className="flex items-center gap-1.5 select-none">
              <span className="font-display font-black text-xl tracking-tight text-slate-900 flex items-center">
                PetZ
                <span className="inline-block hover:rotate-12 transition-transform duration-300">
                  <PawPrint size={20} className="fill-current text-primary-500 mx-0.5 animate-pulse" />
                </span>
                e
              </span>
            </Link>
          </div>

          {/* Animated Route Wrapper */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
