import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TermsPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              <FileText size={14} /> Official Platform Agreement
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              PetZoe Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Last updated: October 28, 2026 • Please read these terms carefully before utilizing our telemedicine, health tracking, marketplace, or adoption services.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering an account on, or interacting with <strong>PetZoe</strong> (the &ldquo;Platform&rdquo;), you confirm that you have read, understood, and agreed to be legally bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must refrain from using the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">2. Platform Ecosystem & User Roles</h2>
            <p>
              PetZoe operates a unified ecosystem connecting multiple pet care stakeholders under distinct access controls:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-xs text-slate-900 mb-1">Pet Owners</h3>
                <p className="text-xs text-slate-500">Access pet health charts, book veterinary consultations, apply for adoptions, and purchase verified pet products.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-xs text-slate-900 mb-1">Veterinarians</h3>
                <p className="text-xs text-slate-500">Conduct certified video consultations, manage digital patient records, and author clinical prescriptions.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-xs text-slate-900 mb-1">Shelter Managers</h3>
                <p className="text-xs text-slate-500">Oversee rescued animals, manage intake documentation, and review prospective adopter applications.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-xs text-slate-900 mb-1">Marketplace Sellers</h3>
                <p className="text-xs text-slate-500">List certified nutritional, pharmaceutical, and wellness items compliant with national standards.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">3. Telemedicine & Veterinary Consultations</h2>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
              <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="block font-bold">Important Emergency Notice:</strong>
                PetZoe Telemedicine is intended for general health triage, follow-up evaluations, behavioral advice, and preventative care. In cases of severe trauma, poison ingestion, breathing distress, or acute life-threatening symptoms, immediately transport your companion to the nearest 24/7 physical animal hospital.
              </div>
            </div>
            <p>
              All veterinary professionals practicing on PetZoe represent that they hold valid, unrestricted veterinary medical licenses in their respective jurisdictions. Prescriptions issued through PetZoe are strictly for non-controlled substances permissible under telehealth legislation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">4. Digital Pet Identity (PZ-PET-ID) & Health Records</h2>
            <p>
              Each registered pet receives an immutable alphanumeric <strong>PZ-PET-ID</strong>. The platform records immunizations, diagnostic summaries, weight logs, and prescriptions. Pet owners control access permissions and authorize registered veterinarians and verified shelters to consult these records.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">5. Humane Animal Adoption Standards</h2>
            <p>
              PetZoe is committed to the humane treatment of animals:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Commercial puppy mills, unregistered breeders, and live animal sales for commercial profit are strictly prohibited on PetZoe.</li>
              <li>All adoption listings must originate from verified shelters or registered rescue caretakers.</li>
              <li>Shelters retain the right to approve or reject adoption requests following background safety screenings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">6. Marketplace Orders & Commerce</h2>
            <p>
              Purchases made via the PetZoe Marketplace are secured with encrypted payment handling. Sellers are solely responsible for genuine batch certifications and accurate ingredient disclosures. Defective items can be returned in accordance with our 7-day return window.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-black text-xl text-slate-900">7. Account Security & Contact</h2>
            <p>
              You must maintain the confidentiality of your account credentials. For inquiries regarding these Terms, contact our platform operations desk at <a href="mailto:legal@petzoe.com" className="text-blue-600 font-bold hover:underline">legal@petzoe.com</a>.
            </p>
          </section>

          {/* Quick Actions Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Ready to start your pet&rsquo;s healthcare journey?
            </span>
            <div className="flex gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#112A46] hover:bg-[#1E3A5F] text-white shadow-md transition-all"
              >
                Create Account
              </Link>
              <Link
                to="/privacy"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              >
                View Privacy Policy
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
