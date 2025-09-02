import { createApi, fetchBaseQuery, FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../store';
import { getToken } from '@/lib/mettax';

export const mettax = createApi({
	reducerPath: 'mettax-api',
	refetchOnFocus: true,
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_METTAX_API,
	}),
	endpoints: (builder) => ({
		createMettaxToken: builder.mutation<CreateTokenResponse, void>({
			query: () => ({
				url: 'gps/v2/openapi/system/createToken',
				method: 'POST',
				body: {
					apiKey: process.env.NEXT_PUBLIC_METTAX_API_KEY,
					apiSecret: process.env.NEXT_PUBLIC_METTAX_API_SECRET,
				},
			}),
		}),

		getMettaxDeviceInfo: builder.mutation<GetMettaxDeviceInfoResponse, { deviceId: string }>({
			async queryFn({ deviceId }, { getState }, _extraOptions, baseQuery) {
				const token = await getToken();

				const result = await baseQuery({
					url: 'gps/v2/openapi/device/expand/info',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: token || '',
					},
					body: { deviceId },
				});

				return result as QueryReturnValue<GetMettaxDeviceInfoResponse, FetchBaseQueryError, FetchBaseQueryMeta>;
			},
		}),

		getMettaxDevices: builder.mutation<GetMettaxDevicesResponse, { customerId: string }>({
			async queryFn({ customerId }, { getState }, _extraOptions, baseQuery) {
				const token = await getToken();

				const result = await baseQuery({
					url: 'gps/v2/openapi/device/shadow/customer',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: token || '',
					},
					body: { customerId },
				});

				return result as QueryReturnValue<GetMettaxDevicesResponse, FetchBaseQueryError, FetchBaseQueryMeta>;
			},
		}),
	}),
});

export const { useCreateMettaxTokenMutation, useGetMettaxDevicesMutation, useGetMettaxDeviceInfoMutation } = mettax;
