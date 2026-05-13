import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Phone, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCreateBookingMutation } from '../api/bookingApi';
import toast from 'react-hot-toast';

const BookingModal = ({ isOpen, onClose, technician }) => {
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    userPhoneNumber: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking({
        technician: technician._id,
        service: technician.category,
        price: technician.pricing,
        ...formData
      }).unwrap();
      toast.success('Booking requested successfully!');
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to request booking');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-lg rounded-3xl shadow-xl border overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b bg-muted/30">
            <h2 className="text-xl font-bold">Book {technician?.userId?.name}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> Date
                </label>
                <Input
                  type="date"
                  name="scheduledDate"
                  required
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> Time
                </label>
                <Input
                  type="time"
                  name="scheduledTime"
                  required
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                <Phone className="w-3 h-3 mr-1" /> Your Phone Number
              </label>
              <Input
                type="tel"
                name="userPhoneNumber"
                required
                placeholder="Enter your contact number"
                value={formData.userPhoneNumber}
                onChange={handleChange}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                <MapPin className="w-3 h-3 mr-1" /> Service Address
              </label>
              <Input
                name="address"
                required
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleChange}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                <FileText className="w-3 h-3 mr-1" /> Issue Description
              </label>
              <textarea
                name="notes"
                rows="3"
                placeholder="Describe what needs to be done..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm"
              />
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 mt-6 border border-primary/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground/80">Estimated Base Price</span>
                <span className="text-lg font-black text-primary">₹{technician?.pricing}</span>
              </div>
              <p className="text-xs text-muted-foreground">Final price may vary based on actual work required.</p>
            </div>

            <Button type="submit" className="w-full py-6 mt-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25" isLoading={isLoading}>
              Confirm Booking Request
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
