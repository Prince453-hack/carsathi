'use client';

export const revalidate = 0;

import { LegacyRef, MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react';
import { VehicleOverviewCard } from './VehicleOverviewCard';
import { useGetVehiclesByStatusQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { useInView } from 'react-intersection-observer';
import { GetListVehiclesMobResponse, VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { setAllMarkers, updateMarkersBasedOnStatus } from '@/app/_globalRedux/dashboard/markersSlice';
import { VehicleOverviewCardSkeleton } from './VehicleOverviewCardSkeleton';
import { Skeleton, Tooltip } from 'antd';
import { RootState } from '@/app/_globalRedux/store';
import { useDispatch, useSelector } from 'react-redux';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import compareCategories from '@/app/helpers/compareCategories';
import { DownloadReportsModal } from '../common';
import { DownloadReportTs } from '../common/CustomTableN';
import { setIsLoadingScreenActive } from '@/app/_globalRedux/dashboard/mapSlice';
import { isCheckInAccount } from '@/app/helpers/isCheckInAccount';
import { getGPSOrElock } from './utils/getNormalOrControllerId';

export const VehiclesList = ({ selectedVehicleStatus }: { selectedVehicleStatus: string }) => {
	const { userId, groupId, parentUser: pUserId } = useSelector((state: RootState) => state.auth);
	const markers = useSelector((state: RootState) => state.markers);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const selectedDashboardVehicle = useSelector((state: RootState) => state.selectedDashboardVehicle);
	const selectedVehicleListTab = useSelector((state: RootState) => state.selectedVehicleListTab);
	const { mapYourVehicleIndex, driverInfoIndex, createPOIIndex } = useSelector((state: RootState) => state.vehicleOverviewOptions);

	const [currentPage, setCurrentPage] = useState(10);
	const dispatch = useDispatch();

	const [ref, inView] = useInView({
		threshold: 0,
	});

	const { isFetching: isFetchingVehicle, data: vehicleData } = useGetVehiclesByStatusQuery(
		{
			userId,
			token: groupId,
			pUserId,
			mode:
				selectedVehicleStatus === 'all'
					? ''
					: selectedVehicleStatus === 'inpoi' || selectedVehicleStatus === 'Unhealthy'
					? selectedVehicleStatus
					: selectedVehicleStatus.toUpperCase(),
		},
		{
			skip:
				!groupId ||
				!userId ||
				selectedVehicle.vId !== 0 ||
				selectedDashboardVehicle.length > 0 ||
				mapYourVehicleIndex !== -1 ||
				driverInfoIndex !== -1 ||
				createPOIIndex !== -1,

			pollingInterval: 3000000,
		}
	);

	let sortedData: MutableRefObject<GetListVehiclesMobResponse | undefined> = useRef();

	const updateStatesOnData = (data: GetListVehiclesMobResponse) => {
		if (data && data.message !== 'Something wrong happend') {
			let tempData;

			selectedVehicleListTab === 'ALL'
				? (tempData = data.list
						.filter((vehicle) => vehicle.vId !== null)
						.slice()
						.sort(compareCategories))
				: selectedVehicleListTab === 'stopped'
				? (tempData = data.list
						.filter((vehicle) => vehicle.vId !== null)
						.slice()
						.sort((vehicle1, vehicle2) => {
							const vehicle1Hours = Number(vehicle1.gpsDtl.modeTimeFormat?.split(':')[0] || 0) || 0;
							const vehicle1MinutesToHours = Number(vehicle1.gpsDtl.modeTimeFormat?.split(':')[1] || 0) / 60 || 0;

							const vehicle2Hours = Number(vehicle2.gpsDtl.modeTimeFormat?.split(':')[0] || 0) || 0;
							const vehicle2MinutesToHours = Number(vehicle2.gpsDtl.modeTimeFormat?.split(':')[1] || 0) / 60 || 0;

							const vehicle1HoursToMinutes = vehicle1Hours + vehicle1MinutesToHours;
							const vehicle2HoursToMinutes = vehicle2Hours + vehicle2MinutesToHours;

							if (vehicle1HoursToMinutes > vehicle2HoursToMinutes) {
								return 1;
							} else if (vehicle1HoursToMinutes < vehicle2HoursToMinutes) {
								return -1;
							}

							return 0;
						}))
				: (tempData = data.list.filter((vehicle) => vehicle.vId !== null).slice());

			sortedData.current = { ...data, list: tempData };
		}

		if (data && Array.isArray(data.list) && markers.length === 0 && sortedData.current) {
			dispatch(setAllMarkers(sortedData.current.list.map((vehicle) => ({ ...vehicle, visibility: true, isMarkerInfoWindowOpen: false }))));
		} else if (data && Array.isArray(data.list) && markers.length && sortedData.current) {
			dispatch(
				updateMarkersBasedOnStatus(
					sortedData.current.list.map((vehicle) =>
						markers.find((marker) => marker.vId === vehicle.vId)
							? { ...vehicle, visibility: true, isMarkerInfoWindowOpen: false }
							: { ...vehicle, visibility: false, isMarkerInfoWindowOpen: false }
					)
				)
			);
		} else {
			dispatch(setAllMarkers(markers.map((marker) => ({ ...marker, visibility: false }))));
		}
	};

	useEffect(() => {
		if (inView) {
			setTimeout(() => setCurrentPage((prev) => prev + 10), 2000);
		}
	}, [inView]);

	useEffect(() => {
		vehicleData && updateStatesOnData(vehicleData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vehicleData]);

	const [updatedVehicleIndex, setUpdatedVehicleIndex] = useState(0);

	useEffect(() => {
		if (markers.length && selectedVehicle.vId !== 0 && sortedData.current) {
			const updatedVehicle = markers.find((marker) => marker.vId === selectedVehicle.vId);

			if (!updatedVehicle) return;

			sortedData.current = {
				...vehicleData,
				list: [
					...sortedData.current.list.map((sortedVehicle) =>
						sortedVehicle.vId === updatedVehicle.vId ? { ...updatedVehicle } : { ...sortedVehicle }
					),
				],
				message: '',
				success: true,
			};
		} else if (
			markers.length &&
			selectedVehicle.vId === 0 &&
			sortedData.current &&
			selectedDashboardVehicle.length &&
			updatedVehicleIndex < selectedDashboardVehicle.length
		) {
			const updatedVehicle = markers.find((marker) => marker.vId === selectedDashboardVehicle[updatedVehicleIndex].vehicleData.vId);

			if (!updatedVehicle) return;

			sortedData.current = {
				...vehicleData,
				list: [
					...sortedData.current.list.map((sortedVehicle) =>
						sortedVehicle.vId === updatedVehicle.vId ? { ...updatedVehicle } : { ...sortedVehicle }
					),
				],
				message: '',
				success: true,
			};
		}

		if (updatedVehicleIndex < selectedDashboardVehicle.length - 1) {
			setUpdatedVehicleIndex((prev) => prev + 1);
		} else {
			setUpdatedVehicleIndex(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [markers, selectedDashboardVehicle]);

	const isFetching = isFetchingVehicle;
	if (isFetching) {
		return (
			<WrapperComponent refs={ref} isFetching={isFetching}>
				<VehicleOverviewCardSkeleton />
			</WrapperComponent>
		);
	}

	return (
		<WrapperComponent refs={ref} currentPage={currentPage} list={sortedData.current?.list || []} isFetching={isFetching}>
			{sortedData.current && selectedDashboardVehicle.length
				? sortedData.current.list
						.filter((vehicle) => selectedDashboardVehicle.find((v) => v.vehicleData.vId === vehicle.vId))
						.slice(0, currentPage)
						.sort((a, b) => a.vId - b.vId)
						.map((vehicle) => (
							<span key={vehicle.vId}>
								<VehicleOverviewCard vehicleData={vehicle} />
							</span>
						))
				: sortedData.current
				? sortedData.current.list.slice(0, currentPage).map((vehicle) => (
						<span key={vehicle.vId}>
							<VehicleOverviewCard vehicleData={vehicle} />
						</span>
				  ))
				: 'No Vehicle Found'}
		</WrapperComponent>
	);
};

const WrapperComponent = ({
	children,
	refs,
	currentPage,
	list,
	isFetching,
}: {
	children: ReactNode;
	refs: LegacyRef<HTMLDivElement>;
	currentPage?: number;
	list?: VehicleData[] | [];
	isFetching: boolean;
}) => {
	const collapseVehicleStatusToggle = useSelector((state: RootState) => state.collapseVehicleStatusToggle);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const selectedDashboardVehicle = useSelector((state: RootState) => state.selectedDashboardVehicle);
	const markers = useSelector((state: RootState) => state.markers);
	const selectedVehicleListTab = useSelector((state: RootState) => state.selectedVehicleListTab);
	const { accessLabel, userId, parentUser } = useSelector((state: RootState) => state.auth);
	const [vehicleCountPercentage, setVehicleCountPercentage] = useState({
		all: 0,
		inGeofence: 0,
		outsideGeofence: 0,
	});

	useEffect(() => {
		if (markers) {
			const allVehicles = markers.length;
			const inPoiVehicles = markers.filter((marker) =>
				marker.gpsDtl.latLngDtl.poi ? marker.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ') === 'Inside POI' : false
			).length;
			const outsideGeofenceVehicles = allVehicles - inPoiVehicles;

			const inGeofencePercentage = Math.round((inPoiVehicles / allVehicles) * 100);
			const outsideGeofencePercentage = Math.round((outsideGeofenceVehicles / allVehicles) * 100);
			const allVehiclesPercentage = Math.round((allVehicles / allVehicles) * 100);

			setVehicleCountPercentage({
				all: allVehiclesPercentage,
				inGeofence: inGeofencePercentage,
				outsideGeofence: outsideGeofencePercentage,
			});
		}
	}, [markers]);
	const [updateDate, setUpdateDate] = useState('0');

	const dispatch = useDispatch();

	useEffect(() => {
		if (isFetching) {
			dispatch(setIsLoadingScreenActive(true));
			setUpdateDate(moment().format('HH:mm:ss'));
		} else {
			dispatch(setIsLoadingScreenActive(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFetching]);

	const [downloadReport, setDownloadReport] = useState<DownloadReportTs | undefined>();
	const { type: VehicleListType } = useSelector((state: RootState) => state.isVehicleStatusOrTripStatusActive);

	return (
		<div className='bg-neutral-green relative'>
			<div className={`flex items-center justify-between px-5`}>
				<p className='text-gray-600 font-semibold pl-2 text-[13px]'>
					{isCheckInAccount(Number(userId))
						? 'Check-In'
						: VehicleListType === 'trip' || VehicleListType === 'vehicle-allocation-trip'
						? 'Trips'
						: 'Vehicles'}{' '}
					Count: {selectedDashboardVehicle.length ? selectedDashboardVehicle.length : list && list.length}
				</p>

				<div className='flex items-center pr-2'>
					{selectedDashboardVehicle.length !== 0 && accessLabel !== 6 ? (
						<div className='bg-primary-green py-1 px-4 animate-pulse rounded-full mr-[10px]'>
							<p className='text-white font-semibold text-[11px]'>Live</p>
						</div>
					) : (
						<div className='text-[13px] text-gray-600 font-semibold flex'>
							<div>Updated At: </div>
							{isFetching || updateDate === '0' ? (
								<div className='w-[65px] pl-[5px]'>
									<div className='lds-ring ml-[2.5px]'>
										<div></div>
										<div></div>
										<div></div>
										<div></div>
									</div>
								</div>
							) : (
								<div className='w-[65px] text-nowrap ml-[3px]'> {updateDate}</div>
							)}
						</div>
					)}
					{isCheckInAccount(Number(userId)) ? null : (
						<div
							className={`bg-gray-600 h-[22px] w-[22px] flex justify-center items-center rounded-full  ${
								isFetching || updateDate === '0' ? 'cursor-progress' : 'cursor-pointer'
							}`}
						>
							<Tooltip title={`Download Selected Vehicle Report`} mouseEnterDelay={1}>
								<DownloadOutlined
									style={{ color: '#F2F5F3' }}
									disabled={isFetching || updateDate === '0'}
									onClick={() => {
										if (list && list.length > 0) {
											let rows: any[] = list.map((item, index) => {
												const ltcObj = {
													'Device Status': '',
													'Device Status Description': '',
												};

												if (Number(userId) === 84435) {
													const deviceStatus = item.ELOCKInfo.Unhealthy.data[0] === 1 ? 'Unhealthy' : 'Healthy';
													const deviceStatusDescrription = item.ELOCKInfo.UnhealthyDesc ?? '';

													ltcObj['Device Status'] = deviceStatus;
													ltcObj['Device Status Description'] = deviceStatusDescrription;
												}
												return {
													'S. No.': index + 1,
													'Vehicle No.': item.vehReg,
													'Location Name': item.gpsDtl.latLngDtl.addr?.replaceAll('_', ' '),
													'Last Update':
														accessLabel === 6
															? getGPSOrElock(item) === 'GPS'
																? moment(item.GPSInfo.gpstime).format('DD-MM-YYYY HH:mm')
																: moment(item.ELOCKInfo.gpstime).format('DD-MM-YYYY HH:mm')
															: moment(item.gpsDtl.latLngDtl.gpstime).format('DD-MM-YYYY HH:mm'),
													'Halting Time': item.gpsDtl.HaltingInHRS,
													Speed: item.gpsDtl.speed,
													Status: item.gpsDtl.mode,
													Destination: item.vehicleTrip.sys_service_id ? item.vehicleTrip.station_to_location : '',
													[Number(userId) === 87364 || Number(parentUser) === 87364 ? 'Nearest Geofence' : 'Nearest POI']: item.gpsDtl.latLngDtl.poi
														? item.gpsDtl.latLngDtl.poi
														: '',

													...(Number(userId) === 84435 ? ltcObj : {}),
												};
											});

											if (selectedVehicleListTab.toLowerCase() === 'running') {
												rows = list.map((item, index) => {
													const ltcObj = {
														'Device Status': '',
														'Device Status Description': '',
													};

													if (Number(userId) === 84435) {
														const deviceStatus = item.ELOCKInfo.Unhealthy.data[0] === 1 ? 'Unhealthy' : 'Healthy';
														const deviceStatusDescrription = item.ELOCKInfo.UnhealthyDesc ?? '';

														ltcObj['Device Status'] = deviceStatus;
														ltcObj['Device Status Description'] = deviceStatusDescrription;
													}
													return {
														'S. No.': index + 1,
														'Vehicle No.': item.vehReg,
														'Location Name': item.gpsDtl.latLngDtl.addr?.replaceAll('_', ' '),
														'Last Running Time':
															accessLabel === 6
																? getGPSOrElock(item) === 'GPS'
																	? moment(item.GPSInfo.gpstime).format('DD-MM-YYYY HH:mm')
																	: moment(item.ELOCKInfo.gpstime).format('DD-MM-YYYY HH:mm')
																: moment(item.gpsDtl.latLngDtl.gpstime).format('DD-MM-YYYY HH:mm'),
														'Halting Time': item.gpsDtl.HaltingInHRS,
														Speed: item.gpsDtl.speed,
														[Number(userId) === 87364 || Number(parentUser) === 87364 ? 'Nearest Geofence' : 'Nearest POI']: item.gpsDtl.latLngDtl.poi
															? item.gpsDtl.latLngDtl.poi
															: '',

														...(Number(userId) === 84435 ? ltcObj : {}),
													};
												});
											} else if (selectedVehicleListTab.toLowerCase() === 'inpoi') {
												rows = list.map((item, index) => {
													const ltcObj = {
														'Device Status': '',
														'Device Status Description': '',
													};

													if (Number(userId) === 84435) {
														const deviceStatus = item.ELOCKInfo.Unhealthy.data[0] === 1 ? 'Unhealthy' : 'Healthy';
														const deviceStatusDescrription = item.ELOCKInfo.UnhealthyDesc ?? '';

														ltcObj['Device Status'] = deviceStatus;
														ltcObj['Device Status Description'] = deviceStatusDescrription;
													}

													return {
														'S. No.': index + 1,
														'Vehicle No.': item.vehReg,
														[Number(userId) === 87364 || Number(parentUser) === 87364 ? 'Geofence Name' : 'POI Name']: item.gpsDtl.latLngDtl.addr
															? item.gpsDtl.latLngDtl.addr
															: '',
														'Last Update':
															accessLabel === 6
																? getGPSOrElock(item) === 'GPS'
																	? moment(item.GPSInfo.gpstime).format('DD-MM-YYYY HH:mm')
																	: moment(item.ELOCKInfo.gpstime).format('DD-MM-YYYY HH:mm')
																: moment(item.gpsDtl.latLngDtl.gpstime).format('DD-MM-YYYY HH:mm'),
														'Halted Since': item.gpsDtl.hatledSince,

														...(Number(userId) === 84435 ? ltcObj : {}),
													};
												});
											} else if (selectedVehicleListTab.toLowerCase() === 'idle') {
												rows = list.map((item, index) => {
													const ltcObj = {
														'Device Status': '',
														'Device Status Description': '',
													};

													if (Number(userId) === 84435) {
														const deviceStatus = item.ELOCKInfo.Unhealthy.data[0] === 1 ? 'Unhealthy' : 'Healthy';
														const deviceStatusDescrription = item.ELOCKInfo.UnhealthyDesc ?? '';

														ltcObj['Device Status'] = deviceStatus;
														ltcObj['Device Status Description'] = deviceStatusDescrription;
													}
													return {
														'S. No.': index + 1,
														'Vehicle No.': item.vehReg,
														'Location Name': item.gpsDtl.latLngDtl.addr?.replaceAll('_', ' '),
														'Last Update':
															accessLabel === 6
																? getGPSOrElock(item) === 'GPS'
																	? moment(item.GPSInfo.gpstime).format('DD-MM-YYYY HH:mm')
																	: moment(item.ELOCKInfo.gpstime).format('DD-MM-YYYY HH:mm')
																: moment(item.gpsDtl.latLngDtl.gpstime).format('DD-MM-YYYY HH:mm'),
														'Halting Time': item.gpsDtl.HaltingInHRS,
														'Halted Since': item.gpsDtl.hatledSince,
														[Number(userId) === 87364 || Number(parentUser) === 87364 ? 'Nearest Geofence' : 'Nearest POI']: item.gpsDtl.latLngDtl.poi
															? item.gpsDtl.latLngDtl.poi
															: '',
														...(Number(userId) === 84435 ? ltcObj : {}),
													};
												});
											}
											const head = Object.keys(rows[0]);

											const body = rows.map((row) => Object.values(row));

											let columnsStyles: any = {};

											body[0].map((value: any, index) => {
												columnsStyles[index] = { cellWidth: value.toString().length > 10 ? 50 : 20 };
											});

											setDownloadReport({
												title: 'Vehicle Report',
												excel: { title: 'Vehicle Report', rows, footer: [] },
												pdf: {
													head: [head],
													body: body,
													title: 'Vehicle Report',
													pageSize: 'a3',
													userOptions: {
														columnStyles: columnsStyles,
													},
												},
											});
										}
									}}
								/>
							</Tooltip>
							<DownloadReportsModal downloadReport={downloadReport} setDownloadReport={setDownloadReport} />
						</div>
					)}
				</div>
			</div>
			{Number(userId) == 87364 || Number(parentUser) == 87364 ? (
				<div className=' text-gray-600 text-[13px] ml-[18px] mr-[26px]  rounded-md bg-white  py-2 mt-2 mb-1'>
					<p className='mx-5'>
						<span className='font-semibold'>Inside Geofence: </span>
						{vehicleCountPercentage.inGeofence}% | <span className='font-semibold'>Outside Geofence: </span>
						{vehicleCountPercentage.outsideGeofence}%
					</p>
				</div>
			) : null}
			<div
				className={`${
					Number(userId) == 87364 || Number(parentUser) == 87364 ? 'h-[calc(100vh-230px)]' : 'h-[calc(100vh-185px)]'
				} bg-neutral-green top-0 p-4 pt-0 scrollbar-thumb-thumb-green scrollbar-w-2  scrollbar-thumb-rounded-md scrollbar overflow-visible ${
					collapseVehicleStatusToggle ? 'opacity-0' : 'overflow-y-scroll'
				}`}
			>
				{children}
				{currentPage && list && selectedVehicle.searchType !== 'GLOBAL' ? (
					<div className=' w-full px-4 my-4' ref={refs}>
						{selectedDashboardVehicle.length ? (
							currentPage < selectedDashboardVehicle.length
						) : currentPage < list.length ? (
							<Skeleton className='pt-5' active />
						) : (
							''
						)}
					</div>
				) : null}
			</div>
		</div>
	);
};
