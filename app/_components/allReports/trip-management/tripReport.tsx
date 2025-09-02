'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TripHeader2 } from './tripHeader2';
import { TripReportTable } from './tripReportTable';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import { useGetTripVehiclesQuery } from '@/app/_globalRedux/services/trackingDashboard';

export const TripReport = () => {
	const [customDateRange, setCustomDateRange] = useState<Date[]>([moment().subtract(15, 'days').startOf('date').toDate(), new Date()]);
	const { groupId, userId } = useSelector((state: RootState) => state.auth);
	const [adjustedTripHistory, setAdjustedTripHistory] = useState<PlannedTrips[] | undefined>(undefined);
	const [isRefetchLoading, setIsRefetchLoading] = useState(false);
	const [isDelayLoading, setIsDelayLoading] = useState(false);
	const [alltripLoaded, setAllTripLoadded] = useState(0);

	const {
		isLoading: isTripLoading,
		data: tripHistory,
		refetch,
	} = useGetTripVehiclesQuery(
		{
			userId,
			token: groupId,
			startDate: moment(customDateRange[0]).format('YYYY-MM-DD HH:mm'),
			endDate: moment(customDateRange[1]).format('YYYY-MM-DD HH:mm'),
			tripStatus: 'On Trip',
			tripStatusBatch: 'On Trip',
		},
		{
			skip: !groupId || !userId,
			refetchOnMountOrArgChange: false,
			refetchOnFocus: false,
		}
	);

	// Normalize history date fields
	useEffect(() => {
		if (!tripHistory) return;
		const tempHistory = tripHistory.list.map((e) => ({
			...e,
			trip_complted_datebysystem:
				e.trip_complted_datebysystem && e.trip_complted_datebysystem !== '' ? e.trip_complted_datebysystem : e.trip_end || '',
		}));
		setAdjustedTripHistory(tempHistory);
	}, [tripHistory]);

	useEffect(
		() => {
			if (alltripLoaded === 1) return;

			const fetchDelays = async () => {
				if (!adjustedTripHistory?.length) return;
				setIsDelayLoading(true);
				setAllTripLoadded(1);

				const requests = adjustedTripHistory.map((trip) => {
					const vehId = trip.sys_service_id;
					const id = trip.id;
					const url = `https://gtrac.in/newtracking/reports/delay_ajax_calculatedapi.php?veh_id=${vehId}&id=${id}`;
					return axios
						.get(url)
						.then((response) => {
							console.log(`Delay data for veh_id=${vehId}, id=${id}:`, response.data);
						})
						.catch((error) => {
							console.error(`Error fetching delay for veh_id=${vehId}, id=${id}:`, error);
						});
				});

				await Promise.all(requests);

				await refetch();
				setIsDelayLoading(false);
			};

			fetchDelays();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[adjustedTripHistory]
	);

	const overallLoading = isTripLoading || isRefetchLoading || isDelayLoading;

	return (
		<div className='py-4 relative'>
			<TripHeader2
				customDateRange={customDateRange}
				setCustomDateRange={setCustomDateRange}
				setIsRefetchLoading={setIsRefetchLoading}
				refetch={refetch}
				isLoading={overallLoading}
			/>
			<TripReportTable refetch={refetch} isLoading={overallLoading} tripHistory={adjustedTripHistory} setIsRefetchLoading={setIsRefetchLoading} />
		</div>
	);
};
