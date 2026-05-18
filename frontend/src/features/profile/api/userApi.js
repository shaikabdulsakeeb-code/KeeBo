import { baseApi } from '../../../app/api';
import { socket } from '../../../lib/socket';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: (userId) => '/users/favorites',
      providesTags: (result, error, userId) => [{ type: 'User', id: userId || 'OWN' }],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        try {
          await cacheDataLoaded;
          const handleTechnicianDeleted = (techId) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                draft.data = draft.data.filter((fav) => {
                  if (typeof fav === 'string') {
                    return fav !== techId;
                  }
                  if (typeof fav === 'object') {
                    return fav._id !== techId && fav.id !== techId;
                  }
                  return true;
                });
              }
            });
          };

          const handleTechnicianUpdated = (technician) => {
            updateCachedData((draft) => {
              if (draft && draft.data) {
                if (technician.isSuspended) {
                  // If suspended, surgically remove from active favorites view
                  draft.data = draft.data.filter((fav) => {
                    const id = typeof fav === 'string' ? fav : (fav._id || fav.id);
                    return id !== technician._id;
                  });
                }
              }
            });
            // If reactivated, force background refetch so they reappear if they are a real favorite
            if (!technician.isSuspended) {
              dispatch(userApi.endpoints.getFavorites.initiate(arg, { subscribe: false, forceRefetch: true }));
            }
          };

          socket.on('technicianDeleted', handleTechnicianDeleted);
          socket.on('technicianUpdated', handleTechnicianUpdated);
          await cacheEntryRemoved;
          socket.off('technicianDeleted', handleTechnicianDeleted);
          socket.off('technicianUpdated', handleTechnicianUpdated);
        } catch {}
      },
    }),
    addFavorite: builder.mutation({
      query: (technicianId) => ({
        url: `/users/favorites/${technicianId}`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    removeFavorite: builder.mutation({
      query: (technicianId) => ({
        url: `/users/favorites/${technicianId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    updateProfileImage: builder.mutation({
      query: (formData) => ({
        url: '/users/profile/image',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['User', 'Technician'],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useUpdateProfileImageMutation,
} = userApi;
