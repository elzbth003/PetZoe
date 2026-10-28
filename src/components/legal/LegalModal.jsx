import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LegalModal({ isOpen, onClose, type, onAccept }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTerms = type === 'terms';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#112A46] text-white shadow-sm">
                {isTerms ? <FileText size={20} className="text-[#38BDF8]" /> : <ShieldCheck size={20} className="text-[#38BDF8]" />}
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-slate-900">
                  {isTerms ? 'PetZoe Terms of Service' : 'PetZoe Privacy Policy'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Last updated: October 2026 • Effective for all registered members
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Document Body */}
          <div className="px-6 py-5 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed font-sans">
            {isTerms ? (
              <>
                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">1. Introduction & Acceptance of Terms</h4>
                  <p>
                    Welcome to <strong>PetZoe</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a digital pet healthcare and welfare platform. By creating an account or accessing any PetZoe services (telemedicine, pet health tracking, community adoption, or marketplace), you agree to be bound by these Terms of Service.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">2. Account Registration & User Roles</h4>
                  <p>
                    PetZoe supports multiple verified account roles: <em>Pet Owner</em>, <em>Veterinarian</em>, <em>Shelter Manager</em>, and <em>Marketplace Seller</em>. You agree to provide accurate, complete information during registration and keep your credentials confidential. You are responsible for all activities under your account.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">3. Telemedicine & Veterinary Consultations</h4>
                  <p>
                    PetZoe enables verified pet owners to schedule and conduct live digital consultations with licensed veterinary professionals. 
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>Non-Emergency Disclaimer:</strong> Telemedicine consultations are intended for non-critical triage, behavioral guidance, preventative care, and routine follow-ups. If your animal exhibits life-threatening distress, immediately visit the nearest physical emergency veterinary hospital.</li>
                    <li><strong>Licensed Practitioners:</strong> Only accredited veterinarians registered with relevant medical councils are approved to issue clinical diagnoses and prescriptions on PetZoe.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">4. PZ-PET-ID & Medical Chart Integrity</h4>
                  <p>
                    Each pet registered on PetZoe receives a unique <strong>PZ-PET-ID</strong>. Pet owners grant consent for attending veterinarians and authorized shelters to review uploaded vaccination records, biometric logs, and medical histories to ensure continuous clinical care.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">5. Shelter Adoption & Animal Welfare</h4>
                  <p>
                    Animals listed for adoption or foster care through verified shelters are subject to ethical adoption standards. PetZoe strictly prohibits the commercial breeding, illegal trafficking, or sale of live animals. All adoption listings are vetted for humane care.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">6. Marketplace Products & Payments</h4>
                  <p>
                    Products sold on the PetZoe Marketplace are provided by verified sellers. All pet foods, medications, supplements, and accessories must comply with statutory safety and packaging standards. Payments are securely processed, and refunds follow our standard return policies.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">7. Limitation of Liability</h4>
                  <p>
                    PetZoe operates as a technology platform facilitating connections between pet parents, veterinarians, and animal shelters. We disclaim liability for indirect or consequential damages arising from connectivity issues or veterinary decisions made outside platform guidelines.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">1. Information We Collect</h4>
                  <p>
                    We collect personal information necessary to deliver comprehensive pet care:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>Account Data:</strong> Name, email address, phone number, and authenticated Google OAuth profile data.</li>
                    <li><strong>Pet Health Data:</strong> Pet name, species, breed, age, weight, vaccination history, allergies, and clinical consultation records.</li>
                    <li><strong>Professional Credentials:</strong> Veterinary medical council license numbers, shelter registration certificates, and seller permits for verified roles.</li>
                    <li><strong>Transactional Information:</strong> Appointment bookings, prescription histories, and order delivery addresses.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">2. How We Use Your Information</h4>
                  <p>
                    Your data is strictly utilized to:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Facilitate real-time video and audio veterinary appointments with doctor presence indicators.</li>
                    <li>Generate tamper-proof digital health records and vaccination reminders tied to your PZ-PET-ID.</li>
                    <li>Process marketplace orders and adoption applications.</li>
                    <li>Enhance security and prevent unauthorized access or counterfeit listings.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">3. Data Protection & Encryption</h4>
                  <p>
                    All transmissions across PetZoe are secured using <strong>256-bit SSL/TLS encryption</strong>. Sensitive clinical records and passwords are protected with industry-standard cryptographic hashing. Access to pet charts is strictly restricted to authorized care teams and pet guardians.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">4. Third-Party Sharing</h4>
                  <p>
                    We <strong>do not sell</strong> your or your pet&rsquo;s personal data to third-party advertisers. Information is only shared with essential integrated service providers (such as Google OAuth for authentication, SMS/email gateways for appointment alerts, and payment processors).
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">5. Your Privacy Rights & Controls</h4>
                  <p>
                    You retain full control over your PetZoe data. You may inspect your medical charts, export your pet history, update contact details, or request full account deletion by contacting our privacy desk at <code>privacy@petzoe.com</code>.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to={isTerms ? "/terms" : "/privacy"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 order-2 sm:order-1"
            >
              Open full page <ExternalLink size={13} />
            </Link>

            <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Close
              </button>
              {onAccept && (
                <button
                  type="button"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-[#112A46] hover:bg-[#1E3A5F] text-white shadow-md shadow-[#112A46]/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  I Understand & Agree
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
