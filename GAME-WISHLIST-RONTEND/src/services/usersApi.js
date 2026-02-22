import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL from "../config/apiConfig.js";

const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/users`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["me"],
  endpoints: (builder) => ({
    me: builder.query({
      query: () => "/me",
      providesTags: ["me"],
    }),
    updateMe: builder.mutation({
      query: (data) => ({
        url: "/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["me"],
    }),
  }),
});

export const { useMeQuery, useUpdateMeMutation } = usersApi;
export default usersApi;
