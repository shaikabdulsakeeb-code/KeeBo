import { baseApi } from '../../../app/api';

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
} = adminApi;
