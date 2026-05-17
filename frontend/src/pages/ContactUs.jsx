import { Mail, Phone, MapPin, Send, Globe, Camera, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Footer from '../components/Footer';
import { useGetPublicSettingsQuery } from '../features/auth/api/authApi';

const ContactUs = () => {
  const { data: settingsResponse } = useGetPublicSettingsQuery();
  const settings = settingsResponse?.data || {};
  const email = settings.supportEmail || 'support@keebo.com';
  const phone = settings.supportPhone || '+91 98765 43210';

  return (
    <div className="min-h-screen pt-20 sm:pt-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl pb-10 sm:pb-20">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Have questions or need assistance? Our team is here to help you find the best professional for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card border rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-110"></div>

              <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 relative">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Us</p>
                    <p className="text-base sm:text-lg font-bold break-all">{email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Call Us</p>
                    <p className="text-base sm:text-lg font-bold">{phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Visit Us</p>
                    <p className="text-base sm:text-lg font-bold">123 Tech Park, Hitec City, Hyderabad</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 pt-6 sm:pt-10 border-t border-dashed">
                <h3 className="font-black text-lg sm:text-xl mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: <Globe className="w-5 h-5" />, name: 'Website' },
                    { icon: <Camera className="w-5 h-5" />, name: 'Instagram' },
                    { icon: <Share2 className="w-5 h-5" />, name: 'LinkedIn' },
                    { icon: <MessageSquare className="w-5 h-5" />, name: 'Facebook' }
                  ].map((social) => (
                    <div key={social.name} className="w-11 h-11 sm:w-12 sm:h-12 bg-muted rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-primary/20 hover:-translate-y-1">
                      {social.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl relative">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-muted/50 border-none rounded-2xl py-3 sm:py-4 px-4 sm:px-6 focus:ring-2 ring-primary/20 outline-none font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-muted/50 border-none rounded-2xl py-3 sm:py-4 px-4 sm:px-6 focus:ring-2 ring-primary/20 outline-none font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold ml-1">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full bg-muted/50 border-none rounded-2xl py-3 sm:py-4 px-4 sm:px-6 focus:ring-2 ring-primary/20 outline-none font-medium text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold ml-1">Message</label>
                <textarea
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full bg-muted/50 border-none rounded-2xl py-3 sm:py-4 px-4 sm:px-6 focus:ring-2 ring-primary/20 outline-none font-medium resize-none text-sm"
                ></textarea>
              </div>

              <Button className="w-full py-4 sm:py-7 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-black shadow-xl shadow-primary/20">
                Send Message
                <Send className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
