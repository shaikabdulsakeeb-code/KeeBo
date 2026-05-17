import { baseApi } from '../../../app/api';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: (userId) => '/users/favorites',
      providesTags: (result, error, userId) => [{ type: 'User', id: userId || 'OWN' }],
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
