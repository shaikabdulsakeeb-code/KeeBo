import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAddReviewMutation } from '../../features/technicians/api/technicianApi';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, technicianId, bookingId, technicianName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [addReview, { isLoading }] = useAddReviewMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    if (!technicianId) return toast.error('Technician information is missing. Please refresh and try again.');

    try {
      await addReview({
        techId: technicianId,
        rating,
        comment,
        bookingId // Optional: link review to booking
      }).unwrap();
      
      toast.success('Thank you for your feedback!');
      setRating(0);
      setComment('');
      onClose();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to submit review');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card border rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Review Service</h2>
                  <p className="text-sm text-muted-foreground">Share your experience with {technicianName}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex flex-col items-center py-4 bg-muted/30 rounded-3xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Overall Quality</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          className={`w-10 h-10 transition-colors ${
                            star <= (hover || rating) 
                              ? 'fill-yellow-500 text-yellow-500' 
                              : 'text-muted-foreground/30'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-bold text-primary">
                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : rating === 1 ? 'Poor' : 'Select Rating'}
                  </p>
                </div>

                {/* Comment Area */}
                <div>
                  <label className="text-sm font-bold mb-2 block flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> Detailed Feedback
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or what could be improved..."
                    className="w-full bg-muted/50 border-none rounded-2xl p-4 text-sm min-h-[120px] focus:ring-1 ring-primary/20"
                    required
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-6 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                >
                  {isLoading ? 'Submitting...' : 'Submit Review'}
                  <Send className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
