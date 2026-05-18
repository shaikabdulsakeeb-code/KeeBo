import { baseApi } from '../../../app/api';
import { socket } from '../../../lib/socket';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
    getAllTechnicians: builder.query({
      query: (params) => ({
        url: '/admin/technicians',
        params: params,
      }),
      providesTags: ['Technician'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;

          const handleCreated = (technician) => {
            updateCachedData((draft) => {
              const isMatch = !arg?.isApproved || arg.isApproved === technician.isApproved;
              if (draft && draft.data && isMatch) {
                // Prevent duplicate insertions
                draft.data = draft.data.filter(t => t._id !== technician._id);
                draft.data.unshift(technician);
                draft.count = (draft.count || 0) + 1;
                draft.totalCount = (draft.totalCount || 0) + 1;
              }
            });
          };

          const handleUpdated = (technician) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                const index = draft.data.findIndex((t) => t._id === technician._id);
                const isMatch = !arg?.isApproved || arg.isApproved === technician.isApproved;
                
                if (index !== -1) {
                  if (isMatch) {
                     draft.data[index] = technician;
                  } else {
                     draft.data.splice(index, 1);
                     draft.count = Math.max(0, (draft.count || 1) - 1);
                     draft.totalCount = Math.max(0, (draft.totalCount || 1) - 1);
                  }
                } else if (isMatch) {
                  draft.data.unshift(technician);
                  draft.count = (draft.count || 0) + 1;
                  draft.totalCount = (draft.totalCount || 0) + 1;
                }
              }
            });
          };

          socket.on('technicianCreated', handleCreated);
          socket.on('technicianUpdated', handleUpdated);

          await cacheEntryRemoved;
          socket.off('technicianCreated', handleCreated);
          socket.off('technicianUpdated', handleUpdated);
        } catch {}
      },
    }),
    getTechnicianById: builder.query({
      query: (id) => `/admin/technicians/${id}`,
      providesTags: (result, error, id) => [{ type: 'Technician', id }],
    }),
    deleteTechnician: builder.mutation({
      query: (id) => ({
        url: `/admin/technicians/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Technician', 'AdminStats'],
    }),
    verifyTechnician: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/admin/technicians/${id}/verify`,
        method: 'PUT',
        body: { status, rejectionReason },
      }),
      invalidatesTags: ['Technician', 'AdminStats'],
    }),
    getUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'AdminStats'],
    }),
    getAllBookings: builder.query({
      query: (params) => ({
        url: '/admin/bookings',
        params,
      }),
      providesTags: ['Booking'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;

          const handleCreated = (booking) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                draft.data.unshift(booking); // add to top
                draft.count = (draft.count || 0) + 1;
                draft.totalCount = (draft.totalCount || 0) + 1;
              }
            });
          };

          const handleUpdated = (booking) => {
            updateCachedData((draft) => {
              if (draft) {
                // 1. Update the stats (outstanding counts) globally on any cache entry change!
                if (draft.stats && booking.oldStatus && booking.status !== booking.oldStatus) {
                  const oldStatKey = booking.oldStatus.toLowerCase();
                  const newStatKey = booking.status.toLowerCase();
                  
                  // Decrement previous status count safely
                  if (draft.stats[oldStatKey] !== undefined) {
                    draft.stats[oldStatKey] = Math.max(0, draft.stats[oldStatKey] - 1);
                  }
                  // Increment new status count safely
                  if (draft.stats[newStatKey] !== undefined) {
                    draft.stats[newStatKey] = (draft.stats[newStatKey] || 0) + 1;
                  }

                  // Adjust total revenue when a booking becomes completed or ceases to be completed
                  if (newStatKey === 'completed' && oldStatKey !== 'completed') {
                    draft.stats.totalRevenue = (draft.stats.totalRevenue || 0) + (booking.price || 0);
                  } else if (oldStatKey === 'completed' && newStatKey !== 'completed') {
                    draft.stats.totalRevenue = Math.max(0, (draft.stats.totalRevenue || 0) - (booking.price || 0));
                  }
                }

                // 2. Adjust items inside the current data array based on matching status filter
                if (draft.data) {
                  const index = draft.data.findIndex((b) => b._id === booking._id);
                  const filterStatus = arg?.status || 'all';

                  if (filterStatus === 'all') {
                    // In "all" list, just replace the changed item in-place
                    if (index !== -1) {
                      draft.data[index] = booking;
                    }
                  } else {
                    // For tabs like pending, completed, cancelled, rejected:
                    const matchesFilter = booking.status.toLowerCase() === filterStatus.toLowerCase();

                    if (index !== -1) {
                      if (matchesFilter) {
                        // Still matches filter, update in-place
                        draft.data[index] = booking;
                      } else {
                        // No longer matches this filter, remove it!
                        draft.data.splice(index, 1);
                        draft.count = Math.max(0, (draft.count || 1) - 1);
                        draft.totalCount = Math.max(0, (draft.totalCount || 1) - 1);
                      }
                    } else if (matchesFilter) {
                      // Doesn't exist yet, but now matches the status filter -> add it to top!
                      draft.data.unshift(booking);
                      draft.count = (draft.count || 0) + 1;
                      draft.totalCount = (draft.totalCount || 0) + 1;
                    }
                  }
                }
              }
            });
          };

          const handleDeleted = (bookingId) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                const index = draft.data.findIndex((b) => b._id === bookingId);
                if (index !== -1) {
                  draft.data.splice(index, 1);
                  draft.count = Math.max(0, (draft.count || 1) - 1);
                  draft.totalCount = Math.max(0, (draft.totalCount || 1) - 1);
                }
              }
            });
          };

          socket.on('bookingCreated', handleCreated);
          socket.on('bookingUpdated', handleUpdated);
          socket.on('bookingDeleted', handleDeleted);

          await cacheEntryRemoved;
          socket.off('bookingCreated', handleCreated);
          socket.off('bookingUpdated', handleUpdated);
          socket.off('bookingDeleted', handleDeleted);
        } catch {}
      },
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/bookings/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Booking', 'AdminStats'],
    }),
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `/admin/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking', 'AdminStats'],
    }),
    getAdminSettings: builder.query({
      query: () => '/admin/settings',
      providesTags: ['AdminSettings'],
    }),
    updateAdminSettings: builder.mutation({
      query: (settings) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['AdminSettings'],
    }),
    getSettlements: builder.query({
      query: () => '/admin/settlements',
      providesTags: ['Settlement'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;

          const handleCreated = (settlement) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                // Prevent duplicate additions
                draft.data = draft.data.filter(s => s._id !== settlement._id);
                draft.data.unshift(settlement);
              }
            });
          };

          const handleUpdated = (settlement) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                const index = draft.data.findIndex((s) => s._id === settlement._id);
                if (index !== -1) {
                  draft.data[index] = settlement;
                }
              }
            });
          };

          socket.on('settlementCreated', handleCreated);
          socket.on('settlementUpdated', handleUpdated);

          await cacheEntryRemoved;
          socket.off('settlementCreated', handleCreated);
          socket.off('settlementUpdated', handleUpdated);
        } catch {}
      },
    }),
    verifySettlement: builder.mutation({
      query: ({ id, status, rejectionReason, remainingDues }) => ({
        url: `/admin/settlements/${id}`,
        method: 'PUT',
        body: { status, rejectionReason, remainingDues },
      }),
      invalidatesTags: ['Settlement', 'AdminStats', 'Technician'],
    }),
    suspendTechnician: builder.mutation({
      query: ({ id, suspensionReason }) => ({
        url: `/admin/technicians/${id}/suspend`,
        method: 'PUT',
        body: { suspensionReason }
      }),
      invalidatesTags: ['Technician', 'AdminStats'],
    }),
    getAllReviews: builder.query({
      query: (params) => ({
        url: '/admin/reviews',
        params,
      }),
      providesTags: ['Review'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const handleNewReview = (review) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                // If backend gives populated users, we might need a fetch, but for now we unshift it to top
                draft.data.unshift(review);
                draft.count = (draft.count || 0) + 1;
                draft.totalCount = (draft.totalCount || 0) + 1;
              }
            });
          };

          socket.on('newReview', handleNewReview);
          await cacheEntryRemoved;
          socket.off('newReview', handleNewReview);
        } catch {}
      },
    }),
    adminDeleteReview: builder.mutation({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'AdminStats'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAllTechniciansQuery,
  useGetTechnicianByIdQuery,
  useDeleteTechnicianMutation,
  useVerifyTechnicianMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useGetSettlementsQuery,
  useVerifySettlementMutation,
  useSuspendTechnicianMutation,
  useGetAllReviewsQuery,
  useAdminDeleteReviewMutation,
} = adminApi;
