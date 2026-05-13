import { baseApi } from '../../../app/api';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: () => '/users/favorites',
      providesTags: ['User'],
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
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = userApi;
