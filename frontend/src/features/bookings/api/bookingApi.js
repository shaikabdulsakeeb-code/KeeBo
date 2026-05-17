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

          socket.on('newBooking', handleCreated);
          socket.on('bookingUpdated', handleUpdated);

          await cacheEntryRemoved;
          socket.off('newBooking', handleCreated);
          socket.off('bookingUpdated', handleUpdated);
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
