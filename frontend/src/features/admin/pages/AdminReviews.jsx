import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAllReviewsQuery, useAdminDeleteReviewMutation } from '../api/adminApi';
import { Star, Search, Trash2, Loader2, AlertTriangle, ChevronLeft, ChevronRight, MessageSquare, X } from 'lucide-react';

const AdminReviews = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: reviewsData, isLoading, isFetching } = useGetAllReviewsQuery({
    search: debouncedSearch, page, limit: 10, rating: ratingFilter,
  });
  const [deleteReview, { isLoading: isDeleting }] = useAdminDeleteReviewMutation();

  const reviews = reviewsData?.data || [];
  const totalCount = reviewsData?.totalCount || 0;
  const totalPages = reviewsData?.totalPages || 1;

  let searchTimeout;
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget._id).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">All Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">{totalCount} total reviews across all technicians</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by user, technician, or comment..." value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <select value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-[140px]">
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {/* Reviews Table/Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-semibold">No reviews found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Technician</th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Rating</th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Comment</th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-center px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((review, i) => (
                    <motion.tr key={review._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                            {review.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{review.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400">{review.user?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-700">{review.techUser?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{review.technician?.category || ''}</p>
                      </td>
                      <td className="px-5 py-4">{renderStars(review.rating)}</td>
                      <td className="px-5 py-4">
                        <p className="text-slate-600 max-w-[250px] truncate" title={review.comment}>{review.comment}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(review.createdAt)}</td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => setDeleteTarget(review)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete Review">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {reviews.map((review) => (
              <motion.div key={review._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                      {review.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{review.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">→ {review.techUser?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <button onClick={() => setDeleteTarget(review)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">Page {page} of {totalPages} ({totalCount} reviews)</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading overlay */}
      {isFetching && !isLoading && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-[1px] z-40 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={() => setDeleteTarget(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Delete This Review?</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    This will permanently remove this review and update the technician's rating. This action cannot be undone.
                  </p>
                </div>

                {/* Review Preview */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm text-slate-700">{deleteTarget.user?.name || 'Unknown'}</p>
                    <span className="text-slate-300">→</span>
                    <p className="text-sm text-slate-500">{deleteTarget.techUser?.name || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">{renderStars(deleteTarget.rating)}</div>
                  <p className="text-sm text-slate-600 line-clamp-2">{deleteTarget.comment}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setDeleteTarget(null)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={isDeleting}
                    className="flex-1 h-11 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {isDeleting ? 'Deleting...' : 'Delete Review'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReviews;
