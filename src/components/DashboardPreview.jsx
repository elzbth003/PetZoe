import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Calendar, Clock, Video, FileText, Activity, Shield, Users, 
  ArrowRight, CheckCircle2, TrendingUp, Plus
} from 'lucide-react';

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('owner');

  const tabs = [
    { id: 'owner', label: '🐾 Pet Owner Portal', color: 'from-blue-600 to-indigo-600 text-blue-600' },
    { id: 'vet', label: '🩺 Veterinarian Console', color: 'from-teal-600 to-emerald-600 text-teal-600' },
    { id: 'shelter', label: '🏠 Shelter Logistics', color: 'from-rose-600 to-pink-600 text-rose-600' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-secondary-300 text-[10px] font-bold border border-white/5 uppercase tracking-wider">
            Live Preview
          </span>
          <h3 className="font-display font-extrabold text-xl">Interactive Role-Based Dashboards</h3>
          <p className="text-slate-400 text-xs">Click the tabs below to explore tailored panels for each user type.</p>
        </div>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label.split(' ')[0]} {tab.label.split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 bg-slate-50 min-h-[420px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'owner' && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Pet Profile Info Card */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150" 
                      alt="Milo" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary-500"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Healthy"></span>
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-base text-slate-900">Milo (Golden Retriever)</h4>
                    <p className="text-xs text-slate-500">2 Years Old • Male</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Microchip ID</span>
                    <span className="font-mono font-bold text-slate-800">9810223004561</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Weight Tracker</span>
                    <span className="font-bold text-slate-800">31.2 kg <span className="text-emerald-500 font-medium text-[10px]">(Normal)</span></span>
                  </div>
                </div>

                <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-3 flex items-start gap-2.5">
                  <Activity className="text-primary-600 mt-0.5 shrink-0" size={16} />
                  <div>
                    <h5 className="text-xs font-bold text-primary-900">Health Score: 98%</h5>
                    <p className="text-[10px] text-primary-700 mt-0.5">Vaccinations up to date. Next dose due in 45 days.</p>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <Plus size={14} /> Update Health Log
                </button>
              </div>

              {/* Right Column: Dynamic Feed / Timeline */}
              <div className="lg:col-span-8 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500">
                      <Heart size={16} className="fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Vaccines</p>
                      <p className="text-sm font-black text-slate-900">8 / 9 Completed</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Appts</p>
                      <p className="text-sm font-black text-slate-900">1 Scheduled</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Last Checkup</p>
                      <p className="text-sm font-black text-slate-900">July 15, 2026</p>
                    </div>
                  </div>
                </div>

                {/* Timeline and Next Steps */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-extrabold text-sm text-slate-900">Upcoming Medical Tasks</h4>
                    <span className="text-[10px] text-primary-600 font-bold hover:underline cursor-pointer">View Records</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3 items-start border-l-2 border-slate-100 pl-4 relative">
                      <span className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 bg-primary-600 rounded-full"></span>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h5 className="text-xs font-bold text-slate-800">DHPP Annual Booster</h5>
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Due in 12 days</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Administered by Vance Clinic. Digital vaccine certificate pending upload.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start border-l-2 border-slate-100 pl-4 relative">
                      <span className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 bg-slate-300 rounded-full"></span>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h5 className="text-xs font-bold text-slate-700">Heartworm Preventive Dose</h5>
                          <span className="text-[9px] text-slate-500 font-semibold">August 05, 2026</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Reminder set for 9:00 AM. Pill supplied from PetVerse Pharmacy.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vet' && (
            <motion.div
              key="vet"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Veterinarian Patient Queue */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-slate-900">Virtual Triage Queue</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">2 Patients Waiting Online</p>
                  </div>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full" title="Urgent triage needed"></span>
                        <span className="text-xs font-bold text-slate-800">Bella (Cat)</span>
                      </div>
                      <span className="text-[9px] text-teal-700 font-semibold uppercase">Waiting 4m</span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-1">Owner reports persistent lethargy and refusal of wet food since morning.</p>
                    <button className="w-full py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
                      <Video size={12} /> Launch Video Consultation
                    </button>
                  </div>

                  <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span className="text-xs font-bold text-slate-800">Rocky (German Shepherd)</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold">Waiting 12m</span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-1">Scheduled follow-up regarding post-op stitches healing.</p>
                    <button className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer">
                      <Video size={12} /> Start Call
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Clinic Schedule & Stats */}
              <div className="lg:col-span-7 space-y-6">
                {/* Stats Panel */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600">
                      <Video size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Telehealth Calls</p>
                      <p className="text-sm font-black text-slate-900">14 Today</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Prescriptions Sent</p>
                      <p className="text-sm font-black text-slate-900">8 Logged</p>
                    </div>
                  </div>
                </div>

                {/* Calendar Schedule */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-extrabold text-sm text-slate-900">In-Office Operations</h4>
                    <span className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer">Manage Diary</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">10:30 AM - Rabies Booster shot</p>
                          <p className="text-[9px] text-slate-400">Cooper (Golden Retriever) • Grooming Room 1</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Checked In</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">11:15 AM - Dental Cleaning & Checkup</p>
                          <p className="text-[9px] text-slate-400">Luna (Persian Cat) • Dental Unit</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'shelter' && (
            <motion.div
              key="shelter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Intakes / Adoption Metrics */}
              <div className="lg:col-span-7 space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                      <Heart size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Active Adoptions</p>
                      <p className="text-sm font-black text-slate-900">23 In Progress</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Fosters</p>
                      <p className="text-sm font-black text-slate-900">12 Active Logs</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Background Checks</p>
                      <p className="text-sm font-black text-slate-900">99.8% Success</p>
                    </div>
                  </div>
                </div>

                {/* Intake list / Recent Pets */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-extrabold text-sm text-slate-900">Microchipped Adoptions Inventory</h4>
                    <span className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer">Register New Pet</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=120"
                          alt="Leo"
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Leo (British Shorthair)</p>
                          <p className="text-[9px] text-slate-400">Intake Med Chart: Cleared • Microchip Listed</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">12 Applications</span>
                        <ArrowRight size={12} className="text-slate-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=120"
                          alt="Daisy"
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Daisy (Beagle Mix)</p>
                          <p className="text-[9px] text-slate-400">Fostering Journal: In Progress • Heartworm Cleared</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Fostered (Active)</span>
                        <ArrowRight size={12} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Application Checks */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                <h4 className="font-display font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">Adopter Matching Verification</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>Adopter: Daniel Craig</span>
                      <span className="text-emerald-500">Score: 94%</span>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Home visit completed & verified
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Background checks cleared
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Landlord pet permission uploaded
                      </div>
                    </div>
                    <button className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer">
                      Approve & Log Contract
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
