import { baseApi } from '../../../app/api';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
    getPendingTechnicians: builder.query({
      query: () => '/admin/technicians',
      providesTags: ['Technician'],
    }),
    verifyTechnician: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/technicians/${id}/verify`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Technician', 'AdminStats'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetPendingTechniciansQuery,
  useVerifyTechnicianMutation,
} = adminApi;
