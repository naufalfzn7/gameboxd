import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL from "../config/apiConfig.js";

const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/games`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["game"],
  endpoints: (builder) => ({
    getGames: builder.query({
      query: ({ page = 1, limit = 10, search } = {}) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);
        if (search) {
          params.set("search", search);
        }
        return `/?${params.toString()}`; // GET /api/games/?page=1&limit=10&search=...
      },
      providesTags: ["game"],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    getGameById: builder.query({
      query: (id) => `/${id}`, // GET /api/games/:id
      providesTags: (result, error, id) => [{ type: "game", id }],
      keepUnusedDataFor: 600, // Cache game details for 10 minutes (longer since they change less frequently)
    }),
  }),
});

export const { useGetGamesQuery, useGetGameByIdQuery } = gameApi;
export default gameApi;
