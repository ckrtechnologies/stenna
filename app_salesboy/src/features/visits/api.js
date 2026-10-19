import { baseApi } from '@store/baseApi';

export const visitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    recordVisit: builder.mutation({
      query: (visitData) => ({
        url: '/sales-tracking/app/visits',
        method: 'POST',
        body: visitData
      }),
      invalidatesTags: ['Dashboard', 'Shops', 'ShopDetail', 'Visits']
    }),
    getVisits: builder.query({
      query: (params) => ({
        url: '/sales-tracking/visits',
        params
      }),
      providesTags: ['Visits']
    }),
    getBooks: builder.query({
      query: () => '/books',
      providesTags: ['Books']
    })
  })
});

export const {
  useRecordVisitMutation,
  useGetVisitsQuery,
  useGetBooksQuery
} = visitsApi;
