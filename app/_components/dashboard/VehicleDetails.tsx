'use client';

import { RootState } from '@/app/_globalRedux/store';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { VehicleDetailsSelect } from './VehicleDetailsSelect';
import { CustomRangePicker } from './CustomRangePicker';
import { CloseOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip } from 'antd';
import {
	initialSelectedVehicleState,
	removeSelectedVehicle,
	setPrevVehicleSelected,
	setSelectedVehicleBySelectElement,
} from '@/app/_globalRedux/dashboard/selectedVehicleSlice';
import { VehicleDateOverview } from './VehicleDateOverview';
import { VehicleHistoryTabs } from './VehicleHistoryTabs';
import {
	trackingDashboard,
	useGetItineraryvehIdBDateNwStQuery,
	useGetpathwithDateDaignosticQuery,
	useLazyGetItineraryvehIdBDateNwStQuery,
	useLazyGetpathwithDateDaignosticQuery,
} from '@/app/_globalRedux/services/trackingDashboard';
import { setVehicleItnaryWithPath, vehicleItnaryWithPathInitialState } from '@/app/_globalRedux/dashboard/vehicleItnaryWithPathSlice';
import { setIsVehicleDetailsCollapsed } from '@/app/_globalRedux/dashboard/isVehicleDetailsCollapsedSlice';
import Image from 'next/image';
import * as live from '@/public/assets/gif/live.gif';
import expandReports from '@/public/assets/svgs/common/expand-reports.svg';

import moment from 'moment';
import { setAllMarkers } from '@/app/_globalRedux/dashboard/markersSlice';
import VehicleDetailsDownloadButton from './VehicleDetailsDownloadButton';
import { setIsGetNearbyVehiclesActive } from '@/app/_globalRedux/dashboard/nearbyVehicleSlice';
import { GetItnaryWithMapResponse } from '@/app/_globalRedux/services/types';
import { liveVehicleInitialState, setLiveVehicleItnaryWithPath } from '@/app/_globalRedux/dashboard/liveVehicleSlice';
import { VehicleDetailsContext } from './View';
import { setCreateTripOrTripPlanningActive } from '@/app/_globalRedux/dashboard/createTripOrTripPlanningActive';
import { PlacesDropdown } from './PlacesDropdown';
import { useAppDispatch } from '@/app/_globalRedux/provider';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { VehicleItnaryWithPath } from '@/app/_globalRedux/services/types/getItnaryWithMapResponse';
import React from 'react';
import { getLatestGPSTime } from './utils/getLatestGPSTime';
import { isKmtAccount } from '@/app/helpers/isKmtAccount';
import { apmTotalKm } from '@/app/helpers/apmTotalKm';
import { getNormalOrControllerId } from './utils/getNormalOrControllerId';

const selectedStyles = {
	selectorBg: 'transparent',
	colorBorder: 'transparent',
	fontSize: 19,
	optionFontSize: 14,
	optionPadding: '5px',
	optionSelectedColor: '#000',
};

export const mergeData = (data: any[], userId: string, parentUser: string, extra: string) => {
	let mergedData: any[] = [];
	let totalDistance = 0;
	data.forEach((value, index) => {
		if (
			(index > 0 && value.mode === 'Idle' && data[index - 1]?.mode === 'Idle') ||
			(index > 0 && value.mode === 'Idle' && value.fromLat === data[index - 1].toLat && value.fromLng === data[index - 1].toLong)
		) {
			// merge the current value with the previous one
			mergedData[mergedData.length - 1] = {
				...mergedData[mergedData.length - 1],
				fromLat: value.fromLat,
				fromLng: value.fromLng,
				fromTime: value.fromTime,
				startLocation: value.startLocation,
				totalDistance:
					isNaN(Number(extra)) || Number(extra) === 0
						? mergedData[mergedData.length - 1].totalDistance
						: ((mergedData[mergedData.length - 1].totalDistance * Number(extra)) / 100)?.toFixed(2),
				totalTimeInMIN: mergedData[mergedData.length - 1].totalTimeInMIN + value.totalTimeInMIN,
			};
		} else {
			mergedData.push({
				...value,
				totalDistance: `${
					isNaN(Number(extra)) || Number(extra) === 0
						? Number(value?.totalDistance.split(' ')[0])
						: Number((Number(value?.totalDistance.split(' ')[0]) + (Number(value?.totalDistance.split(' ')[0]) * Number(extra)) / 100)?.toFixed(2))
				} KM`,
			});
		}
	});

	return isKmtAccount(Number(userId), Number(parentUser))
		? { data, totalDistance: totalDistance?.toFixed(2) }
		: { data: mergedData, totalDistance: totalDistance?.toFixed(2) };
};

export const updateVehicleItnaryWithPath = ({
	vehicleListDataArgs,
	pathwithDateDataArgs,
	vehicleItnaryWithPath,
	dispatch,
	userId,
	parentUser,
	extra,
}: {
	vehicleListDataArgs: GetItnaryWithMapResponse | undefined;
	pathwithDateDataArgs: GetpathwithDateDaignosticReponse | undefined;
	vehicleItnaryWithPath: VehicleItnaryWithPath;
	dispatch: ThunkDispatch<RootState, unknown, any>;
	userId: string;
	parentUser: string;
	extra: string;
}) => {
	if (vehicleListDataArgs && pathwithDateDataArgs) {
		let adjustedVehicleListData = mergeData(vehicleListDataArgs.data, userId, parentUser, extra);
		let adjustpathwithDateData = mergeData(pathwithDateDataArgs.data, userId, parentUser, extra);

		dispatch(
			setVehicleItnaryWithPath({
				...vehicleListDataArgs,
				data: adjustedVehicleListData.data,
				vehicleId: pathwithDateDataArgs.vehicleId,
				diagnosticData: adjustpathwithDateData.data,
				patharry: pathwithDateDataArgs.patharry,
				fromTime: pathwithDateDataArgs.fromTime,
				toTime: pathwithDateDataArgs.toTime,
				totalDistance: pathwithDateDataArgs.totalDistance,
				calculatedTotalDistance: Number(adjustpathwithDateData.totalDistance),
				runningTime: pathwithDateDataArgs.runningTime,
				stoppageTime: pathwithDateDataArgs.stoppageTime,
			})
		);
	} else if (vehicleListDataArgs && !pathwithDateDataArgs) {
		dispatch(setLiveVehicleItnaryWithPath(liveVehicleInitialState));
		dispatch(setVehicleItnaryWithPath(vehicleItnaryWithPathInitialState));
		let adjustedVehicleListData = mergeData(vehicleListDataArgs.data, userId, parentUser, extra);
		dispatch(
			setVehicleItnaryWithPath({
				...vehicleListDataArgs,
				data: adjustedVehicleListData.data,
				vehicleId: vehicleItnaryWithPath.vehicleId,
				diagnosticData: vehicleItnaryWithPath.diagnosticData,
				patharry: vehicleItnaryWithPath.patharry,
				fromTime: vehicleItnaryWithPath.fromTime,
				toTime: vehicleItnaryWithPath.toTime,
				totalDistance: vehicleItnaryWithPath.totalDistance,
				calculatedTotalDistance: 0,
				runningTime: vehicleItnaryWithPath.runningTime,
				stoppageTime: vehicleItnaryWithPath.stoppageTime,
			})
		);
	}
	dispatch(setIsVehicleDetailsCollapsed(false));
};

export const getStartEndDate = (
	date: string,
	type: 'start' | 'end',
	format: string,
	returnType: 'not touched' | 'date',
	vehicleListType: 'trip' | 'vehicle' | 'video' | 'vehicle-allocation-trip'
) => {
	if (type === 'start') {
		if (vehicleListType === 'trip' || vehicleListType === 'vehicle-allocation-trip') {
			const startDate = moment(new Date(date));

			if (!startDate.isValid() || startDate.isBefore([2020, 10, 21], 'year')) {
				if (returnType === 'not touched') {
					return 'Not Touched';
				} else {
					return moment(new Date()).startOf('day').format(format);
				}
			} else {
				return startDate.format(format);
			}
		} else {
			return moment(new Date()).startOf('day').format(format);
		}
	} else {
		if (vehicleListType === 'trip' || vehicleListType === 'vehicle-allocation-trip') {
			const completedDate = moment(new Date(date));

			if (!completedDate.isValid() || completedDate.isBefore([2020, 10, 21], 'year')) {
				return moment(new Date()).format(format);
			} else {
				return completedDate.format(format);
			}
		} else {
			return moment(new Date()).format(format);
		}
	}
};

export const VehicleDetails = () => {
	const dispatch = useAppDispatch();
	const { reportsModalState } = useContext(VehicleDetailsContext);

	const { type: createTripOrPlanningTripActive } = useSelector((state: RootState) => state.createTripOrPlanningTripActive);
	const collapseVehicleStatusToggle = useSelector((state: RootState) => state.collapseVehicleStatusToggle);
	const collapseTripStatusToggle = useSelector((state: RootState) => state.collapseTripStatusToggle);
	const vehicleItnaryWithPath = useSelector((state: RootState) => state.vehicleItnaryWithPath);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const historyReplay = useSelector((state: RootState) => state.historyReplay);
	const { groupId, userId, accessLabel, parentUser, extra } = useSelector((state: RootState) => state.auth);
	const { dateRangeForDataFetching } = useSelector((state: RootState) => state.customRange);
	const selectedDashboardVehicle = useSelector((state: RootState) => state.selectedDashboardVehicle);
	const markers = useSelector((state: RootState) => state.markers);
	const { type: vehicleListType } = useSelector((state: RootState) => state.isVehicleStatusOrTripStatusActive);
	const [visibleDetailsStyling, setVisibleDetailsStyling] = useState('');
	const [vehicleDetailsUpdateTime, setVehicleDetailsUpdateTime] = useState('pending');
	const selectedTrip = useSelector((state: RootState) => state.selectedTrip);

	useEffect(() => {
		if (selectedVehicle.vId === 0) {
			if (
				(vehicleListType === 'video' && collapseVehicleStatusToggle) ||
				(vehicleListType === 'vehicle' && collapseVehicleStatusToggle) ||
				(vehicleListType === 'trip' && collapseTripStatusToggle) ||
				(vehicleListType === 'vehicle-allocation-trip' && collapseTripStatusToggle)
			) {
				setVisibleDetailsStyling('-translate-x-[442px]');
			} else {
				setVisibleDetailsStyling('-translate-x-[20px]');
			}
			9;
		} else if (selectedVehicle.vId !== 0) {
			if (
				(vehicleListType === 'video' && collapseVehicleStatusToggle) ||
				(vehicleListType === 'vehicle' && collapseVehicleStatusToggle) ||
				(vehicleListType === 'trip' && collapseTripStatusToggle) ||
				(vehicleListType === 'vehicle-allocation-trip' && collapseTripStatusToggle)
			) {
				setVisibleDetailsStyling('translate-x-[20px]');
			} else {
				setVisibleDetailsStyling('translate-x-[442px]');
			}
		}
	}, [selectedVehicle, collapseVehicleStatusToggle, collapseTripStatusToggle, vehicleListType]);

	const {
		isLoading,
		isFetching: vehicleListIsFetching,
		currentData: vehicleListData,
		isUninitialized: vehicleListIsUninitialized,
	} = useGetItineraryvehIdBDateNwStQuery(
		{
			userId: userId,
			vId: accessLabel === 6 ? getNormalOrControllerId(selectedVehicle) : selectedVehicle.vId,
			startDate: getStartEndDate(selectedTrip.departure_date, 'start', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
			endDate: getStartEndDate(selectedTrip.trip_complted_datebysystem, 'end', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
			requestFor: 0,
		},
		{
			skip:
				vehicleItnaryWithPath.patharry.length > 0 ||
				!groupId ||
				!userId ||
				!selectedVehicle.vId ||
				!!dateRangeForDataFetching.startDate ||
				historyReplay.isHistoryReplayMode ||
				(vehicleListType === 'trip' && selectedTrip.sys_service_id === 0) ||
				(vehicleListType === 'vehicle-allocation-trip' && selectedTrip.sys_service_id === 0) ||
				(vehicleListType === 'trip' &&
					moment(new Date(selectedTrip.departure_date)).isValid() &&
					moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year')) ||
				(vehicleListType === 'vehicle-allocation-trip' &&
					moment(new Date(selectedTrip.departure_date)).isValid() &&
					moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year')),
			pollingInterval: 0,
			refetchOnFocus: false,
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
		}
	);

	const vId = accessLabel === 6 ? getNormalOrControllerId(selectedVehicle) : selectedVehicle.vId;

	const { currentData: pathwithDateData, isFetching: pathwithDateIsFetching } = useGetpathwithDateDaignosticQuery(
		{
			vId: vId,
			startDate: getStartEndDate(selectedTrip.departure_date, 'start', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
			endDate: getStartEndDate(selectedTrip.trip_complted_datebysystem, 'end', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
			userId: userId,
		},
		{
			skip:
				!historyReplay.isHistoryReplayMode ||
				vehicleItnaryWithPath.patharry.length > 0 ||
				!groupId ||
				!userId ||
				!selectedVehicle.vId ||
				!!dateRangeForDataFetching.startDate ||
				historyReplay.isHistoryReplayMode ||
				(vehicleListType === 'trip' && selectedTrip.sys_service_id === 0) ||
				(vehicleListType === 'vehicle-allocation-trip' && selectedTrip.sys_service_id === 0) ||
				(vehicleListType === 'trip' &&
					moment(new Date(selectedTrip.departure_date)).isValid() &&
					moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year')) ||
				(vehicleListType === 'vehicle-allocation-trip' &&
					moment(new Date(selectedTrip.departure_date)).isValid() &&
					moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year')),
			pollingInterval: 0,
			refetchOnFocus: false,
			refetchOnMountOrArgChange: false,
			refetchOnReconnect: false,
		}
	);

	const [getPathWithDateDaignostic] = useLazyGetpathwithDateDaignosticQuery();
	const [getVehicleListItinerary] = useLazyGetItineraryvehIdBDateNwStQuery();

	const getPathWithDateDaignosticAndGetVehicleListItinerary = async () => {
		if (createTripOrPlanningTripActive === '') {
			const apmkm = await apmTotalKm({
				startDate: getStartEndDate(selectedTrip.departure_date, 'start', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
				endDate: getStartEndDate(selectedTrip.trip_complted_datebysystem, 'end', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
				userId: Number(userId),
				vehicleId: Number(selectedVehicle.vId),
				parentUser: Number(parentUser),
				dispatch,
			});

			if (
				(vehicleListType === 'trip' && selectedTrip.sys_service_id !== 0) ||
				(vehicleListType === 'vehicle-allocation-trip' && selectedTrip.sys_service_id !== 0) ||
				(selectedVehicle.vId !== 0 && selectedVehicle.prevVehicleSelected !== selectedVehicle.vId) ||
				(vehicleListType === 'trip' &&
					moment(new Date(selectedTrip.departure_date)).isValid() &&
					moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year')) ||
				(vehicleListType === 'vehicle-allocation-trip' &&
					moment(new Date(selectedTrip.departure_date)).isValid() &&
					moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year'))
			) {
				dispatch(setPrevVehicleSelected(selectedVehicle.vId));

				getVehicleListItinerary({
					userId: userId,
					vId: accessLabel === 6 ? getNormalOrControllerId(selectedVehicle) : selectedVehicle.vId,
					startDate: getStartEndDate(selectedTrip.departure_date, 'start', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
					endDate: getStartEndDate(selectedTrip.trip_complted_datebysystem, 'end', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
					requestFor: 0,
				}).then(({ data: vehicleListDataArgs }) => {
					updateVehicleItnaryWithPath({
						vehicleListDataArgs: vehicleListDataArgs,
						pathwithDateDataArgs: undefined,
						vehicleItnaryWithPath: {
							...vehicleItnaryWithPath,
							totalDistance: Number(userId) === 4607 || Number(parentUser) === 4607 ? apmkm : vehicleItnaryWithPath.totalDistance,
						},
						dispatch,
						userId,
						parentUser,
						extra,
					});

					getPathWithDateDaignostic({
						vId: accessLabel === 6 ? getNormalOrControllerId(selectedVehicle) : selectedVehicle.vId,
						startDate: getStartEndDate(selectedTrip.departure_date, 'start', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
						endDate: getStartEndDate(selectedTrip.trip_complted_datebysystem, 'end', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
						userId: userId,
					}).then(({ data: pathwithDateDataArgs }) => {
						updateVehicleItnaryWithPath({
							vehicleListDataArgs: vehicleListDataArgs,
							pathwithDateDataArgs: {
								...pathwithDateDataArgs,
								totalDistance:
									Number(userId) === 4607 || Number(parentUser) === 4607 ? apmkm : pathwithDateDataArgs ? pathwithDateDataArgs.totalDistance : '',
								message: pathwithDateDataArgs ? pathwithDateDataArgs.message : '',
								success: pathwithDateDataArgs ? pathwithDateDataArgs.success : false,
								data: pathwithDateDataArgs ? pathwithDateDataArgs.data : [],
								fromTime: pathwithDateDataArgs ? pathwithDateDataArgs.fromTime : '',
								toTime: pathwithDateDataArgs ? pathwithDateDataArgs.toTime : '',
								stoppageTime: pathwithDateDataArgs ? pathwithDateDataArgs.stoppageTime : '',
								runningTime: pathwithDateDataArgs ? pathwithDateDataArgs.runningTime : '',
								calculatedTotalDistance: pathwithDateDataArgs ? pathwithDateDataArgs.calculatedTotalDistance : 0,
								totalRunningDistanceKM: pathwithDateDataArgs ? pathwithDateDataArgs.totalRunningDistanceKM : '',
								totalNogps: pathwithDateDataArgs ? pathwithDateDataArgs.totalNogps : 0,
								totalIdledistance: pathwithDateDataArgs ? pathwithDateDataArgs.totalIdledistance : 0,
								avgSpeedKMH: pathwithDateDataArgs ? pathwithDateDataArgs.avgSpeedKMH : 0,
								totalStoppage: pathwithDateDataArgs ? pathwithDateDataArgs.totalStoppage : 0,
								patharry: pathwithDateDataArgs ? pathwithDateDataArgs.patharry : [],
								vehicleId: pathwithDateDataArgs ? pathwithDateDataArgs.vehicleId : 0,
							},
							vehicleItnaryWithPath: {
								...vehicleItnaryWithPath,
								totalDistance: Number(userId) === 4607 || Number(parentUser) === 4607 ? apmkm : vehicleItnaryWithPath.totalDistance,
							},
							dispatch,
							userId,
							parentUser,
							extra,
						});
					});
				});
			}
		}
	};

	useEffect(() => {
		if (!dateRangeForDataFetching.startDate && vehicleListType !== 'trip' && historyReplay.isHistoryReplayMode === true) {
			getPathWithDateDaignosticAndGetVehicleListItinerary();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVehicle, historyReplay.isHistoryReplayMode]);

	useEffect(() => {
		if (
			(vehicleListType === 'trip' && moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year') === false) ||
			(vehicleListType === 'vehicle-allocation-trip' && moment(new Date(selectedTrip.departure_date)).isBefore([2024, 10, 21], 'year') === false)
		) {
			getPathWithDateDaignosticAndGetVehicleListItinerary();
		} else if (vehicleListType === 'trip' || vehicleListType === 'vehicle-allocation-trip') {
			dispatch(setLiveVehicleItnaryWithPath(liveVehicleInitialState));
			dispatch(setVehicleItnaryWithPath(vehicleItnaryWithPathInitialState));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTrip]);

	useEffect(() => {
		apmTotalKm({
			startDate: getStartEndDate(selectedTrip.departure_date, 'start', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
			endDate: getStartEndDate(selectedTrip.trip_complted_datebysystem, 'end', 'YYYY-MM-DD HH:mm', 'date', vehicleListType),
			userId: Number(userId),
			vehicleId: Number(selectedVehicle.vId),
			parentUser: Number(parentUser),
			dispatch,
		}).then((apmkm) => {
			updateVehicleItnaryWithPath({
				vehicleListDataArgs: vehicleListData,
				pathwithDateDataArgs: {
					...pathwithDateData,
					totalDistance: Number(userId) === 4607 || Number(parentUser) === 4607 ? apmkm : pathwithDateData ? pathwithDateData.totalDistance : '',
					message: pathwithDateData ? pathwithDateData.message : '',
					success: pathwithDateData ? pathwithDateData.success : false,
					data: pathwithDateData ? pathwithDateData.data : [],
					fromTime: pathwithDateData ? pathwithDateData.fromTime : '',
					toTime: pathwithDateData ? pathwithDateData.toTime : '',
					stoppageTime: pathwithDateData ? pathwithDateData.stoppageTime : '',
					runningTime: pathwithDateData ? pathwithDateData.runningTime : '',
					calculatedTotalDistance: pathwithDateData ? pathwithDateData.calculatedTotalDistance : 0,
					totalRunningDistanceKM: pathwithDateData ? pathwithDateData.totalRunningDistanceKM : '',
					totalNogps: pathwithDateData ? pathwithDateData.totalNogps : 0,
					totalIdledistance: pathwithDateData ? pathwithDateData.totalIdledistance : 0,
					avgSpeedKMH: pathwithDateData ? pathwithDateData.avgSpeedKMH : 0,
					totalStoppage: pathwithDateData ? pathwithDateData.totalStoppage : 0,
					patharry: pathwithDateData ? pathwithDateData.patharry : [],
					vehicleId: pathwithDateData ? pathwithDateData.vehicleId : 0,
				},
				vehicleItnaryWithPath: {
					...vehicleItnaryWithPath,
					totalDistance: Number(userId) === 4607 || Number(parentUser) === 4607 ? apmkm : vehicleItnaryWithPath.totalDistance,
				},
				dispatch,
				userId,
				parentUser,
				extra,
			});
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vehicleListIsFetching, pathwithDateIsFetching]);

	const isGetVehicleCurrentLocationLoading = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((query) => query && query.endpointName === 'getVehicleCurrentLocation' && query.status === 'pending')
	);

	useEffect(() => {
		if (!isGetVehicleCurrentLocationLoading) {
			dispatch(setIsVehicleDetailsCollapsed(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGetVehicleCurrentLocationLoading]);

	const isDiagnosticDataPending = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((query) => query && query.endpointName === 'getpathwithDateDaignostic' && query.status === 'pending')
	);

	useEffect(() => {
		setVehicleDetailsUpdateTime(moment(new Date()).format('Do MMM, YYYY HH:mm:ss'));
	}, [isDiagnosticDataPending]);

	return (
		<div
			className={`ml-2 absolute py-[22px] z-20 ${visibleDetailsStyling} min-w-[450px] w-[450px] bg-neutral-green h-[calc(100vh-60px)] transition-transform duration-300`}
		>
			<div className='flex items-start justify-between px-5'>
				<div className='mb-4 flex items-center justify-between gap-3'>
					<VehicleDetailsSelect selectedStyles={selectedStyles} type='' />

					<VehicleDetailsDownloadButton />
					<Tooltip title={'Expand Reports'} mouseEnterDelay={1}>
						<Image
							src={expandReports}
							alt='expand report icon'
							width='25'
							height='25'
							className='mb-1 cursor-pointer hover:opacity-80 transition-opacity duration-300'
							onClick={() => {
								reportsModalState.setIsReportsExpanded(true);
								reportsModalState.setSelectedView('Table');
							}}
						/>
					</Tooltip>
					<Tooltip title={'Proximity Locations'} mouseEnterDelay={1}>
						<PlacesDropdown />
					</Tooltip>
				</div>
				<Tooltip title='Close' placement='right' mouseEnterDelay={1}>
					<div
						className='mt-1 pr-1'
						onClick={() => {
							dispatch(setIsVehicleDetailsCollapsed(true));
							dispatch(trackingDashboard.util.invalidateTags(['Vehicles-List-By-Status']));
							setTimeout(() => dispatch(setIsVehicleDetailsCollapsed(false)), 1);
							dispatch(removeSelectedVehicle());
							dispatch(setIsGetNearbyVehiclesActive(false));
							if (selectedDashboardVehicle.length > 0) {
								dispatch(
									setAllMarkers(
										markers.map((marker) =>
											selectedDashboardVehicle.find((selectedDashboardVehicle) => selectedDashboardVehicle.vehicleData.vId === marker.vId)
												? { ...marker, visibility: true }
												: { ...marker, visibility: false }
										)
									)
								);
							} else {
								dispatch(setAllMarkers(markers.map((marker) => ({ ...marker, visibility: true }))));
							}
							// trip system state update
							dispatch(setSelectedVehicleBySelectElement(initialSelectedVehicleState));
							dispatch(setCreateTripOrTripPlanningActive({ type: '' }));
						}}
					>
						<CloseOutlined className='cursor-pointer' />
					</div>
				</Tooltip>
			</div>

			{(isLoading || vehicleListIsFetching) && vehicleListIsUninitialized ? (
				<div className='px-5'>
					<Skeleton active />
				</div>
			) : (
				<>
					<div className='px-5'>
						{vehicleListType === 'trip' || vehicleListType === 'vehicle-allocation-trip' ? (
							<div className='w-[calc(100%-4px)] ml-0.5 mt-2 mb-[18px] rounded-md p-2 h-[38px] text-base bg-white'>
								{selectedTrip.sys_service_id ? (
									<div className='flex justify-between px-2'>
										<p>{getStartEndDate(selectedTrip.departure_date, 'start', 'Do MMM, YYYY HH:mm', 'date', vehicleListType)}</p> -{' '}
										<p>{getStartEndDate(selectedTrip.trip_complted_datebysystem, 'end', ' Do MMM, YYYY HH:mm', 'not touched', vehicleListType)}</p>
									</div>
								) : (
									<div className='flex justify-between px-2 animate-pulse h-[38px] w-full bg-neutral-200'></div>
								)}
							</div>
						) : (
							<CustomRangePicker />
						)}
					</div>
					<VehicleDateOverview
						travelTime={vehicleItnaryWithPath.runningTime || '0'}
						stoppedTime={vehicleItnaryWithPath.stoppageTime || '0'}
						distance={vehicleItnaryWithPath.totalDistance || '0'}
					/>

					<div className='px-6 pb-4 pt-1'>
						<div className='flex items-center'>
							<Image src={live} width={40} height={40} alt='Live gif' />
							<Tooltip
								title={
									accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'GPS' && selectedVehicle.GPSInfo.gps_fix === 1
										? selectedVehicle.GPSInfo.addr?.replaceAll('_', ' ')
										: accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'GPS' && selectedVehicle.GPSInfo.gps_fix !== 1
										? 'No GPS Fix'
										: accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'ELOCK' && selectedVehicle.GPSInfo.gps_fix === 1
										? selectedVehicle.ELOCKInfo.addr?.replaceAll('_', ' ')
										: accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'ELOCK' && selectedVehicle.GPSInfo.gps_fix !== 1
										? 'No GPS Fix'
										: selectedVehicle.gpsDtl.latLngDtl.addr?.replaceAll('_', ' ')
								}
								mouseEnterDelay={1}
							>
								<div className=' cursor-pointer font-semibold text-base'>
									{accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'GPS' && selectedVehicle.GPSInfo.gps_fix === 1
										? selectedVehicle.GPSInfo.addr?.replaceAll('_', ' ').slice(0, 40)
										: accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'GPS' && selectedVehicle.GPSInfo.gps_fix !== 1
										? 'No GPS Fix'
										: accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'ELOCK' && selectedVehicle.GPSInfo.gps_fix === 1
										? selectedVehicle.ELOCKInfo.addr?.replaceAll('_', ' ').slice(0, 40)
										: accessLabel === 6 && getLatestGPSTime(selectedVehicle) === 'ELOCK' && selectedVehicle.GPSInfo.gps_fix !== 1
										? 'No GPS Fix'
										: selectedVehicle.gpsDtl.latLngDtl.addr?.replaceAll('_', ' ').slice(0, 40)}
									{selectedVehicle.gpsDtl.latLngDtl.addr?.length > 40 ? '...' : ''}
								</div>
							</Tooltip>
						</div>
						<div className='ml-10 -mt-2 text-sm  text-neutral-500'>Updated At: {vehicleDetailsUpdateTime}</div>
					</div>

					<hr />

					<div className='px-5 mt-2'>
						<VehicleHistoryTabs data={vehicleItnaryWithPath} view='VehicleDetails' />
					</div>
				</>
			)}
		</div>
	);
};
