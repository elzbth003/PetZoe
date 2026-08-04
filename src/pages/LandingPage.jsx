import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Shield, Video, Database, Clock, 
  CheckCircle, ArrowRight, UserCheck, Star, Sparkles, MessageSquare,
  ChevronRight, Stethoscope, ShieldAlert
} from 'lucide-react';
import Accordion from '../components/Accordion';
import DashboardPreview from '../components/DashboardPreview';

// Stats data
const STATS = [
  { label: "Registered Pets", value: "48K+", color: "text-[#38BDF8]" },
  { label: "Certified Vets", value: "1,200+", color: "text-[#F97360]" },
  { label: "Partner Shelters", value: "350+", color: "text-amber-500" },
  { label: "Platform Uptime", value: "99.9%", color: "text-emerald-500" }
];

// Features list
const FEATURES = [
  {
    icon: Database,
    title: "Digital Health Vault",
    desc: "A centralized electronic health record keeping vaccinations, clinical conditions, and weight logs secure and ready.",
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    icon: Video,
    title: "24/7 Virtual Care",
    desc: "Instantly consult licensed veterinarians from your couch. Perfect for late-night questions or emergency triage.",
    color: "bg-teal-500/10 text-teal-600"
  },
  {
    icon: Heart,
    title: "Adoption Logistics",
    desc: "Direct communication channels to rescue shelters, digital fostering logs, and streamlined background checks.",
    color: "bg-rose-500/10 text-rose-600"
  },
  {
    icon: Clock,
    title: "Smart Reminders",
    desc: "Automatic alerts for heartworm pills, checkups, and medicine doses synchronized directly to your calendar.",
    color: "bg-amber-500/10 text-amber-600"
  }
];

const SERVICES = [
  {
    title: "Veterinary Telehealth",
    details: ["HD Video consultations", "Immediate chat triage", "Digital prescriptions", "Follow-up notes for clinics"]
  },
  {
    title: "Clinic Operations",
    details: ["Smart scheduling systems", "Digital check-ins", "Automated lab results", "Patient health dashboards"]
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
    answer: "Absolutely. PetZoe uses bank-grade encryption to protect all medical records, pet owner profiles, and payment histories. We strictly align with animal patient safety and security guidelines."
  },
  {
    question: "Can shelters manage adoptions through PetZoe?",
    answer: "Yes! Shelter managers can create custom organizational profiles, intake pets, publish medical logs, check adoptability status, and manage adoption requests directly from their accounts."
  },
  {
    question: "How do I update my pet's weight or vaccination dates?",
    answer: "Once logged in, go to your Pet Dashboard, select 'My Pets', and edit your pet's details. You can type in medical diagnostics, update vaccination status, and set custom reminders."
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
    text: "As a practitioner, PetZoe integrates my appointment diary with patient medical history seamlessly. Clients arrive pre-screened and records are always accurate.",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150"
  }
];

// Interactive Widget Data
const INTERACTIVE_PET_DATA = {
  Dog: {
    icon: "🐶",
    name: "Dog",
    stages: {
      baby: {
        vaccines: ["DHPP (Distemper, Hepatitis, Parvovirus)", "Bordetella", "Rabies (12-16 weeks)"],
        risks: ["Parvovirus", "Parasites", "Teething issues"],
        weight: "2 - 12 kg (breed dependent)",
        advice: "Feed puppy-specific kibble, start basic socialization, and schedule monthly booster checkups."
      },
      adult: {
        vaccines: ["DHPP Booster (every 1-3 years)", "Rabies Booster (every 1-3 years)", "Leptospirosis"],
        risks: ["Obesity", "Dental disease", "Joint strain"],
        weight: "5 - 40 kg (breed dependent)",
        advice: "Ensure 30-60 mins of daily exercise, brush teeth weekly, and maintain yearly wellness exams."
      },
      senior: {
        vaccines: ["Rabies Booster", "DHPP Booster", "Titer tests (optional)"],
        risks: ["Arthritis", "Cognitive decline", "Kidney/Heart disease"],
        weight: "Stabilized or decreasing",
        advice: "Provide orthopedic bedding, switch to senior formula diet, and schedule bi-annual senior panels."
      }
    }
  },
  Cat: {
    icon: "🐱",
    name: "Cat",
    stages: {
      baby: {
        vaccines: ["FVRCP (Rhinotracheitis, Calicivirus, Panleukopenia)", "FeLV (Leukemia)", "Rabies (12-16 weeks)"],
        risks: ["Upper respiratory infections", "Ear mites", "Panleukopenia"],
        weight: "0.5 - 2.5 kg",
        advice: "Kitten-proof your home, supply scratching posts, and feed wet kitten food for hydration."
      },
      adult: {
        vaccines: ["FVRCP Booster", "Rabies Booster", "FeLV Booster (outdoor cats)"],
        risks: ["Urinary tract blockages", "Hairballs", "Gingivitis"],
        weight: "3.5 - 5.5 kg",
        advice: "Provide fresh running water (cat fountain), engage with feather wand toys, and brush fur weekly."
      },
      senior: {
        vaccines: ["FVRCP Booster", "Rabies Booster"],
        risks: ["Chronic Kidney Disease (CKD)", "Hyperthyroidism", "Diabetes"],
        weight: "Weight loss is common",
        advice: "Monitor drinking/litter habits, elevate food bowls, and perform senior blood screenings."
      }
    }
  },
  Rabbit: {
    icon: "🐰",
    name: "Rabbit",
    stages: {
      baby: {
        vaccines: ["RVHD1 & RVHD2 (Rabbit Viral Haemorrhagic Disease)", "Myxomatosis"],
        risks: ["GI Stasis", "Coccidiosis", "Malocclusion"],
        weight: "0.2 - 1.2 kg",
        advice: "Unlimited alfalfa hay, introduce fresh leafy greens slowly, and ensure a spacious exercise pen."
      },
      adult: {
        vaccines: ["RVHD Booster (Annual)", "Myxomatosis Booster (Annual)"],
        risks: ["Gastrointestinal Stasis", "Dental spurs", "Sore hocks"],
        weight: "1.5 - 3.5 kg",
        advice: "Switch to unlimited Timothy hay, daily free-roam time, and weekly dental inspections."
      },
      senior: {
        vaccines: ["RVHD Booster (Annual)"],
        risks: ["Arthritis", "Pododermatitis", "Bladder sludge"],
        weight: "Stable or decreasing",
        advice: "Provide low-entry litter boxes, soft fleece flooring, and monitor urinary patterns."
      }
    }
  },
  Bird: {
    icon: "🦜",
    name: "Bird",
    stages: {
      baby: {
        vaccines: ["Polyomavirus (parrots)"],
        risks: ["Crop stasis", "Chlamydiosis", "Feather plucking"],
        weight: "30 - 300g",
        advice: "Keep brooder temperature regulated, feed high-quality hand-rearing formula, and monitor weight daily."
      },
      adult: {
        vaccines: ["Polyomavirus Booster (Annual)"],
        risks: ["Nutritional deficiencies", "Egg binding", "Respiratory infections"],
        weight: "100 - 800g",
        advice: "Feed pellet-based diet (not just seeds), supply toys for foraging, and ensure 10-12 hours of sleep."
      },
      senior: {
        vaccines: ["Titer checks / Veterinary assessment"],
        risks: ["Arthritis", "Cataracts", "Atherosclerosis"],
        weight: "Slight decrease",
        advice: "Add horizontal perches for grip safety, supplement joint vitamins, and avoid drafty locations."
      }
    }
  }
};

export default function LandingPage() {
  const location = useLocation();
  const [selectedPet, setSelectedPet] = useState('Dog');
  const [selectedStage, setSelectedStage] = useState('baby');

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

  // Framer Motion Animation Settings
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const activeWidgetData = INTERACTIVE_PET_DATA[selectedPet].stages[selectedStage];

  return (
    <div className="space-y-28 pb-20">
      
      {/* 1. Hero Section */}
      <section id="hero" className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        
        {/* Full width background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1920" 
            alt="Dog with veterinarian" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
          {/* Bottom gradient fade for smooth transition to next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full mt-10">
          
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl text-left space-y-7"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white backdrop-blur-md text-[10px] font-bold border border-white/20 uppercase tracking-wider shadow-sm">
              <Sparkles size={12} className="text-[#38BDF8]" />
              The Next-Gen Pet Healthcare Ecosystem
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight drop-shadow-sm">
              A Unified Portal for <br />
              <span className="text-[#38BDF8]">
                Digital Pet Care
              </span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium drop-shadow-sm">
              PetZoe connects pet owners, certified vets, shelter networks, and wellness marketplaces. Chart health histories, request live telehealth support, and manage adoption pipelines in a secure, role-based dashboard.
            </p>
            <div className="flex flex-col sm:flex-row justify-start gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-full font-bold bg-[#38BDF8] hover:bg-[#0ea5e9] text-white shadow-lg shadow-sky-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                Get Started Now <ArrowRight size={14} />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-full font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all duration-200 text-xs uppercase tracking-wider flex items-center justify-center"
              >
                Learn More
              </a>
            </div>

            {/* Micro Badges */}
            <div className="pt-6 flex flex-wrap justify-start gap-6 text-xs text-slate-300 font-bold border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Shield className="text-[#38BDF8]" size={16} /> Encrypted Records
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="text-[#F97360]" size={16} /> Certified Practitioners
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="max-w-7xl mx-auto px-6">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="bg-white rounded-[24px] p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow transition-all text-center space-y-1.5"
            >
              <p className={`font-display font-black text-3xl sm:text-4xl ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. Features Bento Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-4 scroll-mt-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Advanced Care Management, <br />
            <span className="bg-gradient-to-r from-[#1E3A5F] via-[#38BDF8] to-[#F97360] bg-clip-text text-transparent">
              Designed for Pets & Vets
            </span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-lg mx-auto">
            Everything you need to monitor pet wellness, record clinical files, and consult veterinary practitioners in a unified network.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="group p-6 bg-white rounded-[24px] border border-slate-100 hover:border-[#38BDF8]/30 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  <div className={`p-3 rounded-2xl w-fit ${feat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-950 group-hover:text-[#1E3A5F] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 4. Interactive Live Care Selector Tool (New Custom UI UX Widget) */}
      <section className="max-w-5xl mx-auto px-6 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 shadow-md relative overflow-hidden space-y-8"
        >
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#38BDF8]/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Widget Info Header */}
          <div className="text-center md:text-left space-y-2 border-b border-slate-100 pb-6 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-[9px] font-black uppercase tracking-wider">
              <Stethoscope size={10} /> Interactive Planner
            </span>
            <h3 className="font-display font-black text-2xl text-slate-900 leading-tight">
              Interactive Pet Wellness Planner
            </h3>
            <p className="text-slate-400 text-xs font-semibold">
              Select your pet type and life stage to dynamically display vital vaccination timelines, care advices, and clinical risk profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Input Selectors Left (4 cols) */}
            <div className="md:col-span-4 space-y-6 text-left">
              
              {/* Pet Type Selection */}
              <div className="space-y-2">
                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-wider ml-1">Select Pet</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(INTERACTIVE_PET_DATA).map(petKey => (
                    <button
                      key={petKey}
                      onClick={() => setSelectedPet(petKey)}
                      className={`py-3.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        selectedPet === petKey
                          ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base mr-1">{INTERACTIVE_PET_DATA[petKey].icon}</span>
                      {INTERACTIVE_PET_DATA[petKey].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Life Stage Selection */}
              <div className="space-y-2">
                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-wider ml-1">Life Stage</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'baby', label: '👶 Baby (<1 Year)' },
                    { id: 'adult', label: '🐕 Adult (1-7 Years)' },
                    { id: 'senior', label: '👵 Senior (7+ Years)' }
                  ].map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`px-4 py-3 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                        selectedStage === stage.id
                          ? 'bg-[#38BDF8] border-[#38BDF8] text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{stage.label}</span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Dynamic Results Card Right (8 cols) */}
            <div className="md:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedPet}-${selectedStage}`}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-50/50 border border-slate-150 rounded-[24px] p-6 text-left space-y-5"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-display font-black text-slate-800 text-base">
                      {INTERACTIVE_PET_DATA[selectedPet].icon} {selectedPet} Care Blueprint
                    </h4>
                    <span className="px-3 py-1 bg-white border border-slate-200 text-[#1E3A5F] text-[10px] font-bold rounded-full capitalize">
                      Stage: {selectedStage}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    
                    {/* Vaccines column */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-emerald-500" /> Key Immunizations
                      </p>
                      <ul className="space-y-1.5 pl-1">
                        {activeWidgetData.vaccines.map((v, i) => (
                          <li key={i} className="text-slate-700 font-semibold">• {v}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Risks Column */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-[#F97360] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert size={12} /> Health Concerns
                      </p>
                      <ul className="space-y-1.5 pl-1">
                        {activeWidgetData.risks.map((r, i) => (
                          <li key={i} className="text-slate-700 font-semibold">• {r}</li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Weight Range</span>
                      <span className="text-slate-700 font-bold">{activeWidgetData.weight}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="block text-[9px] text-[#38BDF8] font-bold uppercase">Care & Nutrition Advice</span>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{activeWidgetData.advice}</p>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 5. Role-Based Dashboard Preview Section */}
      <section className="max-w-7xl mx-auto px-6 py-4 scroll-mt-20">
        <DashboardPreview />
      </section>

      {/* 6. Services Grid Section */}
      <section id="services" className="bg-slate-100/50 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
              Professional Integrated Solutions
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              We align medical databases, vet triage, and adoption centers under a single secure platform.
            </p>
          </motion.div>

          {/* Cards */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {SERVICES.map((serv, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white rounded-[24px] p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 text-left"
              >
                <h3 className="font-display font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  {serv.title}
                </h3>
                <ul className="space-y-3">
                  {serv.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-600 font-semibold">
                      <CheckCircle size={14} className="text-[#38BDF8] mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. Why Choose Us Section */}
      <section id="why-us" className="max-w-7xl mx-auto px-6 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          
          {/* Image/Mockup Slot Left */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center order-last lg:order-first"
          >
            <div className="bg-gradient-to-tr from-[#1E3A5F] to-[#38BDF8] rounded-[32px] p-8 text-white space-y-6 w-full max-w-md shadow-xl relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Shield size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider">Health Security Seal</span>
              </div>
              <h3 className="font-display font-bold text-2xl">Bank-Grade Clinical Protection</h3>
              <p className="text-xs text-slate-100 leading-relaxed font-semibold">
                All consult reports and digital records are encrypted with AES-256 standards, aligning with modern animal patient safety and security guidelines.
              </p>
              <div className="pt-4 border-t border-white/20 flex gap-8">
                <div>
                  <p className="text-xl font-black">256-bit</p>
                  <p className="text-[10px] text-slate-200 font-bold uppercase">Encryption</p>
                </div>
                <div>
                  <p className="text-xl font-black">100%</p>
                  <p className="text-[10px] text-slate-200 font-bold uppercase">HIPAA Compliant</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Right */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
              Veterinary Systems <br />
              Built on Complete Trust
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              We understand that pet health management is highly sensitive. PetZoe was engineered by leading veterinary practitioners and software architects to deliver error-free medical charts and on-time treatment reminders.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2.5 bg-sky-50 rounded-xl text-[#38BDF8] h-fit">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Direct Doctor-to-Patient Channels</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Skip call hold lines. Message verified vets directly from your client hub.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2.5 bg-sky-50 rounded-xl text-[#38BDF8] h-fit">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Multi-Role Support Panels</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Custom layout setups configured specifically for shelter logs, vet charts, and retail.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section id="testimonials" className="bg-slate-100/50 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
              Trusted by 10,000+ Happy Families
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              Read how pet owners and veterinarians enhance medical operations with PetZoe.
            </p>
          </motion.div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map((test, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex text-amber-500">
                    {[...Array(test.rating)].map((_, sIdx) => (
                      <Star key={sIdx} size={14} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed font-semibold">
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ Accordion Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 scroll-mt-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">
            Got queries? Find answers for the most common platform questions below.
          </p>
        </motion.div>

        {/* Accordion list */}
        <Accordion items={FAQS} />
      </section>

      {/* 10. Contact Section */}
      <section id="contact" className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 sm:p-12"
        >
          <div className="text-center space-y-3 mb-8">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
              Need Help With Custom Setup?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">
              Our clinical integration support desk is available 24/7. Send us a message and we'll resolve it.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Carter"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/25 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@petzoe.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/25 text-xs font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 ml-1">Your Message</label>
              <textarea
                required
                rows="4"
                placeholder="Write your question or request a demo here..."
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/25 text-xs font-semibold resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-[#1E3A5F] hover:bg-[#152a46] text-white shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all text-xs cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <MessageSquare size={16} /> Send Message
            </button>
          </form>
        </motion.div>
      </section>

    </div>
  );
}
