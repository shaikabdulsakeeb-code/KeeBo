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
    }),
    getTechnicianById: builder.query({
      query: (id) => `/technicians/${id}`,
      providesTags: (result, error, id) => [{ type: 'Technician', id }],
    }),
    getOwnProfile: builder.query({
      query: (userId) => '/technicians/profile',
      providesTags: (result, error, userId) => [{ type: 'Technician', id: userId || 'OWN' }],
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
