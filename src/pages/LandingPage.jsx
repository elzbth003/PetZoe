import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Shield, Stethoscope, Video, Database, Clock, 
  CheckCircle, ArrowRight, UserCheck, Star, Sparkles, MessageSquare 
} from 'lucide-react';
import Accordion from '../components/Accordion';
import DashboardPreview from '../components/DashboardPreview';
import heroPet from '../assets/hero-pet.png';

// Stats data
const STATS = [
  { label: "Registered Pets", value: "48K+", color: "text-primary-600" },
  { label: "Certified Veterinarians", value: "1,200+", color: "text-secondary-500" },
  { label: "Shelter Connections", value: "350+", color: "text-accent-500" },
  { label: "Customer Satisfaction", value: "99.2%", color: "text-emerald-500" }
];

// Features lists
const FEATURES = [
  {
    icon: Database,
    title: "Digital Health Vault",
    desc: "A centralized electronic record keeping vaccinations, clinical conditions, surgeries, and weight logs secure and HIPAA-ready.",
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    icon: Video,
    title: "24/7 Video Consults",
    desc: "Instantly call licensed veterinarians from your couch. Perfect for late-night questionings or emergency symptom triage.",
    color: "bg-teal-500/10 text-teal-600"
  },
  {
    icon: Heart,
    title: "Shelter & Adoption Hub",
    desc: "Direct communication channels to rescue shelters, digital fostering logs, and streamline background checks for quick adoptions.",
    color: "bg-rose-500/10 text-rose-600"
  },
  {
    icon: Clock,
    title: "Smart Care Reminders",
    desc: "Automatic alerts for heartworm pills, checkups, grooming, and medicine doses. Synchronized straight to your native calendar.",
    color: "bg-amber-500/10 text-amber-600"
  }
];

const SERVICES = [
  {
    title: "Veterinary Telehealth",
    details: ["HD Video consultations", "Immediate chat triage", "Digital prescriptions", "Follow-up notes sent to local clinic"]
  },
  {
    title: "Clinic Operations",
    details: ["Smart scheduling systems", "Digital check-ins", "Automated lab results integration", "Patient dashboard for clinics"]
  },
  {
    title: "Shelter Logistics",
    details: ["Intake medical charting", "Fostering tracking journals", "Microchip directory mapping", "Adopter matching scores"]
  },
  {
    title: "Marketplace Pharmacy",
    details: ["Verified vet meds store", "Auto-refill subscriptions", "Dietary supplements store", "Home delivery packaging"]
  }
];

const FAQS = [
  {
    question: "How do virtual vet consultations work?",
    answer: "You simply request a consultation through your dashboard, select your pet profile, and describe the symptoms. Within minutes, you'll be connected to a certified veterinarian via secure video or text chat."
  },
  {
    question: "Is my pet's medical record secure?",
    answer: "Absolutely. PetVerse uses bank-grade encryption to protect all medical records, pet owner profiles, and payment histories. We strictly align with animal patient safety and security guidelines."
  },
  {
    question: "Can shelters manage adoptions through PetVerse?",
    answer: "Yes! Shelter managers can create custom organizational profiles, intake pets, publish medical logs, check adoptability status, and manage adoption requests directly from their accounts."
  },
  {
    question: "How do I update my pet's weight or vaccination dates?",
    answer: "Once logged in, go to your Pet Dashboard, select 'Medical Records', and click 'Add Entry'. You can type in medical diagnostics, upload PDFs/images of receipts, and set custom reminders."
  }
];

const TESTIMONIALS = [
  {
    name: "Clara Mendosa",
    role: "Golden Retriever Parent",
    rating: 5,
    text: "The 24/7 video consultation saved us a late-night trip to the ER when Milo swallowed a toy. The vet was incredibly calming and gave us clear guidance.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Dr. Arthur Vance",
    role: "Veterinarian, Vance Clinic",
    rating: 5,
    text: "As a practitioner, PetVerse integrates my appointment diary with patient medical history seamlessly. Clients arrive pre-screened and records are always accurate.",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150"
  }
];

export default function LandingPage() {
  const location = useLocation();

  // Scroll to hash in URL if present
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="space-y-24 pb-16">
      
      {/* 1. Hero Section */}
      <section id="hero" className="relative pt-12 md:pt-24 pb-12 overflow-hidden bg-gradient-to-b from-primary-50/50 to-transparent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold border border-primary-200">
              <Sparkles size={12} />
              The Next-Gen Pet Health Management
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight tracking-tight">
              A Unified Ecosystem for <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Digital Pet Care
              </span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              PetVerse connects pet parents, certified vets, shelter networks, and wellness marketplaces. Chart health histories, request live telehealth support, and manage adoption pipelines in a secure HIPAA-aligned dashboard.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-full font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                Get Started Now <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="px-8 py-3.5 rounded-full font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all duration-200 text-sm"
              >
                Learn More
              </a>
            </div>

            {/* Micro Badges */}
            <div className="pt-6 flex flex-wrap justify-center lg:justify-start gap-6 text-xs text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <Shield className="text-primary-600" size={16} /> Verified Security
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="text-secondary-500" size={16} /> Certified Vets
              </div>
            </div>
          </div>

          {/* Hero Right Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-secondary-500/5 rounded-3xl pointer-events-none"></div>
              {/* Animated Hero Image */}
              <img
                src={heroPet}
                alt="PetVerse digital pet healthcare management platform"
                className="w-[90%] h-[90%] object-contain rounded-2xl drop-shadow-[0_20px_50px_rgba(37,99,235,0.15)] animate-float"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center"
            >
              <p className={`font-display font-black text-3xl sm:text-4xl ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            Advanced Care Management, <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              Designed for Pets & Vets
            </span>
          </h2>
          <p className="text-slate-500 text-sm">
            Everything you need to monitor pet wellness, share logs, and consult healthcare professionals in a unified network.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group p-6 bg-white rounded-3xl border border-slate-100 hover:border-primary-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`p-3 rounded-2xl w-fit ${feat.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-950 group-hover:text-primary-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Role-Based Dashboard Preview Section */}
      <section className="max-w-7xl mx-auto px-6 py-4">
        <DashboardPreview />
      </section>

      {/* 4. Services Section */}
      <section id="services" className="bg-slate-100/50 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
              Professional Integrated Solutions
            </h2>
            <p className="text-slate-500 text-sm">
              We align medical databases, vet triage, and adoption centers under a single secure platform.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((serv, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-display font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  {serv.title}
                </h3>
                <ul className="space-y-3">
                  {serv.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={14} className="text-secondary-500 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose PetVerse */}
      <section id="why-us" className="max-w-7xl mx-auto px-6 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Image/Mockup Slot */}
          <div className="flex justify-center order-last lg:order-first">
            <div className="bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-3xl p-8 text-white space-y-6 w-full max-w-md shadow-xl">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Shield size={16} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Health Security Seal</span>
              </div>
              <h3 className="font-display font-bold text-2xl">Ensuring Bank-Level Patient Security</h3>
              <p className="text-xs text-slate-100 leading-relaxed">
                All consult reports and digital records are encrypted with AES-256 standards, aligning with modern healthcare database requirements.
              </p>
              <div className="pt-4 border-t border-white/20 flex gap-8">
                <div>
                  <p className="text-xl font-black">256-bit</p>
                  <p className="text-[10px] text-slate-200 font-semibold uppercase">Encryption</p>
                </div>
                <div>
                  <p className="text-xl font-black">100%</p>
                  <p className="text-[10px] text-slate-200 font-semibold uppercase">HIPAA Compliant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
              Veterinary Systems <br />
              Built on Complete Trust
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We understand that pet health management is highly sensitive. PetVerse was engineered by leading veterinary practitioners and software architects to deliver error-free medical charts and on-time treatment reminders.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 h-fit">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Direct Doctor-to-Patient Channels</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Skip call hold lines. Message verified vets directly from your client hub.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 h-fit">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Multi-Role Support Panels</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Custom layout setups configured specifically for shelter logs, vet charts, and retail.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section id="testimonials" className="bg-slate-100/50 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
              Trusted by 10,000+ Happy Families
            </h2>
            <p className="text-slate-500 text-sm">
              Read how pet owners and veterinarians enhance medical operations with PetVerse.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map((test, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex text-amber-500">
                    {[...Array(test.rating)].map((_, sIdx) => (
                      <Star key={sIdx} size={14} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">
                    "{test.text}"
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-50">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-900">{test.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion Section */}
      <section id="faq" className="max-w-7xl mx-auto px-6 scroll-mt-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm">
            Got queries? Find answer logs for the most common platform questions below.
          </p>
        </div>

        {/* Accordion list */}
        <Accordion items={FAQS} />
      </section>

      {/* 8. Contact Section */}
      <section id="contact" className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12">
          <div className="text-center space-y-3 mb-8">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
              Need Help With Custom Setup?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Our clinical integration support desk is available 24/7. Send us a message and we'll resolve it.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Carter"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@petverse.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 text-xs font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Your Message</label>
              <textarea
                required
                rows="4"
                placeholder="Write your question or request a demo here..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 text-xs font-medium"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/10 hover:shadow-primary-600/25 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} /> Send Message
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
