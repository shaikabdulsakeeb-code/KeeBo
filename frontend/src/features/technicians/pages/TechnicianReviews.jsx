import { motion } from 'framer-motion';
import { useGetOwnProfileQuery, useGetTechnicianReviewsQuery } from '../api/technicianApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSlice';
import { Star, MessageSquare, TrendingUp, Filter } from 'lucide-react';

const TechnicianReviews = () => {
  const user = useSelector(selectCurrentUser);
  const { data: profileData } = useGetOwnProfileQuery(user?._id);
  const profile = profileData?.data;
  
  const { data: reviewsData, isLoading } = useGetTechnicianReviewsQuery(profile?._id, { 
    skip: !profile?._id 
  });
  const reviews = reviewsData?.data || [];

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2">My Reviews</h1>
        <p className="text-muted-foreground font-medium">Manage and view all your customer feedback</p>
      </header>

      {/* Reviews Stats Header */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card border rounded-[2rem] p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500">
            <Star className="w-6 h-6 fill-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Average Rating</p>
            <h3 className="text-2xl font-black">{profile?.averageRating || '0.0'}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-[2rem] p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Reviews</p>
            <h3 className="text-2xl font-black">{profile?.totalReviews || 0}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-[2rem] p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Satisfaction</p>
            <h3 className="text-2xl font-black">{profile?.averageRating ? (profile.averageRating * 20).toFixed(0) : 0}%</h3>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold">All Customer Feedback</h2>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium italic">Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center bg-card border rounded-[3rem] border-dashed">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <Star className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Complete more jobs to start receiving feedback from your customers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <motion.div 
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border rounded-[2.5rem] p-8 shadow-sm flex flex-col hover:shadow-md transition-all border-border/50"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-black text-lg leading-none mb-1">{review.user?.name || 'Customer'}</h4>
                      <p className="text-xs text-muted-foreground font-bold">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-2xl">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-black text-yellow-700">{review.rating}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute -top-4 -left-2 text-4xl text-primary/10 font-serif leading-none">"</span>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium relative z-10 italic">
                      {review.comment}
                    </p>
                    <span className="absolute -bottom-6 -right-2 text-4xl text-primary/10 font-serif leading-none">"</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TechnicianReviews;
