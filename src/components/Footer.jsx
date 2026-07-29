import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2 group self-start">
              <div className="p-2 bg-primary-600 rounded-xl text-white shadow-md">
                <PawPrint size={18} className="fill-current text-white" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                Pet<span className="text-secondary-400">Verse</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Enterprise digital healthcare and veterinary management platform. We connect pet owners with certified medical experts, foster care, and marketplace solutions.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
              <li><a href="#services" className="hover:text-primary-400 transition-colors">Services</a></li>
              <li><a href="#why-us" className="hover:text-primary-400 transition-colors">Why Choose Us</a></li>
              <li><a href="#testimonials" className="hover:text-primary-400 transition-colors">Testimonials</a></li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Portal</h3>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Client Login</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Staff Registration</Link></li>
              <li><a href="#faq" className="hover:text-primary-400 transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="md:col-span-4 space-y-4 text-xs font-medium text-slate-400">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Contact Headquarters</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary-400" />
                <span>support@petverse.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary-400 mt-0.5" />
                <span>122 Healthcare Blvd, Sector 4, Bangalore, Karnataka - 560001</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <span>&copy; {currentYear} PetVerse Inc. Licensed for Pet Care and Telehealth. Made with</span>
            <Heart size={10} className="fill-rose-500 text-rose-500" />
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">HIPAA Compliance</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
