import { baseApi } from '../baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (params) => ({
        url: '/analytics/dashboard-stats',
        params
      }),
      providesTags: ['DashboardStats']
    }),
    getSalesAnalytics: builder.query({
      query: (params) => ({
        url: '/sales-tracking/admin/analytics',
        params
      }),
      transformResponse: (res) => res?.data || res,
      providesTags: ['SalesAnalytics']
    }),
    getMarkets: builder.query({
      query: () => '/sales-tracking/admin/markets',
      transformResponse: (res) => res?.data || [],
      providesTags: ['Markets']
    })
  })
});

export const {
  useGetDashboardStatsQuery,
  useGetSalesAnalyticsQuery,
  useGetMarketsQuery
} = dashboardApi;
