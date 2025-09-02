'use client';

import { Card, Tooltip } from 'antd';
import Image from 'next/image';
import markerIcon from '@/public/assets/svgs/common/marker-icon.svg';
import pathIcon from '@/public/assets/svgs/trip-system/path.svg';
import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';

import { setOpenStoppageIndex } from '@/app/_globalRedux/dashboard/mapSlice';
import { setSelectedVehicleCustomRange } from '@/app/_globalRedux/dashboard/selectedVehicleCustomRangeSlice';
import {
	initialSelectedVehicleState,
	setNearbyVehicles,
	setSelectedVehicleBySelectElement,
	setSelectedVehicleStatus,
} from '@/app/_globalRedux/dashboard/selectedVehicleSlice';
import { setRadiusInKilometers } from '@/app/_globalRedux/dashboard/nearbyVehicleSlice';
import checkIfIgnitionOnOrOff from '@/app/helpers/checkIfIgnitionOnOrOff';
import { setCreateTripOrTripPlanningActive } from '@/app/_globalRedux/dashboard/createTripOrTripPlanningActive';
import { MouseEvent, useMemo, useState } from 'react';
import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons';

export const TripVehicleOverviewCard = ({ vehicleData }: { vehicleData: VehicleData }) => {
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const auth = useSelector((state: RootState) => state.auth);

	const dispatch = useDispatch();

	const [overviewSliderStyle, setOverviewSliderStyle] = useState(0);

	const activeItemsCount = useMemo(() => {
		let count = 3;

		if (auth.isAc) count++;
		if (auth.isTemp) count++;
		if (auth.isEveVehicle) count++;
		if (auth.isMarketVehicle || auth.isPadlock || auth.isEveVehicle) count++;
		if (auth.isOdometer || auth.isEveVehicle) count++;

		return count;
	}, [auth]);

	const maxSliderValue = useMemo(() => activeItemsCount * 80, [activeItemsCount]);

	const containerWidth = 260;

	const handleRightClick = (e: MouseEvent) => {
		e.stopPropagation();
		setOverviewSliderStyle((prev) => {
			const remainingScrollSpace = maxSliderValue + prev - containerWidth;

			if (remainingScrollSpace > 0) {
				return prev - 100;
			} else {
				return prev;
			}
		});
	};

	const handleLeftClick = (e: MouseEvent) => {
		e.stopPropagation();
		setOverviewSliderStyle((prev) => {
			if (overviewSliderStyle === 0) {
				return prev;
			} else {
				return prev + 100;
			}
		});
	};

	return (
		<div className='relative select-none'>
			<div className='mb-2'>
				<Card
					className={`text-wrap overflow-clip shadow-xl shadow-s-dark   text-sm rounded-3xl cursor-pointer`}
					styles={{
						body: {
							borderRadius: '.5rem',
							border: selectedVehicle.vId === vehicleData.vehicleTrip.sys_service_id ? '1.5px solid #478C83' : '1.5px solid transparent',
						},
					}}
					onClick={() => {
						dispatch(
							setSelectedVehicleCustomRange({
								dateRangeToDisplay: { startDate: '', endDate: '' },
								dateRangeForDataFetching: { startDate: '', endDate: '' },
								customRangeSelected: 'Today',
								previousDateRange: { startDate: '', endDate: '' },
							})
						);
						dispatch(setOpenStoppageIndex(-1));

						dispatch(setNearbyVehicles(undefined));
						dispatch(setRadiusInKilometers(0));

						dispatch(
							setSelectedVehicleStatus({
								...vehicleData,
								searchType: '',
								selectedVehicleHistoryTab: selectedVehicle.selectedVehicleHistoryTab,
								nearbyVehicles: [],
								prevVehicleSelected: selectedVehicle.prevVehicleSelected,
							})
						);

						selectedVehicle.vId === vehicleData.vehicleTrip.sys_service_id
							? (() => {
									// trip system state update
									dispatch(setSelectedVehicleBySelectElement(initialSelectedVehicleState));
									dispatch(setCreateTripOrTripPlanningActive({ type: '' }));
							  })()
							: null;
					}}
				>
					<div className='flex flex-col items-baseline gap-0.5 overflow-hidden'>
						<div className='flex justify-between items-center w-full mb-2'>
							<div>
								<p className='font-extrabold text-base -mt-1'>
									{' '}
									{vehicleData.vehicleTrip.lorry_no} - {vehicleData.vehicleTrip.trip_status_batch || 'Transit'}
								</p>
							</div>
							<div className='flex items-center gap-2 '>
								<div
									className={` px-2 py-1 rounded-md font-bold text-xs ${
										vehicleData.vehicleTrip.delay == 0 ? 'text-primary-green bg-green-100' : 'text-red-700 bg-red-100'
									} mt-1 line-clamp-1`}
								>
									{vehicleData.vehicleTrip.delay} Hours
								</div>
							</div>
						</div>

						<div className='flex items-center gap-2 mb-1'>
							<div className='font-semibold text-gray-600 w-6 '>
								<Tooltip title='Start Location' placement='left' mouseEnterDelay={1}>
									<div className='w-5 h-5 border-[1.5px] relative left-[2px] border-black rounded-full'></div>
								</Tooltip>
							</div>
							<div>
								<p className='font-semibold text-primary-green text-xs'>Start Location:</p>
								<Tooltip title={`${vehicleData.vehicleTrip.station_from_location?.replaceAll('_', ' ')}`} placement='right' mouseEnterDelay={1}>
									<p className='text-sm truncate w-[310px]'>{vehicleData.vehicleTrip.station_from_location?.replaceAll('_', ' ')}</p>
								</Tooltip>
							</div>
						</div>
						<div className='flex items-center gap-2 mb-1'>
							<div className='font-semibold text-gray-600 h-6'>
								<Tooltip title='Start Location' placement='left' mouseEnterDelay={1}>
									<Image src={pathIcon} alt='current location' width={24} height={30} className='h-[50px] relative bottom-[13px]' />
								</Tooltip>
							</div>
							<p className='text-sm text-neutral-600'>
								<span className='font-semibold text-xs'>{vehicleData.vehicleTrip.totaltripkmbygoogle} Km</span>
							</p>
						</div>

						<div className='flex items-center gap-2 mb-1'>
							<div className='font-semibold text-gray-600 w-6'>
								<Tooltip title='End Location' placement='left' mouseEnterDelay={1}>
									<Image src={markerIcon} alt='current location' width={24} height={30} />
								</Tooltip>
							</div>
							<div>
								<p className='font-semibold text-primary-red text-xs'>End Location:</p>
								<Tooltip title={`${vehicleData.vehicleTrip.station_to_location?.replaceAll('_', ' ')}`} placement='right' mouseEnterDelay={1}>
									<p className='text-sm truncate w-[310px]'>{vehicleData.vehicleTrip.station_to_location?.replaceAll('_', ' ')}</p>
								</Tooltip>
							</div>
						</div>

						<div className='flex mt-4 w-full text-center overflow-hidden relative'>
							<div className='flex items-center bg-white h-[84px] mr-2 z-10'>
								<div
									className={`hover:opacity-50 ${
										overviewSliderStyle === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
									}transition-opacity duration-300`}
									onClick={(e) => {
										handleLeftClick(e);
									}}
								>
									<LeftCircleOutlined />
								</div>
							</div>

							<div id='items'>
								<div
									className='flex gap-4 text-center overflow-hidden w-[100%] relative'
									style={{
										transform: `${maxSliderValue <= 260 ? 'translateX(0px)' : `translateX(${overviewSliderStyle}px)`}`,
										transition: 'transform 0.3s ease',
									}}
								>
									<a
										href={`https://www.google.com/maps/search/${vehicleData.gpsDtl.latLngDtl.lat},${vehicleData.gpsDtl.latLngDtl.lng}`}
										target='_blank'
										rel='noreferrer'
										onClick={(e) => {
											e.stopPropagation();
										}}
										className='z-20 relative'
									>
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
											<div className='font-semibold'>
												{vehicleData.gpsDtl.latLngDtl.lat?.toFixed(4)} {vehicleData.gpsDtl.latLngDtl.lng?.toFixed(4)}
											</div>
											<div className='mt-1'>Lat | Lng</div>
										</div>
									</a>

									<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
										<div className='font-semibold'>
											{checkIfIgnitionOnOrOff({
												ignitionState: vehicleData.gpsDtl.ignState.toLowerCase() as 'off' | 'on',
												speed: vehicleData.gpsDtl.speed,
												mode: vehicleData.gpsDtl.mode,
											}) === 'On'
												? vehicleData.gpsDtl.speed
												: 0}{' '}
											km/h
										</div>
										<div className='mt-1'>Speed</div>
									</div>
									<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
										<div className='font-semibold'>
											{checkIfIgnitionOnOrOff({
												ignitionState: vehicleData.gpsDtl.ignState.toLowerCase() as 'off' | 'on',
												speed: vehicleData.gpsDtl.speed,
												mode: vehicleData.gpsDtl.mode,
											})}
										</div>
										<div className='mt-1'>Ignition</div>
									</div>

									{auth.isAc ? (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
											<div className='font-semibold'>{vehicleData.gpsDtl.acState}</div>
											<div className='mt-1'>AC</div>
										</div>
									) : null}

									{auth.isTemp ? (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs min-w-20 h-[84px]'>
											<div className='font-semibold'>{vehicleData.gpsDtl.temperature?.toFixed(2)} °C</div>
											<div className='mt-1'>Temp</div>
										</div>
									) : null}

									{auth.isEveVehicle ? (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
											<div className='font-semibold'>{vehicleData.gpsDtl.tel_rfid} km</div>
											<div className='mt-1'>Distance to Empty</div>
										</div>
									) : null}

									{auth.isMarketVehicle || auth.isPadlock || auth.isEveVehicle ? (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
											<div className='font-semibold'>
												{vehicleData.gpsDtl.main_powervoltage ? vehicleData.gpsDtl.main_powervoltage?.toFixed(2) : '0'}%
											</div>
											<div className='mt-1'>Battery Status</div>
										</div>
									) : null}

									{auth.isOdometer || auth.isEveVehicle ? (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
											<div className='font-semibold'>{vehicleData.gpsDtl.tel_odometer ? vehicleData.gpsDtl.tel_odometer?.toFixed(2) : '0.00'} km</div>
											<div className='mt-1'>Odometer</div>
										</div>
									) : null}
								</div>
							</div>
							<div className='flex items-center bg-white h-[84px] z-10 absolute right-0'>
								<div
									className={`hover:opacity-50 ${
										overviewSliderStyle + maxSliderValue - containerWidth <= 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
									}transition-opacity duration-300`}
									onClick={(e) => {
										handleRightClick(e);
									}}
								>
									<RightCircleOutlined />
								</div>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};
