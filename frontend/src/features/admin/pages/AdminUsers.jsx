import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, Mail, Shield, Calendar, Trash2, 
  UserCheck, UserX, MoreVertical, Filter,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { 
  useGetUsersQuery, 
  useDeleteUserMutation 
} from '../api/adminApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'react-hot-toast';

const DeleteModal = ({ isOpen, onClose, onConfirm, userName, isLoading }) => (
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
          <div className="w-16 h-16 rounded-[2rem] bg-red-50 text-red-650 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Delete User?</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
              Are you sure you want to delete <span className="text-slate-900 font-bold">{userName}</span>? This action is permanent and cannot be undone.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              className="h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/10" 
              onClick={onConfirm}
              isLoading={isLoading}
            >
              Delete Permanently
            </Button>
            <button 
              className="h-10 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all text-xs uppercase tracking-wider" 
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

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: usersData, isLoading, isFetching } = useGetUsersQuery({ 
    search: debouncedSearch,
    role: filterRole,
    page,
    limit
  });
  
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const openDeleteModal = (user) => {
    setDeleteModal({ isOpen: true, userId: user._id, userName: user.name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(deleteModal.userId).unwrap();
      toast.success('User deleted successfully');
      closeDeleteModal();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete user');
    }
  };

  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;
  const totalCount = usersData?.totalCount || 0;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        userName={deleteModal.userName}
        isLoading={isDeleting}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-slate-200/80 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer text-slate-700"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl focus:ring-blue-500/10 focus:bg-slate-50 transition-all font-semibold text-xs sm:text-sm text-slate-800 placeholder-slate-400"
            />
          </div>
          <div className="flex-shrink-0">
             <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                {['all', 'user', 'technician'].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setFilterRole(role);
                      setPage(1);
                    }}
                    className={`px-4 sm:px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      filterRole === role 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {role}s
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Users Desktop Table & Mobile Cards */}
      <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
        {/* Desktop View (Visible on medium/large screens, hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Joined Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [...Array(limit)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="4" className="px-8 py-6 border-b border-slate-100">
                        <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan="4" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <UserX className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400 font-extrabold text-sm uppercase tracking-wider">No users found matching criteria</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  users.map((user) => (
                    <motion.tr 
                      key={user._id}
                      variants={itemVariants}
                      layout
                      className={`group border-b border-slate-150 hover:bg-slate-50/50 transition-all duration-300 ${
                        isDeleting && deleteModal.userId === user._id ? 'opacity-40 grayscale pointer-events-none' : ''
                      }`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200/50">
                              {(() => {
                                const imageUrl = (user.profileImage && user.profileImage !== 'default.jpg') 
                                  ? user.profileImage 
                                  : (user.techProfile?.profileImage && user.techProfile.profileImage !== 'default.jpg')
                                    ? user.techProfile.profileImage
                                    : null;

                                return imageUrl ? (
                                  <img src={imageUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-base font-black text-blue-600">{user.name.charAt(0)}</span>
                                );
                              })()}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white ${user.role === 'technician' ? 'bg-amber-500' : 'bg-blue-500'} flex items-center justify-center`}>
                              {user.role === 'technician' ? <Shield className="w-2 h-2 text-white" /> : <User className="w-2 h-2 text-white" />}
                            </div>
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors text-sm">{user.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          user.role === 'technician' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 opacity-60 text-slate-400" />
                          {new Date(user.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDeleteModal(user)}
                            className="w-9 h-9 rounded-xl text-red-500 hover:bg-red-50 transition-all active:scale-95"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {/* Mobile Card List View (Visible on mobile, hidden on desktop/tablet) */}
        <div className="block md:hidden p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [...Array(limit)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-150 rounded-2xl p-4 animate-pulse h-28" />
              ))
            ) : users.length === 0 ? (
              <div className="bg-white border border-slate-150 rounded-2xl p-8 text-center text-slate-400">
                <UserX className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-extrabold text-xs uppercase tracking-wider">No users found</p>
              </div>
            ) : (
              users.map((user) => (
                <motion.div 
                  key={user._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className={`bg-white border border-slate-150 rounded-2xl p-4 space-y-3.5 shadow-sm relative ${
                    isDeleting && deleteModal.userId === user._id ? 'opacity-40 grayscale pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                        {(() => {
                          const imageUrl = (user.profileImage && user.profileImage !== 'default.jpg') 
                            ? user.profileImage 
                            : (user.techProfile?.profileImage && user.techProfile.profileImage !== 'default.jpg')
                              ? user.techProfile.profileImage
                              : null;

                          return imageUrl ? (
                            <img src={imageUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base font-black text-blue-600">{user.name.charAt(0)}</span>
                          );
                        })()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white ${user.role === 'technician' ? 'bg-amber-500' : 'bg-blue-500'} flex items-center justify-center`}>
                        {user.role === 'technician' ? <Shield className="w-2.5 h-2.5 text-white" /> : <User className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-800 text-sm truncate">{user.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteModal(user)}
                        className="w-9 h-9 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/70 text-xs">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${
                        user.role === 'technician' 
                          ? 'bg-amber-50 text-amber-600 border-amber-100' 
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-350" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        {/* Pagination/Status Footer */}
        <div className="px-4 sm:px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {isFetching ? 'Refreshing...' : `Page ${page} of ${totalPages} • Total ${totalCount} users`}
           </div>
           
           <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1 || isLoading}
                onClick={() => setPage(p => p - 1)}
                className="w-9 h-9 rounded-lg border-slate-200 bg-white"
              >
                <ChevronLeft className="w-4.5 h-4.5 text-slate-600" />
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
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' 
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
                <ChevronRight className="w-4.5 h-4.5 text-slate-600" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
