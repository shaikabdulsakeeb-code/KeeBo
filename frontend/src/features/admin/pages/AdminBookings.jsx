import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, User, Shield, MapPin, 
  Search, Filter, ChevronLeft, ChevronRight,
  TrendingUp, CheckCircle2, Clock4, XCircle, Ban,
  IndianRupee, CreditCard, Trash2
} from 'lucide-react';
import { 
  useGetAllBookingsQuery, 
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation 
} from '../api/adminApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Confirm" }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-10 max-w-sm w-full space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
          <div className="w-16 h-16 rounded-[2rem] bg-rose-50 text-rose-650 flex items-center justify-center mx-auto shadow-inner">
            <Ban className="w-8 h-8" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
              {message}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              className="h-12 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10" 
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
            <button 
              className="h-10 rounded-xl font-bold text-slate-400 hover:text-slate-650 transition-all text-xs uppercase tracking-wider" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-slate-200/60 rounded-[2rem] p-5 shadow-sm"
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-black mt-0.5 text-slate-800">{value}</h3>
    </div>
  </motion.div>
);

const AdminBookings = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('all');

  // Modal State
  const [actionModal, setActionModal] = useState({ 
    isOpen: false, 
    type: null, 
    bookingId: null,
    title: '',
    message: '',
    confirmText: ''
  });

  const { data: bookingsData, isLoading, isFetching } = useGetAllBookingsQuery({
    page,
    limit,
    status
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  const handleCancelBooking = (id) => {
    setActionModal({
      isOpen: true,
      type: 'cancel',
      bookingId: id,
      title: 'Force Cancel?',
      message: 'This will permanently halt the service and prevent the technician from claiming completion.',
      confirmText: 'Yes, Force Cancel'
    });
  };

  const handleDeleteBooking = (id) => {
    setActionModal({
      isOpen: true,
      type: 'delete',
      bookingId: id,
      title: 'Delete Record?',
      message: 'This will permanently remove the booking record from the database. This action is irreversible.',
      confirmText: 'Permanently Delete'
    });
  };

  const handleConfirmAction = async () => {
    const { type, bookingId } = actionModal;
    try {
      if (type === 'cancel') {
        await updateStatus({ id: bookingId, status: 'cancelled' }).unwrap();
        toast.success('Booking cancelled successfully');
      } else if (type === 'delete') {
        await deleteBooking(bookingId).unwrap();
        toast.success('Record deleted permanently');
      }
      setActionModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      toast.error(err.data?.message || 'Action failed');
    }
  };

  const bookings = bookingsData?.data || [];
  const stats = bookingsData?.stats || {};
  const totalPages = bookingsData?.totalPages || 1;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse';
      case 'cancelled': return 'bg-red-50 text-red-650 border-red-100';
      case 'rejected': return 'bg-rose-50 text-rose-650 border-rose-100';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <DeleteModal 
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={actionModal.title}
        message={actionModal.message}
        confirmText={actionModal.confirmText}
        isLoading={isUpdating || isDeleting}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Booking Analytics</h1>
          <p className="text-slate-500 mt-1 font-semibold text-xs sm:text-sm">Monitor transactions and service flow</p>
        </div>
        <div className="flex bg-white p-2 rounded-xl border border-slate-250/60 shadow-sm overflow-x-auto max-w-full">
           <div className="px-4 py-1 border-r border-slate-150">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Revenue</p>
              <p className="text-base sm:text-lg font-black text-blue-600 flex items-center gap-0.5 mt-0.5 whitespace-nowrap">
                <IndianRupee className="w-3.5 h-3.5" /> {stats.totalRevenue?.toLocaleString() || '0'}
              </p>
           </div>
           <div className="px-4 py-1 pl-6">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Bookings</p>
              <p className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{stats.total || 0}</p>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Active Requests" value={stats.pending || 0} icon={Clock4} color="text-amber-500 bg-amber-500" />
        <StatCard title="Confirmed" value={stats.accepted || 0} icon={CheckCircle2} color="text-blue-500 bg-blue-500" />
        <StatCard title="Successful" value={stats.completed || 0} icon={TrendingUp} color="text-emerald-500 bg-emerald-500" trend="+12%" />
        <StatCard title="Lost / Cancelled" value={(stats.cancelled || 0) + (stats.rejected || 0)} icon={Ban} color="text-red-500 bg-red-500" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
        {/* Filters Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full lg:w-auto custom-scrollbar">
              {['all', 'pending', 'accepted', 'completed', 'cancelled', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    status === s 
                      ? 'bg-white text-blue-600 shadow-sm font-black' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
           </div>
           
           <div className="flex-shrink-0 w-full lg:w-auto">
              <select 
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="w-full lg:w-auto bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer text-slate-700 shadow-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
           </div>
        </div>

        {/* Desktop View (Visible on medium/large screens, hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Booking Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Technician</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                {status !== 'completed' && (
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {isLoading ? (
                [...Array(limit)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={status === 'completed' ? 5 : 6} className="px-8 py-8"><div className="h-12 bg-slate-50 rounded-2xl"></div></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={status === 'completed' ? 5 : 6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 py-8">
                       <Calendar className="w-16 h-16 text-slate-300" />
                       <p className="text-slate-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider">No bookings found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-blue-600" /> {booking.service}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                           <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-350" /> {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                           <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-350" /> {booking.scheduledTime}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock4 className="w-3 h-3 text-blue-500/70" /> Booked: {new Date(booking.createdAt).toLocaleString()}
                        </p>
                        {booking.status === 'cancelled' && booking.cancelledAt && (
                          <p className="text-[10px] font-black text-rose-500 flex items-center gap-1 uppercase tracking-widest">
                            <Ban className="w-3 h-3" /> Cancelled: {new Date(booking.cancelledAt).toLocaleString()}
                          </p>
                        )}
                        <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-350" /> {booking.address}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200/60">
                           {booking.user?.profileImage && booking.user.profileImage !== 'default.jpg' ? (
                             <img src={booking.user.profileImage} className="w-full h-full object-cover" />
                           ) : <User className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800">{booking.user?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{booking.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200/60">
                           {(() => {
                             const techUser = booking.technician?.userId;
                             const techProfile = booking.technician;
                             const imageUrl = (techUser?.profileImage && techUser.profileImage !== 'default.jpg')
                               ? techUser.profileImage
                               : (techProfile?.profileImage && techProfile.profileImage !== 'default.jpg')
                                 ? techProfile.profileImage
                                 : null;

                             return imageUrl ? (
                               <img src={imageUrl} className="w-full h-full object-cover" />
                             ) : <User className="w-5 h-5 text-slate-400" />;
                           })()}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800">{booking.technician?.userId?.name || 'Technician'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{booking.technician?.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-800 flex items-center gap-0.5">
                            <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> {booking.price?.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 mt-0.5">
                            <CreditCard className="w-3 h-3 text-slate-350" /> PAID
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(booking.status)}`}>
                         {booking.status === 'cancelled' && booking.cancelledBy === 'admin' 
                           ? 'System Cancelled' 
                           : booking.status}
                       </span>
                    </td>
                    {status !== 'completed' && (
                      <td className="px-8 py-5 text-right">
                         {(booking.status === 'pending' || booking.status === 'accepted') && (
                           <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelBooking(booking._id)}
                            className="text-red-500 hover:bg-red-50 rounded-xl font-bold uppercase text-[9px] tracking-wider border border-red-100 py-1.5 px-3"
                           >
                             <Ban className="w-3.5 h-3.5 mr-1" /> Force Cancel
                           </Button>
                         )}
                         {(booking.status === 'cancelled' || booking.status === 'rejected') && (
                           <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBooking(booking._id)}
                            className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all active:scale-90 border border-rose-100 w-9 h-9"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Visible on mobile, hidden on desktop/tablet) */}
        <div className="block md:hidden p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [...Array(limit)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-150 rounded-2xl p-4 animate-pulse h-36" />
              ))
            ) : bookings.length === 0 ? (
              <div className="bg-white border border-slate-150 rounded-2xl p-8 text-center text-slate-400">
                <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-extrabold text-xs uppercase tracking-wider">No bookings found</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <motion.div 
                  key={booking._id}
                  layout
                  className={`bg-white border border-slate-150 rounded-2xl p-4 space-y-3.5 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 truncate">
                        <Shield className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> {booking.service}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] font-bold text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {booking.scheduledTime}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                        {booking.status === 'cancelled' && booking.cancelledBy === 'admin' 
                          ? 'Sys Cancel' 
                          : booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Tech details */}
                  <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="space-y-0.5 min-w-0 border-r border-slate-200/50 pr-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Customer</p>
                      <p className="font-extrabold text-slate-800 truncate">{booking.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400 truncate font-semibold">{booking.user?.email}</p>
                    </div>
                    <div className="space-y-0.5 min-w-0 pl-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Technician</p>
                      <p className="font-extrabold text-slate-800 truncate">{booking.technician?.userId?.name || 'Technician'}</p>
                      <p className="text-[10px] text-slate-400 truncate font-semibold uppercase tracking-wider truncate">{booking.technician?.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Price Details</p>
                      <span className="text-base font-black text-slate-800 flex items-center gap-0.5 mt-0.5">
                        <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> {booking.price?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(booking.status === 'pending' || booking.status === 'accepted') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-red-500 hover:bg-red-50 rounded-xl font-bold uppercase text-[9px] tracking-wider py-1 px-3 border border-red-105"
                        >
                          Cancel Job
                        </Button>
                      )}
                      {(booking.status === 'cancelled' || booking.status === 'rejected') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all w-9 h-9 border border-rose-100 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Pagination */}
        <div className="px-4 sm:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {isFetching ? 'Refreshing System...' : `Page ${page} of ${totalPages} • Sync Active`}
           </div>
           
           <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1 || isLoading}
                onClick={() => setPage(p => p - 1)}
                className="w-9 h-9 rounded-lg border-slate-200 bg-white"
              >
                <ChevronLeft className="w-4.5 h-4.5 text-slate-650" />
              </Button>
              
              <div className="flex items-center gap-1 px-1">
                 {[...Array(totalPages)].map((_, i) => {
                   const p = i + 1;
                   if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                     return (
                       <button
                         key={p}
                         onClick={() => setPage(p)}
                         className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                           page === p 
                             ? 'bg-blue-600 text-white shadow-sm' 
                             : 'text-slate-500 hover:bg-slate-100'
                         }`}
                       >
                         {p}
                       </button>
                     );
                   }
                   if (p === 2 || p === totalPages - 1) return <span key={p} className="px-0.5 text-slate-400">...</span>;
                   return null;
                 })}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage(p => p + 1)}
                className="w-9 h-9 rounded-lg border-slate-200 bg-white"
              >
                <ChevronRight className="w-4.5 h-4.5 text-slate-650" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
