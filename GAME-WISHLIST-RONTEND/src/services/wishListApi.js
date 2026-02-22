import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL from "../config/apiConfig.js";

const wishListApi = createApi({
  reducerPath: "wishListApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/wishlist`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["wishlist"],
  endpoints: (builder) => ({
    // Get all wishlist items for current user
    getWishList: builder.query({
      query: () => "/", // GET /api/wishlist/
      providesTags: ["wishlist"],
    }),

    // Get detail wishlist item by ID
    getDetailWishListById: builder.query({
      query: (wishListId) => `/${wishListId}`, // GET /api/wishlist/:wishListId
      providesTags: ["wishlist"],
    }),

    // Add game to wishlist
    addToWishList: builder.mutation({
      query: (gameId) => ({
        url: `/${gameId}`, // POST /api/wishlist/:gameId
        method: "POST",
      }),
      invalidatesTags: ["wishlist"],
    }),

    // Remove game from wishlist by wishlist entry ID
    removeFromWishListById: builder.mutation({
      query: (wishListId) => ({
        url: `/${wishListId}`, // DELETE /api/wishlist/:wishListId
        method: "DELETE",
      }),
      invalidatesTags: ["wishlist"],
    }),

    // Update wishlist entry (status)
    updateWishListById: builder.mutation({
      query: ({ wishListId, status }) => ({
        url: `/${wishListId}`, // PUT /api/wishlist/:wishListId
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["wishlist"],
    }),
  }),
});

export const {
  useGetWishListQuery,
  useGetDetailWishListByIdQuery,
  useAddToWishListMutation,
  useRemoveFromWishListByIdMutation,
  useUpdateWishListByIdMutation,
} = wishListApi;

export default wishListApi;
