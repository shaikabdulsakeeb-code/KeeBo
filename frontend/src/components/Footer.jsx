import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, Camera, MessageSquare, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="text-white text-2xl font-black mb-6 block">
            KeeBo<span className="text-primary">.</span>
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Connecting you with the best local service professionals in your neighborhood. Quality guaranteed.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Globe className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Camera className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Share2 className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><MessageSquare className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/technicians" className="hover:text-white transition-colors">Services</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Services</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/technicians" className="hover:text-white transition-colors">Electricians</Link></li>
            <li><Link to="/technicians" className="hover:text-white transition-colors">Plumbers</Link></li>
            <li><Link to="/technicians" className="hover:text-white transition-colors">AC Repair</Link></li>
            <li><Link to="/technicians" className="hover:text-white transition-colors">Cleaning</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <span>123 Service Lane, Tech City, 560001</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <span>support@keebo.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} KeeBo Services. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
