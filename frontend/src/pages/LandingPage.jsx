import { motion } from 'framer-motion';
import { Shield, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Reliable Local Services at Your Fingertips.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              From plumbing to electrical work, find verified professionals in your neighborhood. Fast, secure, and hassle-free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
              >
                Book a Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/technicians"
                className="inline-flex h-12 items-center justify-center rounded-md border-2 border-primary/20 px-8 py-3 text-lg font-medium transition-colors hover:bg-primary/10"
              >
                Join as Technician
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-20 dark:opacity-10 blur-3xl bg-gradient-to-l from-primary to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-card border shadow-sm transition-all"
            >
              <Shield className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">Verified Pros</h3>
              <p className="text-muted-foreground">Every technician is background-checked and vetted for quality assurance.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-card border shadow-sm transition-all"
            >
              <Clock className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">Rapid Response</h3>
              <p className="text-muted-foreground">Book instantly and get professional help at your doorstep in under 60 minutes.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-card border shadow-sm transition-all"
            >
              <MapPin className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">Hyperlocal</h3>
              <p className="text-muted-foreground">We connect you with service providers who are literally just around the corner.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
