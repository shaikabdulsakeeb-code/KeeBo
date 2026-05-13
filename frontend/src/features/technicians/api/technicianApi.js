import { baseApi } from '../../../app/api';

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
      query: () => '/technicians/profile',
      providesTags: ['Technician'],
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
} = technicianApi;
