import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              <ShieldCheck size={14} /> Data Confidentiality & Protection
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              PetZoe Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Last updated: October 28, 2026 • Discover how we safeguard your personal information, clinical charts, and pet medical histories.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">1. Commitment to Privacy</h2>
            <p>
              At <strong>PetZoe</strong>, we believe pet health data deserves the same stringent security standards as human health records. We are committed to transparency, security, and respect for individual privacy rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">2. Information We Collect</h2>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <strong className="block font-bold text-slate-900 mb-1">User Account Details</strong>
                Full name, email address, mobile phone number, password hash, and authenticated profile attributes if signing in via Google OAuth.
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <strong className="block font-bold text-slate-900 mb-1">Pet Medical Profile (PZ-PET-ID)</strong>
                Pet names, breeds, dates of birth, biometric records, allergy histories, immunization certificates, and attending clinician notes.
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <strong className="block font-bold text-slate-900 mb-1">Telehealth Audio/Video Sessions</strong>
                Appointment booking logs, clinical diagnoses, and prescriptions. Video/audio streams are end-to-end peer encrypted and are not recorded without explicit prior consent.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">3. How Information is Used</h2>
            <p>
              Your data is processed only to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Enable certified veterinary appointments, live telemedicine presence indicators, and prescriptions.</li>
              <li>Maintain immutable health passports for each pet under their PZ-PET-ID.</li>
              <li>Facilitate marketplace order dispatch and order history verification.</li>
              <li>Vet animal adoption applications submitted to animal rescue shelters.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">4. Data Security & 256-Bit Encryption</h2>
            <p>
              We implement comprehensive defense-in-depth security measures:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                  <Lock size={15} /> 256-Bit SSL/TLS
                </div>
                <p className="text-[11px] text-slate-600">All data in transit is encrypted using transport layer security protocols.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <ShieldCheck size={15} /> Role-Based Access
                </div>
                <p className="text-[11px] text-slate-600">Strict separation guarantees only your designated doctor can view patient records.</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                  <Eye size={15} /> Zero Ad-Targeting
                </div>
                <p className="text-[11px] text-slate-600">We never sell, rent, or trade your medical history to advertising brokers.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">5. Your Data Rights</h2>
            <p>
              You may request an export of your pet&rsquo;s clinical records, update profile attributes, or permanently delete your account at any time by contacting <a href="mailto:privacy@petzoe.com" className="text-blue-600 font-bold hover:underline">privacy@petzoe.com</a>.
            </p>
          </section>

          {/* Quick Actions Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Have questions about privacy and data governance?
            </span>
            <div className="flex gap-3">
              <Link
                to="/terms"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#112A46] hover:bg-[#1E3A5F] text-white shadow-md transition-all"
              >
                Terms of Service
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              >
                Join PetZoe
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
