import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Read API URL from env (default to production: https://api.stenna.in/api/v1)
const BASE_URL = process.env.API_BASE_URL || 'https://api.stenna.in/api/v1';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Dashboard', 'Shops', 'ShopDetail', 'Visits', 'Books'],
  endpoints: () => ({})
});
