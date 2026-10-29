import { baseApi } from '@store/baseApi';

export const shopsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query({
      query: (params) => ({
        url: '/sales-tracking/vendors',
        params
      }),
      providesTags: ['Shops']
    }),
    getShopHistory: builder.query({
      query: (vendorId) => `/sales-tracking/vendors/${vendorId}/history`,
      providesTags: (result, error, id) => [{ type: 'ShopDetail', id }]
    }),
    getZones: builder.query({
      query: () => '/sales-tracking/zones',
      providesTags: ['Zones']
    }),
    getMarkets: builder.query({
      query: (params) => ({
        url: '/sales-tracking/markets',
        params
      }),
      providesTags: ['Markets']
    })
  })
});

export const {
  useGetShopsQuery,
  useGetShopHistoryQuery,
  useGetZonesQuery,
  useGetMarketsQuery
} = shopsApi;
