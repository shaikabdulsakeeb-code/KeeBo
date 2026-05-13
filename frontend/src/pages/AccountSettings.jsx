import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { User, Mail, Shield, Bell, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';

const AccountSettings = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">
            <User className="w-5 h-5" />
            <span>Profile info</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-card rounded-2xl font-bold text-muted-foreground transition-colors">
            <Mail className="w-5 h-5" />
            <span>Email & Password</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-card rounded-2xl font-bold text-muted-foreground transition-colors">
            <Shield className="w-5 h-5" />
            <span>Privacy</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-card rounded-2xl font-bold text-muted-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name}
                    className="w-full bg-muted/50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name?.toLowerCase().replace(' ', '_')}
                    className="w-full bg-muted/50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  disabled
                  className="w-full bg-muted/20 border-none rounded-xl py-3 px-4 text-sm cursor-not-allowed text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    className="w-full bg-muted/50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t flex justify-end space-x-3">
              <Button variant="ghost" className="rounded-xl font-bold">Discard</Button>
              <Button className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">Save Changes</Button>
            </div>
          </div>

          <div className="bg-destructive/5 border border-destructive/10 rounded-[2rem] p-8">
            <h2 className="text-xl font-bold text-destructive mb-2">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-6">Permanently delete your account and all your data. This action cannot be undone.</p>
            <Button variant="destructive" className="rounded-xl font-bold">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
