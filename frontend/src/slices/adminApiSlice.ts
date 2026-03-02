import { apiSlice } from "./apiSlice";

const ADMIN_URL = "/admin";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    AdminLogin: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),

    getUsers: builder.query({
      query: () => ({
        url: `${ADMIN_URL}/users`,
        method: "GET",
      }),
    }),

    // ✅ you must pass id into the query
    getSingleUser: builder.query({
      query: (id: string) => ({
        url: `${ADMIN_URL}/users/${id}`,
        method: "GET",
      }),
    }),

    // ✅ you must pass id + body
    updateUserStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `${ADMIN_URL}/users/${id}/status`,
        method: "PUT",
        body,
      }),
    }),
    generateLink: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/celeb-links`,
        method: "POST",
        body: data,
      })
    }),
    getGeneratedLinks: builder.query({
      query: () => ({
        url: `${ADMIN_URL}/celeb-links`,
        method: "GET",
      })
    })
  }),
});

export const {
  useAdminLoginMutation,
  useGetUsersQuery,
  useGetSingleUserQuery,
  useUpdateUserStatusMutation,
  useGenerateLinkMutation,
  useGetGeneratedLinksQuery,
} = adminApiSlice;