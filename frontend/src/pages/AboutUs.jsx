import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Trophy, Target } from 'lucide-react';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 sm:pt-32 pb-10 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-20"
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6">About <span className="text-primary">KeeBo</span></h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We are dedicated to bringing the highest quality hyperlocal services right to your doorstep, powered by technology and a commitment to excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 sm:mb-32">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6">Our Mission</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
              Founded in 2024, KeeBo was born out of a simple need: finding reliable, skilled technicians shouldn't be a hassle. We've built a platform that connects homeowners with verified professionals, ensuring transparency, safety, and quality.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              Every technician on our platform undergoes a rigorous background check and skill assessment. We believe in empowering local talent while providing peace of mind to our customers.
            </p>
          </div>
          <div className="bg-primary/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 grid grid-cols-2 gap-4 sm:gap-8">
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
              <h3 className="text-2xl sm:text-4xl font-black text-primary mb-1 sm:mb-2">500+</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500">Technicians</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
              <h3 className="text-2xl sm:text-4xl font-black text-primary mb-1 sm:mb-2">10k+</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500">Happy Clients</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
              <h3 className="text-2xl sm:text-4xl font-black text-primary mb-1 sm:mb-2">50+</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500">Service Types</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm">
              <h3 className="text-2xl sm:text-4xl font-black text-primary mb-1 sm:mb-2">4.8</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500">Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 sm:mb-32">
          {[
            { icon: ShieldCheck, title: 'Verified Pros', desc: 'Every technician is manually verified by our team.' },
            { icon: Users, title: 'Customer First', desc: 'Your satisfaction is our top priority, always.' },
            { icon: Trophy, title: 'Quality Work', desc: 'We guarantee high-quality service on every booking.' },
            { icon: Target, title: 'Fast Response', desc: 'Connect with pros in your area within minutes.' },
          ].map((item, i) => (
            <div key={i} className="bg-card border p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] hover:shadow-xl transition-all">
              <item.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
