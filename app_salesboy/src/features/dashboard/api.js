import { baseApi } from '@store/baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppDashboard: builder.query({
      query: () => '/sales-tracking/app/dashboard',
      providesTags: ['Dashboard']
    })
  })
});

export const { useGetAppDashboardQuery } = dashboardApi;
