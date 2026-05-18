import { baseApi } from '../../../app/api';
import { socket } from '../../../lib/socket';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
    getBookings: builder.query({
      query: () => '/bookings',
      providesTags: ['Booking'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;

          const handleCreated = (booking) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                draft.data.unshift(booking);
                draft.count = (draft.count || 0) + 1;
              }
            });
          };

          const handleUpdated = (booking) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                const index = draft.data.findIndex((b) => b._id === booking._id);
                if (index !== -1) {
                  draft.data[index] = booking;
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
                }
              }
            });
          };

          socket.on('newBooking', handleCreated);
          socket.on('bookingUpdated', handleUpdated);
          socket.on('bookingDeleted', handleDeleted);

          await cacheEntryRemoved;
          socket.off('newBooking', handleCreated);
          socket.off('bookingUpdated', handleUpdated);
          socket.off('bookingDeleted', handleDeleted);
        } catch {}
      },
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/bookings/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
} = bookingApi;
