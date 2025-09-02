'use client';

import { Badge, Card, Tooltip } from 'antd';
import Image from 'next/image';
import markerIcon from '@/public/assets/svgs/common/marker-icon.svg';
import cancelMarkerIcon from '@/public/assets/svgs/common/marker-icon-cancel.svg';
import poiIcon from '@/public/assets/svgs/common/poi-icon.svg';
import driverIcon from '@/public/assets/svgs/common/driver.svg';
import drunkDriverIcon from '@/public/assets/svgs/common/drunk_driver.svg';
import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { useDispatch, useSelector } from 'react-redux';
import { setNearbyVehicles, setSelectedVehicleStatus } from '@/app/_globalRedux/dashboard/selectedVehicleSlice';
import { setSelectedVehicleCustomRange } from '@/app/_globalRedux/dashboard/selectedVehicleCustomRangeSlice';
import { setOpenStoppageIndex } from '@/app/_globalRedux/dashboard/mapSlice';
import { RootState } from '@/app/_globalRedux/store';
import moreIcon from '@/public/assets/svgs/common/more-icon.svg';
import { setOptionsIndex } from '@/app/_globalRedux/dashboard/optionsSlice';
import { Options } from './vehicleOverviewCard/Options';
import { Elock } from './Elock';
import { ShareUrl } from './vehicleOverviewCard/ShareUrl';
import { MapYourVehicle } from './vehicleOverviewCard/MapYourVehicle';
import { DriverInfo } from './vehicleOverviewCard/DriverInfo';
import { setRadiusInKilometers } from '@/app/_globalRedux/dashboard/nearbyVehicleSlice';
import { CreatePOI } from './vehicleOverviewCard/CreatePOI';
import { LeftCircleOutlined, LockOutlined, RightCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { NoGpsKm } from './noGpsKm';
import { PowerDisconnected } from './powerDisconnected';
import checkIfIgnitionOnOrOff from '@/app/helpers/checkIfIgnitionOnOrOff';
import { getAlcoholStatus } from '@/app/helpers/getAlcholStatus';
import { MouseEvent, useMemo, useState } from 'react';
import { getLatestGPSTime } from './utils/getLatestGPSTime';
import { setVehicleItnaryWithPath, vehicleItnaryWithPathInitialState } from '@/app/_globalRedux/dashboard/vehicleItnaryWithPathSlice';
import { setLiveVehicleItnaryWithPath } from '@/app/_globalRedux/dashboard/liveVehicleSlice';
import { trackingDashboard } from '@/app/_globalRedux/services/trackingDashboard';
import { isCheckInAccount } from '@/app/helpers/isCheckInAccount';
import { Padlock } from './Padlock';
import moment from 'moment';
import { setVehicleDetailsStatus } from '@/app/_globalRedux/dashboard/isVehicleStatusOrTripStatusActive';
import { DTC } from './DTC';
import { isKmtAccount } from '@/app/helpers/isKmtAccount';
import { Fuel } from './Fuel';
import { isHourAgo } from './utils/isHourAgo';
import { getGPSOrElock } from './utils/getNormalOrControllerId';

export const VehicleOverviewCard = ({ vehicleData }: { vehicleData: VehicleData }) => {
	const currentModeArr = vehicleData.gpsDtl.mode.split('');
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const auth = useSelector((state: RootState) => state.auth);
	const [overviewSliderStyle, setOverviewSliderStyle] = useState(0);

	const dispatch = useDispatch();

	const checkIfDriverNameAndNumberExists = () => {
		if (
			vehicleData.drivers.driverName &&
			vehicleData.drivers.driverName.trim().toLowerCase() !== 'na' &&
			vehicleData.drivers.phoneNumber &&
			vehicleData.drivers.phoneNumber.trim().toLowerCase() !== 'na'
		) {
			if (vehicleData.drivers.driverName && vehicleData.drivers.phoneNumber) {
				return `${vehicleData.drivers.driverName} / ${vehicleData.drivers.phoneNumber}`;
			} else {
				return 'NA';
			}
		} else {
			return 'NA';
		}
	};

	const activeItemsCount = useMemo(() => {
		let count = isCheckInAccount(Number(auth.userId)) ? 1 : 3;

		if (isCheckInAccount(Number(auth.userId))) count++;
		if (auth.isAc && !isCheckInAccount(Number(auth.userId))) count++;
		if (auth.isTemp) count = count + 3;
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

	const handleVehicleSelect = () => {
		dispatch(trackingDashboard.util.invalidateTags(['Selected-Vehicle-Itinerary']));
		dispatch(trackingDashboard.util.invalidateTags(['Selected-Vehicle-Diagnostic']));
		dispatch(
			setSelectedVehicleCustomRange({
				dateRangeToDisplay: { startDate: '', endDate: '' },
				dateRangeForDataFetching: { startDate: '', endDate: '' },
				customRangeSelected: 'Today',
				previousDateRange: { startDate: '', endDate: '' },
			})
		);
		dispatch(setVehicleItnaryWithPath(vehicleItnaryWithPathInitialState));
		dispatch(setLiveVehicleItnaryWithPath(vehicleItnaryWithPathInitialState));

		dispatch(setOpenStoppageIndex(-1));
		dispatch(
			setSelectedVehicleStatus({
				...vehicleData,
				searchType: '',
				selectedVehicleHistoryTab: selectedVehicle.selectedVehicleHistoryTab,
				nearbyVehicles: [],
				prevVehicleSelected: selectedVehicle.prevVehicleSelected,
			})
		);
		dispatch(setNearbyVehicles(undefined));
		dispatch(setRadiusInKilometers(0));
	};

	return (
		<div className='relative select-none '>
			{isCheckInAccount(Number(auth.userId)) ? null : (
				<>
					<ShareUrl vehicleData={vehicleData} />
					<Options vehicleData={vehicleData} />
					<MapYourVehicle vehicleData={vehicleData} />
					<DriverInfo vehicleData={vehicleData} />
					<CreatePOI vehicleData={vehicleData} type='Vehicle_Based' />
				</>
			)}

			<div>
				{vehicleData.ELOCKInfo &&
				vehicleData.ELOCKInfo.Unhealthy &&
				vehicleData.ELOCKInfo.Unhealthy.data &&
				Array.isArray(vehicleData.ELOCKInfo.Unhealthy.data) &&
				vehicleData.ELOCKInfo.Unhealthy.data[0] == 1 ? (
					<Tooltip title={vehicleData.ELOCKInfo.UnhealthyDesc ?? ''} placement='rightTop'>
						<div>
							<Badge.Ribbon text='Unhealthy' color='#C12F3B' className='z-10' />
						</div>
					</Tooltip>
				) : null}

				<div className='h-2'></div>
				<Card
					className={`text-wrap overflow-clip shadow-xl shadow-s-dark text-sm rounded-3xl cursor-pointer`}
					styles={{
						body: {
							borderRadius: '.5rem',
							border: selectedVehicle.vId === vehicleData.vId ? '1.5px solid #478C83' : '1.5px solid transparent',
							background:
								vehicleData.gpsDtl.immoblizeStatus == 1 && !isKmtAccount(Number(auth.userId), Number(auth.parentUser)) ? '#ECF4D8' : 'white',
						},
					}}
					onClick={() => {
						handleVehicleSelect();
						dispatch(setVehicleDetailsStatus({ type: 'vehicle' }));
					}}
				>
					<div className='flex flex-col items-baseline gap-0.5 overflow-hidden relative'>
						<div className='flex justify-between items-start mb-2 gap-2 w-full'>
							<div>
								<div>
									<p className='font-extrabold text-base break-all -mt-1'> {vehicleData.vehReg}</p>
								</div>

								{vehicleData.gpsDtl.mode !== 'RUNNING' && !isCheckInAccount(Number(auth.userId)) && vehicleData.gpsDtl.speed === 0 ? (
									<p className='text-xs font-semibold mt-1 text-red-600'>
										{vehicleData.gpsDtl.mode === 'NOT WORKING'
											? 'Not Working Hours: '
											: `${currentModeArr[0]}${currentModeArr.slice(1, currentModeArr.length).join('').toLowerCase()} since: `}
										<span className='font-bold'>
											{vehicleData.gpsDtl.mode === 'NOT WORKING' ? `${vehicleData.gpsDtl.notworkingHrs} hrs` : vehicleData.gpsDtl.modeTime}
										</span>
									</p>
								) : null}
								{`${auth.userId}` === '81491' ? (
									<p className='text-xs font-semibold mb-2 mt-0.5'>Odometer Reading: {vehicleData.gpsDtl.tel_odometer} KM</p>
								) : null}

								<p className='text-xs font-medium text-gray-500'>
									Last data received at{' '}
									{auth.accessLabel === 6
										? getGPSOrElock(vehicleData) === 'GPS'
											? vehicleData?.GPSInfo?.gpstime
											: vehicleData?.ELOCKInfo?.gpstime
										: vehicleData?.gpsDtl?.latLngDtl?.gpstime}
								</p>
							</div>

							<div className='flex gap-2 items-center'>
								<div className='flex items-center gap-2'>
									<NoGpsKm data={vehicleData} />
									<PowerDisconnected data={vehicleData} />
									<Elock data={vehicleData} />
									<Padlock data={vehicleData} />
									<DTC data={vehicleData} />
									<Fuel data={vehicleData} />
								</div>

								{vehicleData.gpsDtl.alertCount > 0 ? <WarningOutlined color='' style={{ fontSize: '20px', color: '#FED400' }} /> : null}

								{isCheckInAccount(Number(auth.userId)) ? null : (
									<div
										className='flex items-center'
										onClick={(e) => {
											e.stopPropagation();
											dispatch(setOptionsIndex(vehicleData.vId));
										}}
									>
										<Tooltip title='Options' mouseEnterDelay={2}>
											<div className='p-2 px-3 bg-neutral-green rounded-full '>
												<div className='w-[3px] relative select-none '>
													<Image src={moreIcon} width={24} height={24} alt='more dropdown icon' className='-mb-[2px] rotate-90' />
												</div>
											</div>
										</Tooltip>
									</div>
								)}
							</div>
						</div>
						<div className='flex items-center gap-2 mb-1'>
							<div className='font-semibold text-gray-600 w-6 relative overflow-visible'>
								<Tooltip
									title={
										vehicleData.GPSInfo.gps_fix !== 1 && auth.accessLabel === 6
											? 'Gps location not fixed'
											: auth.accessLabel === 6
											? 'Gps location'
											: 'Current Location'
									}
									placement='left'
									mouseEnterDelay={1}
								>
									{vehicleData.GPSInfo.gps_fix !== 1 && auth.accessLabel === 6 ? (
										<Image src={cancelMarkerIcon} alt='current location' width={24} height={29.453} className='relative z-0' />
									) : (
										<Image src={markerIcon} alt='current location' width={24} height={29.453} className='relative z-0' />
									)}
								</Tooltip>
							</div>

							<Tooltip
								title={`${
									auth.accessLabel === 6 ? vehicleData.GPSInfo.addr?.replaceAll('_', ' ') : vehicleData.gpsDtl.latLngDtl.addr?.replaceAll('_', ' ')
								}`}
								placement='right'
								mouseEnterDelay={1}
							>
								<p className={`text-sm  truncate w-[310px]  ${getLatestGPSTime(vehicleData) === 'GPS' ? 'text-primary-green' : ''}`}>
									{auth.accessLabel === 6 && isHourAgo(vehicleData.GPSInfo.gpstime)
										? 'Cabin device not working'
										: auth.accessLabel === 6 && vehicleData.GPSInfo.gps_fix !== 1
										? vehicleData.GPSInfo.addr?.replaceAll('_', ' ')
										: vehicleData.gpsDtl.latLngDtl.addr
										? vehicleData.gpsDtl.latLngDtl.addr?.replaceAll('_', ' ')
										: ''}
								</p>
							</Tooltip>
						</div>
						{auth.accessLabel === 6 ? (
							<div className='flex items-center gap-2 mb-1'>
								<div className='font-semibold text-gray-600 w-6 relative'>
									<Tooltip
										title={vehicleData.ELOCKInfo.gps_fix !== 1 ? 'Elock location not fixed' : 'Elock location'}
										placement='left'
										mouseEnterDelay={1}
									>
										{vehicleData.ELOCKInfo.gps_fix !== 1 ? (
											<div className='w-[26px] h-[2px] bg-black rotate-45 absolute top-[11.9px] -right-[0.5px] rounded-md'></div>
										) : null}
										<LockOutlined style={{ fontSize: '24px' }} />
									</Tooltip>
								</div>
								<Tooltip title={`${vehicleData.ELOCKInfo.addr?.replaceAll('_', ' ')}`} placement='right' mouseEnterDelay={1}>
									<p className={`text-sm  truncate w-[310px]  ${getLatestGPSTime(vehicleData) === 'ELOCK' ? 'text-primary-green' : ''}`}>
										{auth.accessLabel === 6 && isHourAgo(vehicleData.ELOCKInfo.gpstime)
											? 'Elock device not working'
											: auth.accessLabel === 6 && vehicleData.ELOCKInfo.gps_fix !== 1
											? vehicleData.ELOCKInfo.addr?.replaceAll('_', ' ')
											: vehicleData.gpsDtl.latLngDtl.addr
											? vehicleData.gpsDtl.latLngDtl.addr?.replaceAll('_', ' ')
											: ''}
									</p>
								</Tooltip>
							</div>
						) : null}

						{isCheckInAccount(Number(auth.userId)) ? null : (
							<div className='flex items-center gap-2 mb-1'>
								<div className='font-semibold text-gray-600 w-6 '>
									<Tooltip
										title={Number(auth.userId) === 87364 || Number(auth.parentUser) === 87364 ? 'Geofence' : 'POI'}
										placement='left'
										mouseEnterDelay={1}
									>
										<Image src={poiIcon} alt='current location' width={24} height={30} />
									</Tooltip>
								</div>
								<Tooltip title={`${vehicleData.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ')}`} placement='right' mouseEnterDelay={1}>
									<p className='text-sm truncate w-[310px]'>
										{Number(auth.userId) === 87364 || Number(auth.parentUser) === 87364
											? vehicleData.gpsDtl.latLngDtl.poi && vehicleData.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ') === 'Inside POI'
												? 'Inside Geofence'
												: vehicleData.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ') === 'No Nearest POI'
												? 'No Nearest Geofence'
												: vehicleData.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ')
											: vehicleData.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ')}
									</p>
								</Tooltip>
							</div>
						)}

						{isCheckInAccount(Number(auth.userId)) ? null : (
							<div className='flex items-center gap-2 mb-1'>
								{auth.isAlcohol && getAlcoholStatus(vehicleData) ? (
									<div className='font-semibold text-gray-600 w-6 '>
										<Tooltip title='Driver is drunk' placement='left' mouseEnterDelay={1}>
											<Image src={drunkDriverIcon} alt='driver' width={24} height={30} />
										</Tooltip>
									</div>
								) : (
									<div className='font-semibold text-gray-600 w-6 '>
										<Tooltip title='Driver' placement='left' mouseEnterDelay={1}>
											<Image src={driverIcon} alt='driver' width={24} height={30} />
										</Tooltip>
									</div>
								)}
								<Tooltip title={`${vehicleData.drivers.driverName}`} placement='right' mouseEnterDelay={1}>
									<p className='text-sm truncate w-[310px]'>{checkIfDriverNameAndNumberExists()}</p>
								</Tooltip>
							</div>
						)}

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
									{isCheckInAccount(Number(auth.userId)) ? null : (
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
									)}
									{isCheckInAccount(Number(auth.userId)) || auth.accessLabel == 4 ? null : (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
											<div className='font-semibold'>{vehicleData.gpsDtl.ignState.toLowerCase()}</div>
											<div className='mt-1'>Ignition</div>
										</div>
									)}

									{auth.isAc && !isCheckInAccount(Number(auth.userId)) && auth.accessLabel !== 4 ? (
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

									{auth.isTemp ? (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs min-w-20 h-[84px]'>
											<div className='font-semibold'>{vehicleData.gpsDtl.alcoholLevel} °C</div>
											<div className='mt-1'>Humidity</div>
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
												{auth.isCrackPadlock
													? vehicleData.gpsDtl.percentageBttry
													: vehicleData.gpsDtl.main_powervoltage
													? vehicleData.gpsDtl.main_powervoltage?.toFixed(2)
													: '0'}
												{auth.isCrackPadlock ? '' : '%'}
											</div>
											<div className='mt-1'>Battery Status</div>
										</div>
									) : null}

									{auth.accessLabel === 4 ? (
										<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
											<div className='font-semibold'>{vehicleData.gpsDtl.percentageBttry}</div>
											<div className='mt-1'>Battery Status</div>
										</div>
									) : null}

									{isCheckInAccount(Number(auth.userId)) ? (
										<>
											<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
												<div className='font-semibold'>{vehicleData.gpsDtl.volt} %</div>
												<div className='mt-1'>Mobile Battery</div>
											</div>
											<div className='border border-gray-300 px-2 py-3 rounded-lg text-xs w-20 h-[84px] min-w-[80px]'>
												<div
													className={`font-semibold ${
														moment(vehicleData.gpsDtl.latLngDtl.gpstime).date() === moment().date() ? 'text-primary-green' : 'text-red-700'
													}`}
												>
													{moment(vehicleData.gpsDtl.latLngDtl.gpstime).date() === moment().date() ? 'Checked In' : 'Not Checked'}
												</div>
												<div
													className={`mt-1 ${
														moment(vehicleData.gpsDtl.latLngDtl.gpstime).date() === moment().date() ? 'text-primary-green' : 'text-red-700'
													}`}
												>
													Status
												</div>
											</div>
										</>
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
