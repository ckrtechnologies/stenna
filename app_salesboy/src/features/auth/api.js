import { baseApi } from '@store/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/sales-tracking/auth/login',
        method: 'POST',
        body: credentials
      })
    })
  })
});

export const { useLoginMutation } = authApi;
