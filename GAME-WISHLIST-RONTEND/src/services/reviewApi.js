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
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    getReviewsByGame: builder.query({
      query: (gameId) => `/game/${gameId}`,
      providesTags: (result, error, gameId) => [
        { type: "reviews", id: gameId },
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    addReview: builder.mutation({
      query: ({ gameId, rating, comment }) => ({
        url: "/",
        method: "POST",
        body: { gameId, rating, comment },
      }),
      // Optimistic update - instant UI feedback
      async onQueryStarted({ gameId, rating, comment }, { dispatch, queryFulfilled, getState }) {
        const state = getState();
        const userId = state.auth.user?.id;
        const userName = state.auth.user?.name || state.auth.user?.email;
        
        // Optimistically add review to cache
        const patchResult = dispatch(
          reviewApi.util.updateQueryData("getReviewsByGame", gameId, (draft) => {
            const tempReview = {
              id: `temp-${Date.now()}`,
              rating,
              comment,
              gameId,
              userId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              user: {
                id: userId,
                name: userName,
                email: userName,
              },
            };
            draft.data.unshift(tempReview);
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
      // Optimistic update
      async onQueryStarted({ reviewId, rating, comment, gameId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          reviewApi.util.updateQueryData("getReviewsByGame", gameId, (draft) => {
            const review = draft.data.find((r) => r.id === reviewId);
            if (review) {
              review.rating = rating;
              review.comment = comment;
              review.updatedAt = new Date().toISOString();
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
      // Optimistic delete - instant removal from UI
      async onQueryStarted({ reviewId, gameId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          reviewApi.util.updateQueryData("getReviewsByGame", gameId, (draft) => {
            draft.data = draft.data.filter((review) => review.id !== reviewId);
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
