import { createApi } from '@reduxjs/toolkit/query/react';
import api from '../utils/api';

const axiosBaseQuery =
  () =>
  async (arg) => {
    try {
      const config = typeof arg === 'string' ? { url: arg } : arg;
      const result = await api({
        url: config.url,
        method: config.method || 'get',
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['DashboardStats', 'SalesAnalytics', 'Markets'],
  endpoints: () => ({})
});
