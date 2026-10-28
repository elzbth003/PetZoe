import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  PawPrint, Heart, Stethoscope, ShieldCheck, Sparkles, 
  Activity, Star, CheckCircle2, Lock, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Left Panel: Classic, Professional & Elegant Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-b from-[#0A1628] via-[#0E1F38] to-[#0A1628] text-white p-10 xl:p-14 flex-col justify-between overflow-hidden shadow-2xl border-r border-slate-800/80">
        
        {/* Subtle, refined atmospheric lighting */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-[#F6BD60]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-gradient-to-tr from-[#84A59D]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-950/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group z-10 self-start select-none">
          <span className="font-display font-black text-2xl tracking-tight text-white flex items-center">
            PetZ
            <span className="inline-block group-hover:rotate-12 transition-transform duration-300">
              <PawPrint size={24} className="fill-current text-[#F6BD60] mx-0.5" />
            </span>
            e
          </span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[9px] uppercase tracking-widest font-bold text-slate-300 border border-white/10">
            Clinical Health
          </span>
        </Link>

        {/* Main Content Showcase */}
        <div className="my-auto z-10 relative space-y-7 py-4 max-w-md">
          
          {/* Header Typography */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-200 tracking-wide">
                Universal Digital Veterinary Ecosystem
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl xl:text-[2.5rem] leading-[1.18] tracking-tight text-white">
              Exceptional care for the companions who{' '}
              <span className="font-serif italic font-normal text-[#F6BD60]">mean everything.</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              A unified clinical platform connecting pet parents, licensed veterinarians, and shelter care with real-time digital continuity.
            </p>
          </motion.div>

          {/* Hero Clinical Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 p-4 sm:p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Top patient profile bar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-2 ring-white/20 shrink-0 bg-slate-800">
                  <img
                    src="/images/animals/milo-dachshund.jpg"
                    alt="Milo - Patient Record"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/happy_golden_retriever.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-tight">Milo</h3>
                    <span className="text-[10px] text-slate-400 font-mono">PZ-PET-0021</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">Dachshund Cross • 14 Months</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Verified Patient</span>
              </div>
            </div>

            {/* Middle vitals & health stats */}
            <div className="grid grid-cols-3 gap-2 py-3.5 border-b border-white/10 text-center">
              <div className="bg-white/[0.03] rounded-xl p-2 border border-white/5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vaccines</span>
                <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 size={11} /> Up to Date
                </span>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2 border border-white/5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Weight</span>
                <span className="text-xs font-bold text-white mt-0.5 block">9.5 kg</span>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2 border border-white/5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sterilization</span>
                <span className="text-xs font-bold text-white mt-0.5 block">Sterilized</span>
              </div>
            </div>

            {/* Bottom active consultation appointment preview */}
            <div className="pt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#84A59D]/20 text-[#84A59D]">
                  <Stethoscope size={14} />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-300 block">Next Scheduled Checkup</span>
                  <span className="text-xs font-bold text-white">Dr. Sarah Jenkins, DVM</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
                10:30 AM
              </span>
            </div>
          </motion.div>

          {/* Core Healthcare Pillars: Minimalist, Refined Rows */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className="p-2 rounded-lg bg-white/10 text-[#F6BD60] shrink-0 mt-0.5">
                <Stethoscope size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Board-Certified Telemedicine</h4>
                <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                  Real-time video consults with certified veterinarians and electronic prescriptions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className="p-2 rounded-lg bg-white/10 text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Immutable PZ-PET-ID</h4>
                <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                  Continuous digital health charts, vaccination records, and verified adoption registry.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className="p-2 rounded-lg bg-white/10 text-sky-400 shrink-0 mt-0.5">
                <Activity size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Clinical AI Health Screening</h4>
                <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                  Intelligent symptom assessment and instant guidance during urgent triage moments.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof & Clinical Trust Quote */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                <strong className="text-white font-bold">4.9 / 5.0</strong> clinical satisfaction
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              10,000+ Enrolled Pets
            </span>
          </div>

        </div>

        {/* Footer Credit & Compliance */}
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
