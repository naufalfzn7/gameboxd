import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api/games",
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
      query: ({ page = 1, limit = 10 } = {}) => `/?page=${page}&limit=${limit}`, // GET /api/games/?page=1&limit=10
      providesTags: ["game"],
    }),
    getGameById: builder.query({
      query: (id) => `/${id}`, // GET /api/games/:id
      providesTags: ["game"],
    }),
  }),
});

export const { useGetGamesQuery, useGetGameByIdQuery } = gameApi;
export default gameApi;
