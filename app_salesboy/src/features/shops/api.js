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
    })
  })
});

export const { useGetShopsQuery, useGetShopHistoryQuery } = shopsApi;
