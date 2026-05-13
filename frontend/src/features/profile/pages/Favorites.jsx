import { useGetFavoritesQuery } from '../api/userApi';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { data: response, isLoading } = useGetFavoritesQuery();
  const favorites = response?.data || [];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <p className="text-muted-foreground">Your saved professionals for quick booking.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground italic">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="bg-card border rounded-[2.5rem] p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-8">Save professionals you like to book them faster later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((tech) => (
            <Link to={`/technician/${tech._id}`} key={tech._id}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-card border rounded-[2rem] p-5 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img 
                    src={tech.profileImage?.startsWith('http') ? tech.profileImage : `https://i.pravatar.cc/150?u=${tech._id}`} 
                    alt={tech.userId?.name} 
                    className="w-16 h-16 rounded-2xl object-cover" 
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{tech.userId?.name}</h3>
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                    <p className="text-sm text-primary font-medium uppercase tracking-wide">{tech.category}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" /> {tech.location?.address?.split(',')[0] || 'Nearby'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{tech.averageRating || 'New'}</span>
                  </div>
                  <div className="font-black text-lg">₹{tech.pricing}</div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
