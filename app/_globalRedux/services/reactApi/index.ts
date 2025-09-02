import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GetAlertsPopupsResponse, NormalAlertUpdateBody } from '../../services/types/alerts';
import { getFormData } from '@/app/helpers/convertjsToFormData';

export const reactApi = createApi({
	reducerPath: 'react-api',
	refetchOnFocus: true,
	tagTypes: ['Normal-Alert-Popups'],

	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_REACT_API,
	}),
	endpoints: (builder) => ({
		getNormalAlerts: builder.query<GetAlertsPopupsResponse[], { token: number }>({
			query: ({ token }) => `alerts_popups.php?token=${token}`,
			providesTags: ['Normal-Alert-Popups'],
		}),

		getIsUserAuthenticated: builder.mutation<any, { username: string; ms_username: string }>({
			query: ({ username, ms_username }) => ({ url: `auth_user.php`, body: getFormData({ username, email: ms_username }), method: 'POST' }),
		}),

		addNormalAlertComment: builder.mutation<any, any>({
			query: (body: any) => ({
				url: 'alerts_popups_update.php',
				method: 'POST',
				body: new URLSearchParams({
					...body,
				}),
			}),
		}),
	}),
});

export const { useGetNormalAlertsQuery, useLazyGetNormalAlertsQuery, useAddNormalAlertCommentMutation, useGetIsUserAuthenticatedMutation } = reactApi;
