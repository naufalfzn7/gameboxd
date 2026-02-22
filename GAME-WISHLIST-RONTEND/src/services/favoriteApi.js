import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const favoriteApi = createApi({
  reducerPath: "favoriteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api/favorites",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["favorites"],
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: () => "/",
      providesTags: ["favorites"],
    }),
    updateFavorites: builder.mutation({
      query: (gameIds) => ({
        url: "/",
        method: "PUT",
        body: { gameIds },
      }),
      invalidatesTags: ["favorites"],
    }),
  }),
});

export const { useGetFavoritesQuery, useUpdateFavoritesMutation } = favoriteApi;
export default favoriteApi;
