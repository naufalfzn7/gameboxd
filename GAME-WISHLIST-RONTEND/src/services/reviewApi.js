import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL from "../config/apiConfig.js";

const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/reviews`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["reviews", "game"],
  endpoints: (builder) => ({
    getMyReviews: builder.query({
      query: () => "/me",
      providesTags: ["reviews"],
    }),
    getReviewsByGame: builder.query({
      query: (gameId) => `/game/${gameId}`,
      providesTags: (result, error, gameId) => [
        { type: "reviews", id: gameId },
      ],
    }),
    addReview: builder.mutation({
      query: ({ gameId, rating, comment }) => ({
        url: "/",
        method: "POST",
        body: { gameId, rating, comment },
      }),
      invalidatesTags: (result, error, args) => [
        { type: "reviews", id: args.gameId },
        { type: "game", id: args.gameId },
      ],
    }),
    updateReview: builder.mutation({
      query: ({ reviewId, rating, comment }) => ({
        url: `/${reviewId}`,
        method: "PUT",
        body: { rating, comment },
      }),
      invalidatesTags: (result, error, args) => [
        { type: "reviews", id: args.gameId },
        { type: "game", id: args.gameId },
      ],
    }),
    deleteReview: builder.mutation({
      query: ({ reviewId }) => ({
        url: `/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, args) => [
        { type: "reviews", id: args.gameId },
        { type: "game", id: args.gameId },
      ],
    }),
  }),
});

export const {
  useGetMyReviewsQuery,
  useGetReviewsByGameQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;

export default reviewApi;
