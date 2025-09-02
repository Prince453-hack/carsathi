'use client';

import { GetItnaryWithMapResponse } from '@/app/_globalRedux/services/types';
import { VehicleHistoryCard } from './VehicleHistoryCard';
import { nanoid } from 'nanoid';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import { Skeleton, TableColumnsType, Tooltip } from 'antd';
import { setCenterOfMap, setOpenStoppageIndex, setZoomNo } from '@/app/_globalRedux/dashboard/mapSlice';
import { setSelectedVehicleHistoryTab } from '@/app/_globalRedux/dashboard/selectedVehicleSlice';
import { VehicleAlertCards } from './VehicleAlertCards';
import { useContext, useEffect, useState, useMemo, Suspense } from 'react';
import { setHistoryReplayPlayPause, stopHistoryReplayInterval } from '@/app/_globalRedux/dashboard/historyReplaySlice';
import { CustomTable } from '../common';
import { VehicleItinaryData } from '@/app/_globalRedux/services/types/getItnaryWithMapResponse';
import convertMinutesToHoursString from '@/app/helpers/convertMinutesToHoursString';
import { VehicleDetailsContext } from './View';
import { TripDetail } from './trip/TripDetail';
import { VehicleItnaryWithPath } from '@/app/_globalRedux/services/types/getItnaryWithMapResponse';

export const VehicleHistoryCardListDiagnostic = ({
	type,
	data,
	view,
}: {
	type: 'Trip' | 'All' | 'Running' | 'Stoppages' | 'Alerts' | undefined;
	data: VehicleItnaryWithPath;
	view: 'VehicleDetails' | 'ExpandedReportsModal' | 'VehicleAllocationReport';
}) => {
	const dispatch = useDispatch();
	const { reportsModalState } = useContext(VehicleDetailsContext);
	const { selectedView } = reportsModalState;

	const historyReplay = useSelector((state: RootState) => state.historyReplay);
	const [historySpecificEventRunning, setHistorySpecificEventRunning] = useState(false);
	const vehicleItnaryWithPath = useSelector((state: RootState) => state.vehicleItnaryWithPath);
	const { extra } = useSelector((state: RootState) => state.auth);

	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const customRange = useSelector((state: RootState) => state.customRange);
	const { type: vehicleListType } = useSelector((state: RootState) => state.isVehicleStatusOrTripStatusActive);

	let manualPathIndex = 0;
	if (vehicleItnaryWithPath.diagnosticData && vehicleItnaryWithPath.diagnosticData.length >= 2) {
		manualPathIndex = Math.floor((historyReplay.manualPath / 100) * (vehicleItnaryWithPath.diagnosticData.length - 2));
	}

	const isgetItineraryvehIdBDateNwStLoading = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((query) => query && query.endpointName === 'getpathwithDateDaignostic' && query.status === 'pending')
	);
	const isApmTotalKmLoading = useSelector((state: RootState) => state.isApmTotalKmmLoading);

	const vehicleStatusesWithId = useMemo(() => {
		return data.diagnosticData
			.map((vehicleStatus) => ({ ...vehicleStatus, id: nanoid() }))
			.filter((vehicleStatus) =>
				type === 'All'
					? vehicleStatus
					: type === 'Running' && vehicleStatus.mode === 'Running'
					? vehicleStatus
					: type === 'Stoppages' && vehicleStatus.mode === 'Idle'
					? vehicleStatus
					: type === 'Alerts'
					? vehicleStatus
					: null
			);
	}, [data, type]);

	useEffect(() => {
		if (historyReplay.isHistoryReplayMode) {
			if (historyReplay.isHistoryReplayPlaying) {
				if (historyReplay.currentPathArrayIndex && historySpecificEventRunning) {
					let temp = vehicleStatusesWithId.find(
						(vehicle) => vehicle.fromTime === vehicleItnaryWithPath.diagnosticData[historyReplay.currentPathArrayIndex + manualPathIndex]?.fromTime
					);

					if (temp && temp.mode === 'Idle') {
						dispatch(setHistoryReplayPlayPause(false));
						dispatch(stopHistoryReplayInterval());
						setHistorySpecificEventRunning(false);
					}
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [historyReplay, historySpecificEventRunning]);

	let stoppagesCount = useMemo(() => {
		return data.diagnosticData.reduce((acc, curr) => (curr.mode === 'Idle' ? acc + 1 : acc), 0);
	}, [data]);

	const openStoppage = ({ lat, lng, index }: { lat: number; lng: number; index: number }) => {
		let center = { lat, lng };
		dispatch(setCenterOfMap(center));
		dispatch(setZoomNo(14));
		dispatch(setOpenStoppageIndex(index));
	};

	const cardView = useMemo(() => {
		return (
			<div
				className={`${
					view !== 'VehicleAllocationReport'
						? reportsModalState.isReportsExpanded
							? 'h-[calc(100vh-300px)]'
							: vehicleListType === 'trip' || vehicleListType === 'vehicle-allocation-trip'
							? 'h-[calc(100vh-440px)]'
							: 'h-[calc(100vh-480px)]'
						: 'h-[calc(100vh-200px)]'
				} w-full overflow-x-scroll scrollbar-thumb-thumb-green scrollbar-w-2 scrollbar-thumb-rounded-md scrollbar flex flex-col gap-2.5 `}
				onClick={() => type && dispatch(setSelectedVehicleHistoryTab(type))}
			>
				{isgetItineraryvehIdBDateNwStLoading || isApmTotalKmLoading ? (
					<div className='px-5'>
						<Skeleton active className='mt-5' />
					</div>
				) : type !== 'Alerts' && vehicleStatusesWithId.length && vehicleItnaryWithPath.message !== 'Something wrong happend' ? (
					vehicleStatusesWithId.map((vehicleStatus, index) => {
						// eslint-disable-next-line react-hooks/exhaustive-deps
						stoppagesCount = vehicleStatus.mode === 'Idle' && stoppagesCount >= 1 ? stoppagesCount - 1 : stoppagesCount;

						return (
							<div
								data-index={stoppagesCount}
								key={index}
								onClick={(e) =>
									vehicleStatus.mode === 'Idle'
										? openStoppage({
												lat: vehicleStatus.fromLat,
												lng: vehicleStatus.fromLng,
												index: Number(e.currentTarget.getAttribute('data-index')) || 0,
										  })
										: null
								}
							>
								<VehicleHistoryCard
									index={index}
									type={vehicleStatus.mode}
									vehicleData={vehicleStatus}
									setHistorySpecificEventRunning={setHistorySpecificEventRunning}
									stoppagesCount={stoppagesCount}
									historySpecificEventRunning={historySpecificEventRunning}
								/>
							</div>
						);
					})
				) : type === 'Trip' ? (
					<TripDetail />
				) : type !== 'Alerts' && (!vehicleStatusesWithId.length || vehicleItnaryWithPath.message === 'Something wrong happend') ? (
					<p className='px-5 font-semibold text-gray-700 text-sm mt-5'>No data available</p>
				) : (
					<VehicleAlertCards />
				)}
			</div>
		);
	}, [
		vehicleStatusesWithId,
		isgetItineraryvehIdBDateNwStLoading,
		reportsModalState.isReportsExpanded,
		stoppagesCount,
		type,
		dispatch,
		openStoppage,
		customRange,
	]);

	const tableView = useMemo(() => {
		interface VehicleItinaryDataWithId extends VehicleItinaryData {
			id: string;
		}
		const columns: TableColumnsType<VehicleItinaryDataWithId> = [
			{
				title: 'Vehicle',
				dataIndex: 'vehicle',
				key: 'vehicle',
				render: () => selectedVehicle.vehReg,
				className: 'text-xs',
			},
			{
				title: 'Mode',
				dataIndex: 'mode',
				key: 'mode',
				className: 'text-xs',
			},
			{
				title: 'Start Time',
				dataIndex: 'fromTime',
				key: 'from-time',
				className: 'text-xs',
			},
			{
				title: 'Start Location',
				dataIndex: 'startLocation',
				key: 'from-location',
				width: '180px',
				render: (value) => (
					<Tooltip title={value ? value?.replaceAll('_', ' ') : ''} mouseEnterDelay={1} className='cursor-pointer'>
						{value ? value?.replaceAll('_', ' ').slice(0, 40) + (value.length > 40 ? '...' : '') : ''}
					</Tooltip>
				),
				className: 'text-xs',
			},
			{
				title: 'End Time',
				dataIndex: 'toTime',
				key: 'to-time',
				className: 'text-xs',
			},
			{
				title: 'End Location',
				dataIndex: 'endLocation',
				key: 'to-location',
				width: '180px',
				render: (value) => (
					<Tooltip title={value ? value?.replaceAll('_', ' ') : ''} mouseEnterDelay={1} className='cursor-pointer'>
						{value ? value?.replaceAll('_', ' ').slice(0, 40) + (value.length > 40 ? '...' : '') : ''}
					</Tooltip>
				),
				className: 'text-xs',
			},
			{
				title: 'Duration',
				dataIndex: 'totalTimeInMIN',
				render: (value) => convertMinutesToHoursString(value),
				key: 'duration',
				className: 'text-xs',
			},
			{
				title: 'Distance',
				dataIndex: 'totalDistance',
				key: 'distance',
				className: 'text-xs',
			},
		];

		const totalDistance =
			isNaN(Number(extra)) || Number(extra) == 0
				? Number(vehicleItnaryWithPath.totalDistance.split(' ')[0])
				: Number(vehicleItnaryWithPath.totalDistance.split(' ')[0]) +
				  (Number(vehicleItnaryWithPath.totalDistance.split(' ')[0]) * Number(extra)) / 100;
		return (
			<div
				className={` w-full overflow-x-scroll scrollbar-thumb-thumb-green scrollbar-w-2 scrollbar-thumb-rounded-md scrollbar flex flex-col gap-2.5 `}
				onClick={() => type && dispatch(setSelectedVehicleHistoryTab(type))}
			>
				{!vehicleStatusesWithId.length || isgetItineraryvehIdBDateNwStLoading ? (
					<div className='px-5'>
						<Skeleton active className='mt-5' />
					</div>
				) : type === 'Trip' ? (
					<TripDetail />
				) : type !== 'Alerts' ? (
					<CustomTable
						data={vehicleStatusesWithId}
						type={type || ''}
						columns={columns}
						scroll_y='calc(100vh - 350px)'
						Footer={
							<span className='h-0 flex justify-end items-center font-semibold text-sm italic text-gray-800'>
								<p>Total = {totalDistance?.toFixed(0)}</p>
							</span>
						}
					/>
				) : (
					<VehicleAlertCards />
				)}
			</div>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vehicleStatusesWithId, isgetItineraryvehIdBDateNwStLoading, type, dispatch, selectedVehicle.vehReg]);

	if (view === 'VehicleDetails') {
		return cardView;
	} else {
		return selectedView === 'Column' ? cardView : tableView;
	}
};
