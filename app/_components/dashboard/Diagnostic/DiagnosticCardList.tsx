'use client';

import { RootState } from '@/app/_globalRedux/store';
import { Card, Skeleton, TableColumnsType, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import markerIcon from '@/public/assets/svgs/common/marker-icon.svg';
import pathIcon from '@/public/assets/svgs/trip-system/path.svg';
import Image from 'next/image';
import { useContext, useEffect, useMemo } from 'react';
import { CustomTable } from '../../common';
import { VehicleItnaryWithPath } from '@/app/_globalRedux/services/types/getItnaryWithMapResponse';
import { setPreviousDateRangeAsSelectedDateRange } from '@/app/_globalRedux/dashboard/selectedVehicleCustomRangeSlice';
import { setCenterOfMap, setOpenStoppageIndex, setZoomNo } from '@/app/_globalRedux/dashboard/mapSlice';
import convertMinutesToHoursString from '@/app/helpers/convertMinutesToHoursString';
import { VehicleDetailsContext } from '../View';

const DiagnosticCardList = ({ view }: { view?: 'VehicleAllocationReport' | '' }) => {
	const dispatch = useDispatch();
	const { reportsModalState } = useContext(VehicleDetailsContext);
	const { selectedView } = reportsModalState;
	const vehicleItnaryWithPath = useSelector((state: RootState) => state.vehicleItnaryWithPath);
	const { openStoppageIndex } = useSelector((state: RootState) => state.map);
	const { type: vehicleListType } = useSelector((state: RootState) => state.isVehicleStatusOrTripStatusActive);
	const { extra } = useSelector((state: RootState) => state.auth);
	const isGetPathWithDateDiagnosticLoading = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((query) => query && query.endpointName === 'getpathwithDateDaignostic' && query.status === 'pending')
	);
	const isApmTotalKmLoading = useSelector((state: RootState) => state.isApmTotalKmmLoading);

	useEffect(() => {
		if (!isGetPathWithDateDiagnosticLoading) {
			dispatch(setPreviousDateRangeAsSelectedDateRange());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGetPathWithDateDiagnosticLoading]);

	const openStoppage = ({ lat, lng, index }: { lat: number; lng: number; index: number }) => {
		let center = { lat, lng };
		dispatch(setCenterOfMap(center));
		dispatch(setZoomNo(14));
		dispatch(setOpenStoppageIndex(index - 1));
	};

	const cardView = useMemo(() => {
		let stoppagesCount = vehicleItnaryWithPath.diagnosticData.reduce((acc, curr) => (curr.mode === 'Idle' ? acc + 1 : acc), 1);
		return (
			<div
				className={`${
					view === 'VehicleAllocationReport'
						? 'h-[calc(100vh-200px)]'
						: reportsModalState.isReportsExpanded
						? 'h-[calc(100vh-300px)]'
						: vehicleListType === 'trip' || vehicleListType === 'vehicle-allocation-trip'
						? 'h-[calc(100vh-440px)]'
						: 'h-[calc(100vh-480px)]'
				} w-full overflow-x-scroll scrollbar-thumb-thumb-green scrollbar-w-2 scrollbar-thumb-rounded-md scrollbar flex flex-col gap-2.5 `}
			>
				{isGetPathWithDateDiagnosticLoading || isApmTotalKmLoading ? (
					<Skeleton active className='mt-5' />
				) : vehicleItnaryWithPath.diagnosticData.length > 1 ||
				  (vehicleItnaryWithPath.diagnosticData.length > 0 && Number(vehicleItnaryWithPath.diagnosticData[0].totalTimeInMIN) > 0) ? (
					vehicleItnaryWithPath.diagnosticData.map((vehicle, index) => {
						vehicle.mode === 'Idle' ? stoppagesCount-- : null;

						return (
							<div
								data-index={stoppagesCount}
								className={`border-[1.5px] ${
									openStoppageIndex + 1 === stoppagesCount && vehicle.mode === 'Idle' ? 'border-custom-pink' : ''
								} shadow-xl shadow-s-light rounded-md`}
								key={index}
								onClick={(e) => {
									vehicle.mode === 'Idle'
										? openStoppage({
												lat: vehicle.fromLat,
												lng: vehicle.fromLng,
												index: Number(e.currentTarget.getAttribute('data-index')) || 0,
										  })
										: null;
								}}
							>
								<Card className='px-2'>
									<div className='flex items-center justify-between gap-2 text-xl font-semibold mb-2'>
										<div className={`flex items-center gap-[2px] text-sm ${vehicle.mode === 'Running' ? 'text-primary-green' : 'text-custom-pink'}`}>
											{vehicle.mode === 'Idle' ? (
												<div className={`min-w-6 h-6 mr-2 bg-custom-pink rounded-full flex items-center justify-center text-white p-1 text-xs`}>
													<p className='font-semibold'>{vehicle.mode === 'Idle' ? stoppagesCount : null}</p>
												</div>
											) : null}
											<p>{vehicle.mode === 'Running' ? 'Ran for:' : 'Stopped for:'}</p>
											<p>
												<span>{convertMinutesToHoursString(vehicle.totalTimeInMIN)}</span>
											</p>
										</div>
										<p className='text-sm text-neutral-600'>
											<span>{vehicle.mode === 'Running' ? vehicle.totalDistance : ''}</span>
										</p>
									</div>
									<hr className='mb-4' />
									<div className='flex items-center gap-2'>
										<div className='font-semibold text-gray-600 w-6'>
											<Tooltip title='Start Location' placement='left' mouseEnterDelay={1}>
												<div className='w-5 h-5 border-[1.5px] relative left-[2px] border-black rounded-full'></div>
											</Tooltip>
										</div>
										<div>
											<div>
												<p className='font-semibold text-primary-green text-xs'>Start Location:</p>{' '}
											</div>
											<Tooltip title={`${vehicle.startLocation?.replaceAll('_', ' ')}`} placement='right' mouseEnterDelay={1}>
												<p className='text-sm truncate w-[310px]'>{vehicle.startLocation?.replaceAll('_', ' ')}</p>
											</Tooltip>
										</div>
									</div>
									<div className='flex items-center gap-2  mb-2'>
										<div className='font-semibold text-gray-600 h-6'>
											<Tooltip title='Start Location' placement='left' mouseEnterDelay={1}>
												<Image src={pathIcon} alt='current location' width={24} height={30} className='h-[50px] relative bottom-[9px]' />
											</Tooltip>
										</div>
										<div className='-mt-1 flex items-center gap-2'>
											<p className='text-sm text-neutral-600'>
												<span className='font-semibold text-xs'>{vehicle.fromTime}</span>
											</p>
										</div>
									</div>

									<div className='flex items-center gap-2'>
										<div className='font-semibold text-gray-600 w-6'>
											<Tooltip title='End Location' placement='left' mouseEnterDelay={1}>
												<Image src={markerIcon} alt='current location' width={24} height={30} />
											</Tooltip>
										</div>
										<div>
											<p className='font-semibold text-primary-red text-xs'>End Location:</p>
											<Tooltip title={`${vehicle.endLocation?.replaceAll('_', ' ')}`} placement='right' mouseEnterDelay={1}>
												<p className='text-sm truncate w-[310px]'>{vehicle.endLocation?.replaceAll('_', ' ')}</p>
											</Tooltip>
										</div>
									</div>
									<div className='flex items-center gap-2 -mt-1'>
										<div className='font-semibold text-gray-600 h-6 w-[24px]'></div>
										<p className='text-sm text-neutral-600'>
											<span className='font-semibold text-xs'>{vehicle.toTime}</span>
										</p>{' '}
									</div>
								</Card>
							</div>
						);
					})
				) : (
					<p className='px-5 font-semibold text-gray-700 text-sm mt-5'>No data available</p>
				)}
			</div>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vehicleItnaryWithPath, openStoppageIndex, selectedView, isGetPathWithDateDiagnosticLoading, reportsModalState.isReportsExpanded]);

	const columns: TableColumnsType<VehicleItnaryWithPath['diagnosticData'][number]> = [
		{
			title: 'Start Time',
			dataIndex: 'fromTime',
			key: 'fromTime',
			className: 'text-xs',
		},
		{
			title: 'End Time',
			dataIndex: 'toTime',
			key: 'toTime',
			className: 'text-xs',
		},
		{
			title: 'Start Location',
			dataIndex: 'startLocation',
			key: 'startLocation',
			render: (value) => (
				<Tooltip title={value ? value?.replaceAll('_', ' ') : ''} mouseEnterDelay={1} className='cursor-pointer'>
					{value ? value?.replaceAll('_', ' ').slice(0, 40) + (value.length > 40 ? '...' : '') : ''}
				</Tooltip>
			),
			className: 'text-xs',
		},
		{
			title: 'End Location',
			dataIndex: 'endLocation',
			key: 'endLocation',
			render: (value) => (
				<Tooltip title={value ? value?.replaceAll('_', ' ') : ''} mouseEnterDelay={1} className='cursor-pointer'>
					{value ? value?.replaceAll('_', ' ').slice(0, 40) + (value.length > 40 ? '...' : '') : ''}
				</Tooltip>
			),
			className: 'text-xs',
		},
		{
			title: 'Mode',
			dataIndex: 'mode',
			key: 'mode',
			className: 'text-xs',
		},
		{
			title: 'Total Time',
			dataIndex: 'totalTimeInMIN',
			key: 'totalTimeInMIN',
			render: (text) => <>{convertMinutesToHoursString(text)}</>,
			className: 'text-xs',
		},
		{
			title: 'Total Distance',
			dataIndex: 'totalDistance',
			key: 'totalDistance',
			className: 'text-xs',
		},
	];
	const totalDistance =
		isNaN(Number(extra)) || Number(extra) === 0
			? Number(vehicleItnaryWithPath.totalDistance.split(' ')[0])
			: Number(vehicleItnaryWithPath.totalDistance.split(' ')[0]) + (Number(vehicleItnaryWithPath.totalDistance.split(' ')[0]) * Number(extra)) / 100;

	const tableView = useMemo(() => {
		return (
			<CustomTable
				data={vehicleItnaryWithPath.diagnosticData}
				type=''
				columns={columns}
				scroll_y='calc(100vh - 350px)'
				Footer={
					<span className='h-0 flex justify-end items-center font-semibold text-sm italic text-gray-800'>
						<p>Total = {totalDistance?.toFixed(0)} KM</p>
					</span>
				}
			/>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vehicleItnaryWithPath, selectedView, isGetPathWithDateDiagnosticLoading, reportsModalState.isReportsExpanded]);

	return selectedView === 'Table' ? tableView : cardView;
};

export default DiagnosticCardList;
