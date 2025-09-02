'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authenticate, getAuthenticatedData } from '@/app/lib/actions';
import { usePathname } from 'next/navigation';
import { Button, Tooltip } from 'antd';
import { DashboardVehicleDetailsSelect, PoiDropdownSelector } from '../dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { initialAuthState, setAuth, setAuthLoading } from '@/app/_globalRedux/common/authSlice';
import GlobalSettings from './GlobalSettings.tsx';
import AlertNotifications from '../dashboard/alertsNotification/AlertNotifications';
import { RootState } from '@/app/_globalRedux/store';
import { useUser } from '@auth0/nextjs-auth0/client';
import jwt from 'jsonwebtoken';

import { useGetEventsDataMutation } from '@/app/_globalRedux/services/yatayaat';
import { setCreateTripOrTripPlanningActive } from '@/app/_globalRedux/dashboard/createTripOrTripPlanningActive';
import { setCarvanMapUniqueId, setIsLoadingScreenActive, setOpenStoppageIndex } from '@/app/_globalRedux/dashboard/mapSlice';
import { initialSelectedVehicleState, setSelectedVehicleBySelectElement } from '@/app/_globalRedux/dashboard/selectedVehicleSlice';

import createTripIcon from '@/public/assets/svgs/map/create-trip.svg';
import tripPlanningIcon from '@/public/assets/svgs/map/trip-planning.svg';
import createTripIconGreen from '@/public/assets/svgs/map/create-trip-green.svg';
import tripPlanningIconGreen from '@/public/assets/svgs/map/trip-planning-green.svg';
import { useLazyGetAllVehiclesQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { setAllVehicles } from '@/app/_globalRedux/dashboard/allVehicles';
import { TripSystemIcon, VehicleListIcon } from '@/public/assets/svgs/nav';
import resetDashboardAndTripSystemState from '@/app/helpers/resetDashboardAndTripSystemState';

import { setHistoryReplayModeToggle } from '@/app/_globalRedux/dashboard/historyReplaySlice';
import React from 'react';
import CirclePoi from '@/app/_assets/svgs/map/circle-poi';
import PolygonPoi from '@/app/_assets/svgs/map/polygon-poi';
import UserSettings from '../dashboard/UserSettings';
import { setPoiShape } from '@/app/_globalRedux/dashboard/createPoi';
import { setIsOlMapActive } from '@/app/_globalRedux/dashboard/olMapSlice';
import { resetDashboardSelectedVehicleState } from '@/app/_globalRedux/dashboard/dashboardVehicleDetailsSelect';
import { Dispatch } from '@reduxjs/toolkit';
import { isCheckInAccount } from '@/app/helpers/isCheckInAccount';
import { DashboardCheckInSelect } from '../dashboard/DashboardCheckInSelect';
import { setAuthData } from '@/app/helpers/setAuthData';
import { isSnowmanAccount } from '@/app/helpers/isSnowmanAccount';
import { setVehicleDetailsStatus } from '@/app/_globalRedux/dashboard/isVehicleStatusOrTripStatusActive';
import { useGetIsUserAuthenticatedMutation } from '@/app/_globalRedux/services/reactApi';
import { TypedMutationTrigger } from '@reduxjs/toolkit/query/react';
import { isVideoTelematics } from '@/app/helpers/isVideoTelematics';
import { useCreateMettaxTokenMutation, useGetMettaxDevicesMutation } from '@/app/_globalRedux/services/mettax';

import { setAllMarkers } from '@/app/_globalRedux/dashboard/markersSlice';
import { ReloadOutlined } from '@ant-design/icons';
import { useInitiateLocationRequestMutation } from '@/app/_globalRedux/services/carvanmaptracking';
import { generateRandomToken } from '@/app/_utils/generateRandomToken';
import axios from 'axios';

const selectedStyles = {
	selectorBg: 'transparent',
	colorBorder: 'transparent',
	fontSize: 14,
	optionFontSize: 14,
	optionPadding: '5px',
	optionSelectedColor: '#000',
};

export const LogoutItem = async ({ dispatch, setAuth }: { dispatch: Dispatch; setAuth: any }) => {
	dispatch(resetDashboardSelectedVehicleState());
	dispatch(setAuth(initialAuthState));
	await authenticate('LOG_OUT');
	localStorage.removeItem('auth-session');
	localStorage.removeItem('username-password');
	localStorage.removeItem('auth-token');
	dispatch(setAuthLoading(false));
	window.location.replace(`${window.location.origin}`);
	// window.location?.replace(`${window.location.origin}/api/auth/logout`);
};

async function fetchUserData({ getUserAuthenticated, dispatch }: { dispatch: Dispatch; getUserAuthenticated: TypedMutationTrigger<any, any, any> }) {
	const logoutAndReset = () => {
		dispatch(resetDashboardSelectedVehicleState());
		LogoutItem({ dispatch, setAuth });
	};

	try {
		const response = await fetch('/api/auth/me');
		if (!response.ok) {
			return logoutAndReset();
		}

		const userData = await response.json();
		const data = await getAuthenticatedData();
		if (!data) {
			return logoutAndReset();
		}

		const authData = JSON.parse(data.data);

		const authUserData = await getUserAuthenticated({
			username: authData.userName,
			ms_username: userData.name,
		});

		if (authUserData.data === undefined || authUserData.data[0].status !== true) {
			return logoutAndReset();
		}

		setAuthData({ res: data, dispatch });
		dispatch(setAuthLoading(false));
	} catch (error) {
		logoutAndReset();
	}
}

export const TopNavbar = ({ sessionData }: { sessionData: string | undefined }) => {
	const [isRotating, setIsRotating] = useState(false);
	const dispatch = useDispatch();
	const path = usePathname();
	const { isLoading } = useUser();

	const poiData = useSelector((state: RootState) => state.poiData);
	const authState = useSelector((state: RootState) => state.auth);
	const auth = sessionData ? JSON.parse(sessionData || '').data[0] : '';

	const { isCreatePoi } = useSelector((state: RootState) => state.createPoi);

	const [getEventsData] = useGetEventsDataMutation();
	const [getUserAuthenticated] = useGetIsUserAuthenticatedMutation();
	const [eventsData, setEventsData] = useState<EventsResponse>();
	const [initiateLocationRequest] = useInitiateLocationRequestMutation();

	const allVehicles = useSelector((state: RootState) => state.allVehicles);
	const { type: VehicleListType } = useSelector((state: RootState) => state.isVehicleStatusOrTripStatusActive);
	const { type: createTripOrPlanningTripActive } = useSelector((state: RootState) => state.createTripOrPlanningTripActive);
	const markers = useSelector((state: RootState) => state.markers);
	const dashoboardVehicleDetailsSelected = useSelector((state: RootState) => state.selectedDashboardVehicle);

	const { isOlMapActive } = useSelector((state: RootState) => state.olMap);
	const loggedIn = auth ? auth['groupid'] || auth['groupId'] : false;

	const sysParentUser = auth ? auth['sys_parent_user'] || auth['parentUser'] : false;
	const userId = auth ? auth['userId'] || auth['userid'] : '';
	const groupId = auth ? auth['groupId'] || auth['groupid'] : '';
	const user = useUser();

	const updateSessionData = async (value: string) => {
		try {
			await fetch('/api/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ value }),
			});
		} catch (error) {
			console.error('Error updating session:', error);
		}
	};

	useEffect(() => {
		if (authState.userId !== '') {
			updateSessionData(JSON.stringify({ data: [authState] }));
		}
	}, [authState]);

	const triggerCreateTripOrTripPlanningForm = () => {
		dispatch(setOpenStoppageIndex(-1));
		dispatch(
			setSelectedVehicleBySelectElement({
				...initialSelectedVehicleState,
				vId: allVehicles[0].id,
				vehReg: allVehicles[0].veh_reg,
				searchType: '',
				selectedVehicleHistoryTab: 'All',
				nearbyVehicles: [],
			})
		);
	};

	const [getAllVehicles] = useLazyGetAllVehiclesQuery();
	const [getMettaxDevices, { isLoading: isMettaxDevicesLoading, isUninitialized: isMettaxDevicesUninitialized }] = useGetMettaxDevicesMutation();

	useEffect(() => {
		const data = JSON.parse(localStorage.getItem('auth-session') || `{ "userId": "", "groupId": "" }`);
		if (data.userId && authState.userId === '' && !isSnowmanAccount({ userId })) {
			dispatch(
				setAuth({
					isLoading: false,
					groupId: data.groupId,
					userName: data.userName,
					mobileNumber: data.mobileNumber,
					userId: data.userId,
					accessLabel: data.accessLabel,
					parentUser: data.parentUser,
					extra: data.extra,
					password: data.password,
					company: data.company,
					address: data.address,
					billingAddress: data.billingAddress,
					mobileAppToken: data.mobileAppToken,
					payment: data.payment,
					logo: data.logo,
					isAc: data.isAc || 0,
					isAlcohol: data.isAlcohol || 0,
					isOdometer: data.isOdometer || 0,
					vehicleType: data.vehicleType || '',
					isTemp: data.isTemp || 0,
					isPadlock: data.isPadlock || 0,
					isMachine: data.isMachine || 0,
					isEveVehicle: data.isEveVehicle || 0,
					isMarketVehicle: data.isMarketVehicle || 0,
					isGoogleMap: data.isGoogelMap || 1,
					isCrackPadlock: data.isCrackPadlock || 0,
				})
			);
			if (data) {
				if (data.isGoogleMap !== 1) {
					dispatch(setIsOlMapActive(true));
				}
			}
		} else if (!isLoading && user.user && isSnowmanAccount({ userId }) && data.userId === '') {
			dispatch(setAuthLoading(true));
			fetchUserData({ getUserAuthenticated, dispatch });
		} else if (!isLoading && data.userId === '') {
			dispatch(resetDashboardSelectedVehicleState());
			LogoutItem({ dispatch, setAuth });
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	const videoTelematicsSetDeviceIds = async () => {
		const videoTelematicsId = isVideoTelematics(userId, sysParentUser);

		if (videoTelematicsId && isMettaxDevicesUninitialized) {
			try {
				const { data } = await getMettaxDevices({ customerId: videoTelematicsId });
				let markersShallow = markers;

				markersShallow = markersShallow.map((marker) => {
					const vehicle = data?.data.find((vehicle) => vehicle.deviceData.deviceName.toLowerCase() === marker.vehReg.toLowerCase());

					if (vehicle) {
						return {
							...marker,
							deviceId: vehicle.deviceData.deviceId,
						};
					} else {
						return {
							...marker,
							deviceId: marker.deviceId || '',
						};
					}
				});

				dispatch(setAllMarkers(markersShallow));
			} catch (err) {
				console.log(err);
			}
		}
	};

	const getElockData = async () => {
		if (auth.accessLabel === 6) {
			try {
				await axios.get(`http://203.115.101.54/ses_alert/unhealthy.php?Group_id=${groupId}`);
			} catch (Err) {
				console.log(Err);
			}
		}
	};

	useEffect(() => {
		if (userId && groupId) {
			getAllVehicles({
				token: groupId,
			}).then(({ data }) => {
				if (!data) return;
				dispatch(setAllVehicles(data.list));
			});

			if (eventsData === undefined) {
				getEventsData({
					userId: userId,
					token: groupId,
				}).then((res) => {
					if ('data' in res) {
						setEventsData(res.data);
					}
				});
			}

			getElockData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, groupId]);

	useEffect(() => {
		if (!isMettaxDevicesLoading && markers.length) videoTelematicsSetDeviceIds();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [markers]);

	useEffect(() => {
		const auth = JSON.parse(localStorage.getItem('auth-session') || `{ "userId": "", "groupId": "" }`);
		if (auth.isGoogleMap !== 1) {
			dispatch(setAuth({ ...auth, isGoogleMap: 0 }));
			dispatch(setIsOlMapActive(true));
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onFetchAll = () => {
		const phoneNumbers = markers.map((marker) => marker.gpsDtl.model ?? '').filter((phoneNumber) => phoneNumber);
		const token = generateRandomToken();
		dispatch(setCarvanMapUniqueId(token));

		setIsRotating(true);
		initiateLocationRequest({
			phoneNumbers: phoneNumbers,
		});
	};

	const onFetchSelectedVehicle = () => {
		const selectedPhoneNumber = markers
			.filter((marker) => marker.visibility)
			.map((marker) => marker.gpsDtl.model ?? '')
			.filter((phoneNumber) => phoneNumber);
		const token = generateRandomToken();

		dispatch(setCarvanMapUniqueId(token));

		setIsRotating(true);
		initiateLocationRequest({
			phoneNumbers: selectedPhoneNumber,
		});
	};

	useEffect(() => {
		if (isRotating) {
			setTimeout(() => {
				setIsRotating(false);
			}, 2000);
		}
	}, [isRotating]);

	return (
		<>
			<nav className='flex justify-between py-3 px-6 border-b-2 bg-neutral-green min-h-[60.5px] select-none'>
				<div className='flex space-x-4 items-center'>
					<Link href='/'>
						{loggedIn ? (
							loggedIn === 56919 || sysParentUser === 84700 ? (
								<Image src='/assets/images/common/sfox.png' width='70' height='30' alt='Logo' />
							) : userId === 87162 || sysParentUser === 87162 ? (
								<Image src='/assets/images/henkle_logo.png' width='30' height='30' alt='Logo' />
							) : eventsData && eventsData.logo ? (
								eventsData.extension === 'png' || eventsData.extension === 'jpg' ? (
									<div className='max-w-[80px] max-h-[30px] object-contain'>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={decodeURIComponent(eventsData.logo)} width='80' height='30' alt='Logo' />
									</div>
								) : (
									<div className='max-w-[80px] max-h-[30px] object-contain'>
										<Image src={eventsData.logo} width='70' height='30' alt='Logo' />
									</div>
								)
							) : (
								<Image src='/assets/images/common/logo.png' width='70' height='30' alt='Logo' />
							)
						) : null}
					</Link>
					{poiData?.poi?.length > 0 || poiData?.geofenceList?.length > 0 ? <PoiDropdownSelector /> : null}
					{isCreatePoi && !isOlMapActive ? (
						<div className='flex gap-5 items-center relative -top-0.5'>
							<Tooltip title='Create Circle Poi' mouseEnterDelay={1}>
								<div
									onClick={() => dispatch(setPoiShape(google.maps.drawing.OverlayType.CIRCLE))}
									className='w-7 h-7 hover:opacity-75 opacity-75 transition-opacity duration-300 cursor-pointer'
								>
									<CirclePoi />
								</div>
							</Tooltip>
							<Tooltip title='Create Polygon Poi' mouseEnterDelay={1}>
								<div
									onClick={() => dispatch(setPoiShape(google.maps.drawing.OverlayType.POLYGON))}
									className='w-7 h-7 hover:opacity-75 transition-opacity duration-300 cursor-pointer'
								>
									<PolygonPoi />
								</div>
							</Tooltip>
						</div>
					) : null}
				</div>

				<div className='flex space-x-4 items-center'>
					{isCheckInAccount(Number(userId)) ? (
						<div
							className=' bg-neutral-100 mr-10 rounded-full border border-neutral-500 flex items-center justify-center px-2 py-1 gap-2 hover:bg-neutral-200 cursor-pointer active:bg-neutral-300 transition-all duration-300'
							onClick={() => {
								if (dashoboardVehicleDetailsSelected.length > 0) {
									onFetchSelectedVehicle();
								} else {
									onFetchAll();
								}
							}}
						>
							{dashoboardVehicleDetailsSelected.length > 0 ? <p className='text-sm'>Fetch Selected</p> : <p className='text-sm'>Fetch All</p>}
							<ReloadOutlined className={`${isRotating ? 'animate-spin' : ''} text-sm`} />
						</div>
					) : (
						<>
							{VehicleListType === 'trip' || VehicleListType === 'vehicle-allocation-trip' ? (
								<>
									<Tooltip title='Create Trip' mouseEnterDelay={1}>
										{userId === 87162 ? null : createTripOrPlanningTripActive === 'create-trip' ? (
											<Image
												src={createTripIconGreen}
												width={22}
												height={22}
												alt='poi icon'
												onClick={() => {
													dispatch(setCreateTripOrTripPlanningActive({ type: 'create-trip' }));
													triggerCreateTripOrTripPlanningForm();
												}}
												className='cursor-pointer hover:filter hover:brightness-75 transition-all duration-300 relative right-10'
											/>
										) : (
											<Image
												src={createTripIcon}
												width={22}
												height={22}
												alt='poi icon'
												onClick={() => {
													dispatch(setCreateTripOrTripPlanningActive({ type: 'create-trip' }));
													triggerCreateTripOrTripPlanningForm();
												}}
												className='cursor-pointer hover:filter hover:brightness-75 transition-all duration-300 relative right-10'
											/>
										)}
									</Tooltip>
									<Tooltip title='Plan Trip' mouseEnterDelay={1}>
										{userId === 87162 ? null : createTripOrPlanningTripActive === 'trip-planning' ? (
											<Image
												src={tripPlanningIconGreen}
												width={22}
												height={22}
												alt='poi icon'
												onClick={() => {
													dispatch(setCreateTripOrTripPlanningActive({ type: 'trip-planning' }));
													triggerCreateTripOrTripPlanningForm();
												}}
												className='cursor-pointer hover:filter hover:brightness-75 transition-all duration-300 relative right-10'
											/>
										) : (
											<Image
												src={tripPlanningIcon}
												width={22}
												height={22}
												alt='poi icon'
												onClick={() => {
													dispatch(setCreateTripOrTripPlanningActive({ type: 'trip-planning' }));
													triggerCreateTripOrTripPlanningForm();
												}}
												className='cursor-pointer hover:filter hover:brightness-75 transition-all duration-300 relative right-10'
											/>
										)}
									</Tooltip>
								</>
							) : null}
							{path === '/dashboard' ? (
								VehicleListType === 'trip' || VehicleListType === 'vehicle-allocation-trip' ? (
									<Tooltip title='Vehicle Listing' mouseEnterDelay={1}>
										<div
											className='cursor-pointer hover:filter hover:brightness-95 transition-all duration-300 relative right-10'
											onClick={() => {
												resetDashboardAndTripSystemState(dispatch);
												dispatch(setVehicleDetailsStatus({ type: 'vehicle' }));
												dispatch(setIsLoadingScreenActive(true));
												dispatch(setHistoryReplayModeToggle(true));
												dispatch(setCreateTripOrTripPlanningActive({ type: '' }));
												setTimeout(() => dispatch(setIsLoadingScreenActive(false)), 1);
											}}
										>
											<Image src={VehicleListIcon} alt='vehicle list icon' height={30} width={30} />
										</div>
									</Tooltip>
								) : (
									<Tooltip title='Trip System' mouseEnterDelay={1}>
										<div
											className='cursor-pointer hover:filter hover:brightness-95 transition-all duration-300 relative right-10'
											onClick={() => {
												resetDashboardAndTripSystemState(dispatch);
												dispatch(setVehicleDetailsStatus({ type: 'trip' }));
												dispatch(setCreateTripOrTripPlanningActive({ type: '' }));
												dispatch(setIsLoadingScreenActive(true));
												dispatch(setHistoryReplayModeToggle(true));
												setTimeout(() => dispatch(setIsLoadingScreenActive(false)), 1);
											}}
										>
											<Image src={TripSystemIcon} alt='trip system icon' height={30} width={30} />
										</div>
									</Tooltip>
								)
							) : null}

							{path === '/dashboard' ? <DashboardVehicleDetailsSelect selectedStyles={selectedStyles} /> : null}

							<GlobalSettings />
							<AlertNotifications userId={userId} parentUser={sysParentUser} />
						</>
					)}
					{userId === 87307 ? <DashboardCheckInSelect selectedStyles={selectedStyles} /> : null}
					<UserSettings />
				</div>
			</nav>
		</>
	);
};

export default TopNavbar;
