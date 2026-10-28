import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  PawPrint, Heart, Stethoscope, ShieldCheck, Sparkles, 
  Activity, Star, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Left Panel: High-Impact Hero Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-[#0B1C2F] via-[#112A46] to-[#1E3A5F] text-white p-12 flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* Ambient background glow & grid effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-1.5 cursor-pointer group z-10 self-start select-none">
          <span className="font-display font-black text-2xl tracking-tight text-white flex items-center">
            PetZ
            <span className="inline-block group-hover:rotate-12 transition-transform duration-300">
              <PawPrint size={24} className="fill-current text-secondary-300 mx-0.5 animate-pulse" />
            </span>
            e
          </span>
        </Link>

        {/* Main Content Showcase */}
        <div className="my-auto z-10 relative space-y-7 py-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-sky-200 text-xs font-bold border border-white/15 backdrop-blur-md shadow-sm">
              <Sparkles size={13} className="text-amber-300" />
              <span>Universal Digital Pet Healthcare</span>
            </div>

            <h1 className="font-display font-black text-3xl xl:text-4xl leading-tight tracking-tight text-white">
              Caring for Your <br />
              Companions with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-teal-200 to-amber-200">
                Intelligent Care.
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-sm leading-relaxed">
              Join thousands of pet parents, certified veterinarians, and animal welfare organizations in one unified health ecosystem.
            </p>
          </motion.div>

          {/* Interactive Feature Pills */}
          <div className="space-y-3 pt-2">
            <motion.div 
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 transition-colors"
            >
              <div className="p-2.5 bg-blue-500/20 text-sky-300 rounded-xl shrink-0">
                <Stethoscope size={18} />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs font-bold text-white tracking-wide">Real-Time Telemedicine</h4>
                <p className="text-[11px] text-slate-300 truncate">Book verified consultations with live doctor presence</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 transition-colors"
            >
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs font-bold text-white tracking-wide">Permanent PZ-PET-ID</h4>
                <p className="text-[11px] text-slate-300 truncate">Immutable digital medical charts, vaccines & prescriptions</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 transition-colors"
            >
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl shrink-0">
                <Activity size={18} />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs font-bold text-white tracking-wide">AI Health Screening & Triage</h4>
                <p className="text-[11px] text-slate-300 truncate">VetScan lesion analysis & 24/7 clinical AI assistance</p>
              </div>
            </motion.div>
          </div>

          {/* Social Proof Badge */}
          <div className="pt-2 flex items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#112A46] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="Pet Parent" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#112A46] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Veterinarian" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#112A46] object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80" alt="Shelter Manager" />
            </div>
            <div className="text-[11px] text-slate-300 leading-tight">
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-current" />
                ))}
              </div>
              <span className="font-semibold text-white">10,000+ Pets</span> protected nationwide
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            256-Bit SSL Encrypted
          </span>
          <span>&copy; {new Date().getFullYear()} PetZoe Healthcare</span>
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
