import { baseApi } from '../../../app/api';
import { socket } from '../../../lib/socket';

export const technicianApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTechnicians: builder.query({
      query: (params) => ({
        url: '/technicians',
        params,
      }),
      providesTags: ['Technician'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          
          const handleCreated = (technician) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                const isMatch = (!arg?.isApproved || arg.isApproved === technician.isApproved) &&
                                (!arg?.category || arg.category === technician.category);
                
                const index = draft.data.findIndex((t) => t._id === technician._id);
                if (index === -1 && isMatch) {
                  draft.data.unshift(technician);
                  if (draft.count !== undefined) draft.count += 1;
                  if (draft.totalCount !== undefined) draft.totalCount += 1;
                }
              }
            });
          };

          const handleUpdated = (technician) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                const isMatch = (!arg?.isApproved || arg.isApproved === technician.isApproved) &&
                                (!arg?.category || arg.category === technician.category) &&
                                !technician.isSuspended;
                
                const index = draft.data.findIndex((t) => t._id === technician._id);
                if (index !== -1) {
                  if (isMatch) {
                    draft.data[index] = technician;
                  } else {
                    draft.data.splice(index, 1);
                    if (draft.count !== undefined) draft.count = Math.max(0, draft.count - 1);
                    if (draft.totalCount !== undefined) draft.totalCount = Math.max(0, draft.totalCount - 1);
                  }
                } else if (isMatch) {
                  draft.data.unshift(technician);
                  if (draft.count !== undefined) draft.count += 1;
                  if (draft.totalCount !== undefined) draft.totalCount += 1;
                }
              }
            });
          };

          const handleDeleted = (techId) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                const index = draft.data.findIndex((t) => t._id === techId);
                if (index !== -1) {
                  draft.data.splice(index, 1);
                  if (draft.count !== undefined) draft.count = Math.max(0, draft.count - 1);
                  if (draft.totalCount !== undefined) draft.totalCount = Math.max(0, draft.totalCount - 1);
                }
              }
            });
          };

          socket.on('technicianCreated', handleCreated);
          socket.on('technicianUpdated', handleUpdated);
          socket.on('technicianDeleted', handleDeleted);

          await cacheEntryRemoved;
          socket.off('technicianCreated', handleCreated);
          socket.off('technicianUpdated', handleUpdated);
          socket.off('technicianDeleted', handleDeleted);
        } catch {}
      },
    }),
    getTechnicianById: builder.query({
      query: (id) => `/technicians/${id}`,
      providesTags: (result, error, id) => [{ type: 'Technician', id }],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const handleUpdated = (technician) => {
            if (technician._id === arg) {
              updateCachedData((draft) => {
                if (draft && draft.data) {
                  Object.assign(draft.data, technician);
                }
              });
            }
          };

          const handleDeleted = (techId) => {
            if (techId === arg) {
              updateCachedData((draft) => {
                if (draft) {
                  draft.data = null;
                }
              });
            }
          };

          socket.on('technicianUpdated', handleUpdated);
          socket.on('technicianDeleted', handleDeleted);
          await cacheEntryRemoved;
          socket.off('technicianUpdated', handleUpdated);
          socket.off('technicianDeleted', handleDeleted);
        } catch {}
      },
    }),
    getOwnProfile: builder.query({
      query: () => '/technicians/profile',
      providesTags: ['Technician'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const handleProfileUpdated = (updatedProfile) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                Object.assign(draft.data, updatedProfile);
              }
            });
          };

          socket.on('technicianProfileUpdated', handleProfileUpdated);
          await cacheEntryRemoved;
          socket.off('technicianProfileUpdated', handleProfileUpdated);
        } catch {}
      },
    }),
    updateTechnicianAvailability: builder.mutation({
      query: (isAvailable) => ({
        url: '/technicians/profile/availability',
        method: 'PATCH',
        body: { isAvailable },
      }),
      invalidatesTags: ['Technician'],
    }),
    getTechnicianReviews: builder.query({
      query: (techId) => `/technicians/${techId}/reviews`,
      providesTags: (result, error, techId) => [{ type: 'Review', id: techId }],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const handleNewReview = (review) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                draft.data.unshift(review);
                draft.count = (draft.count || 0) + 1;
              }
            });
          };

          socket.on('newReview', handleNewReview);
          await cacheEntryRemoved;
          socket.off('newReview', handleNewReview);
        } catch {}
      },
    }),
    addReview: builder.mutation({
      query: ({ techId, ...reviewData }) => ({
        url: `/technicians/${techId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { techId }) => [{ type: 'Review', id: techId }, 'Technician', 'Booking'],
    }),
    createProfile: builder.mutation({
      query: (profileData) => ({
        url: '/technicians/profile',
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['Technician'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/technicians/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Technician'],
    }),
    payDues: builder.mutation({
      query: (paymentData) => ({
        url: '/technicians/pay-dues',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Technician', 'Booking'],
    }),
    getServiceStats: builder.query({
      query: () => '/technicians/stats/services',
      providesTags: ['Technician'],
    }),
  }),
});

export const {
  useGetTechniciansQuery,
  useGetTechnicianByIdQuery,
  useUpdateTechnicianAvailabilityMutation,
  useGetOwnProfileQuery,
  useGetTechnicianReviewsQuery,
  useAddReviewMutation,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useGetServiceStatsQuery,
  usePayDuesMutation,
} = technicianApi;
