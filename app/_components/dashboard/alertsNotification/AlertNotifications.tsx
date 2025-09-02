'use client';

import { Badge, ConfigProvider, notification } from 'antd';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import alertsRed from '@/public/assets/svgs/nav/alertsRed.svg';
import Image from 'next/image';
import { AlertNotificationsList } from './AlertNotificationsList';
import {
	useGetElockAlertsQuery,
	useGetFuelAlertsQuery,
	useGetPanicAlertsQuery,
	useGetTemperatureAlertsQuery,
} from '@/app/_globalRedux/services/gtrac_newtracking';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import { useGetNormalAlertsQuery } from '@/app/_globalRedux/services/reactApi';
import { GetAlertsPopupsResponse } from '@/app/_globalRedux/services/types/alerts';
import ReactHowler from 'react-howler';
import { AlertNotificationCard } from './AlertNotificationCard';
import { NotificationInstance } from 'antd/es/notification/interface';
import { AlertTwoTone, CloseCircleOutlined, setTwoToneColor } from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { useGetUserAlertsQuery } from '@/app/_globalRedux/services/yatayaat';
const checkIfUserNeedsAlerts = (userId: number, parentUser: number) => {
	if (
		userId === 3097 ||
		userId === 3117 ||
		userId === 3165 ||
		userId === 3189 ||
		userId === 3212 ||
		userId === 3317 ||
		userId === 3358 ||
		userId === 3358 ||
		userId === 4071 ||
		userId === 4071 ||
		userId == 87305 ||
		userId === 5360 ||
		userId === 5459 ||
		userId === 6258 ||
		userId === 7351 ||
		userId === 7351 ||
		userId === 81023 ||
		userId === 81491 ||
		userId === 81544 ||
		userId === 81715 ||
		userId === 83199 ||
		userId === 83213 ||
		userId === 83636 ||
		userId === 84477 ||
		userId === 84550 ||
		userId === 84712 ||
		userId === 84712 ||
		userId === 85013 ||
		userId === 85013 ||
		userId === 85086 ||
		userId === 85097 ||
		userId === 85380 ||
		userId === 85682 ||
		userId === 86085 ||
		userId === 86736 ||
		userId === 86760 ||
		userId === 86760 ||
		userId === 86760 ||
		userId === 86764 ||
		userId === 86913 ||
		userId === 6347 ||
		userId === 3356 ||
		parentUser === 3356 ||
		userId === 87470 ||
		parentUser === 87470 ||
		userId === 83459 ||
		userId === 85182 ||
		userId === 84435
	) {
		return true;
	} else {
		return false;
	}
};

export const openNotification = ({
	description,
	vehicleNumber,
	title,
	type,
	alertId,
	vehicleId,
	dateTime,
	alertType,
	key,
	api,
	setOpenNotificationIndex,
	openNotificationIndex,
	setIsAlertPopupActive,
	dataLength,
	from,
	fetchUpdatedAlerts,
}: {
	description: string;
	vehicleNumber: string;
	title?: string;
	type?: 'Panic' | 'Elock' | 'Temperature' | 'Fuel' | 'Idle' | 'Normal';
	alertId?: string;
	vehicleId?: string;
	dateTime?: string;
	alertType?: string;
	key: string;
	api: NotificationInstance;
	setOpenNotificationIndex?: Dispatch<
		SetStateAction<{
			Elock: number;
			Temperature: number;
			Panic: number;
			Fuel: number;
			Idle: number;
			Normal: number;
		}>
	>;
	openNotificationIndex?: {
		Elock: number;
		Temperature: number;
		Panic: number;
		Fuel: number;
		Idle: number;
		Normal: number;
	};
	setIsAlertPopupActive?: Dispatch<SetStateAction<boolean>>;
	dataLength?: number;
	from?: string;
	fetchUpdatedAlerts?: () => void;
}) => {
	const changeOpenNotificationIndexState = () => {
		if (openNotificationIndex && setOpenNotificationIndex && setIsAlertPopupActive && dataLength) {
			if (type) {
				if (openNotificationIndex[type] < dataLength - 1) {
					setOpenNotificationIndex((prev) => ({ ...prev, [type]: prev[type] + 1 }));
				} else {
					setOpenNotificationIndex((prev) => ({ ...prev, [type]: -1 }));
				}
			}

			const totalActivePopups = openNotificationIndex.Elock + openNotificationIndex.Temperature + openNotificationIndex.Panic;
			if (totalActivePopups >= dataLength - 1) {
				setIsAlertPopupActive((prev) => !prev);
			}
		}
	};

	api.open({
		description: (
			<AlertNotificationCard
				description={description}
				vehicleNumber={vehicleNumber}
				alertId={alertId ? alertId : ''}
				type={type ? type : ''}
				vehicleId={vehicleId ? vehicleId : ''}
				dateTime={dateTime ? dateTime : ''}
				alertType={alertType ? alertType : ''}
				title={title ? title : ''}
				popup={true}
				api={api}
				key={key}
				changeOpenNotificationIndexState={changeOpenNotificationIndexState}
				from={from}
				fetchUpdatedAlerts={fetchUpdatedAlerts}
			/>
		),
		message: '',
		closeIcon: (
			<div className='text-xl mb-10 mt-4 w-full' onClick={() => changeOpenNotificationIndexState()}>
				<CloseCircleOutlined />
			</div>
		),
		duration: 0,
		placement: 'bottomRight',
		key,
		onClose: () => {
			api.destroy(key);
		},
	});
};

const AlertNotifications = ({ userId, parentUser }: { userId: string; parentUser: string }) => {
	const { groupId, accessLabel } = useSelector((state: RootState) => state.auth);
	const pathname = usePathname();

	const [open, setOpen] = useState(false);
	const [totalAlerts, setTotalAlerts] = useState(0);
	const [isAudioPlaying, setIsAudioPlaying] = useState(false);
	const [openNotificationIndex, setOpenNotificationIndex] = useState({
		Elock: -1,
		Temperature: -1,
		Panic: -1,
		Fuel: -1,
		Normal: -1,
		Idle: -1,
	});

	const [isAlertPopupActive, setIsAlertPopupActive] = useState(true);
	const isUser3356Or82815 = Number(userId) === 3356 || Number(userId) === 82815;
	const isParentUser3356Or82815 = Number(parentUser) === 3356 || Number(parentUser) === 82815;

	const [api, notificationContextHolder] = notification.useNotification({
		duration: 0,
		placement: 'bottomRight',
		maxCount: 1,
	});

	const [data, setData] = useState<{
		elockAlerts: ElockAlertsResponse[];
		temperatureAlerts: TemperatureAlertsResponse[];
		fuelAlerts: FuelAlertsResponse[];
		panicAlerts: PanicAlertResponse[];
		normalAlerts: GetAlertsPopupsResponse[];
	}>({
		elockAlerts: [],
		temperatureAlerts: [],
		fuelAlerts: [],
		panicAlerts: [],
		normalAlerts: [],
	});

	const {
		data: alertsByUserData,
		isLoading: isGetAlertByUserDataLoading,
		isUninitialized: isAlertsByUserDataUninitialized,
	} = useGetUserAlertsQuery({ token: groupId, userId: userId }, { skip: !groupId || !userId });

	const elockLoading = useSelector((state: RootState) =>
		Object.values(state['gtrac-newtracking'].queries).some((query) => query && query.endpointName === 'getElockAlerts' && query.status === 'pending')
	);

	const { data: alertsElockRes, isFetching: isElockLoading } = useGetElockAlertsQuery(
		{
			token: groupId,
			userId: userId,
			puserId: parentUser,
		},
		{
			pollingInterval: Number(userId) === 87305 ? 30000 : 120000,
			skip: !groupId || !userId || !parentUser || accessLabel !== 6 || !checkIfUserNeedsAlerts(Number(userId), Number(parentUser)) || elockLoading,
		}
	);

	const { data: alertsTempRes } = useGetTemperatureAlertsQuery(
		{
			token: groupId,
			userId: userId,
			puserId: parentUser,
		},
		{
			pollingInterval: 120000,
			skip: !groupId || !userId || !parentUser || Number(groupId) !== 6255 || !checkIfUserNeedsAlerts(Number(userId), Number(parentUser)),
		}
	);

	const { data: alertsPanicRes } = useGetPanicAlertsQuery(
		{
			token: groupId,
			userId: userId,
			puserId: parentUser,
		},
		{
			pollingInterval: 120000,
			skip: !groupId || !userId || !parentUser || !checkIfUserNeedsAlerts(Number(userId), Number(parentUser)),
		}
	);

	const { data: alertsFuelRes } = useGetFuelAlertsQuery(
		{
			token: groupId,
			userId: userId,
			puserId: parentUser,
		},
		{
			pollingInterval: 120000,
			skip: !groupId || !userId || !parentUser || Number(groupId) !== 6255,
		}
	);

	const { data: alertsNormalRes } = useGetNormalAlertsQuery(
		{ token: Number(groupId) === 5267 ? 6364 : Number(groupId) },
		{
			pollingInterval: 120000,
			skipPollingIfUnfocused: true,
			skip: !groupId || isAlertsByUserDataUninitialized || isGetAlertByUserDataLoading || alertsByUserData?.length === 0,
		}
	);

	const openNotificationFn = (isOpenNotificationIndexStateChanged?: boolean) => {
		let tempTotalAlerts =
			(alertsElockRes && !alertsElockRes[0]?.status ? alertsElockRes.length : 0) +
			(alertsTempRes && !alertsTempRes[0]?.status ? alertsTempRes.length : 0) +
			(alertsPanicRes && !alertsPanicRes[0]?.status ? alertsPanicRes.length : 0) +
			(alertsNormalRes && !alertsNormalRes[0]?.status ? alertsNormalRes.length : 0) +
			(alertsFuelRes && !alertsFuelRes[0]?.status ? alertsFuelRes.length : 0);

		if (
			Array.isArray(data.elockAlerts) ||
			Array.isArray(data.temperatureAlerts) ||
			Array.isArray(data.panicAlerts) ||
			Array.isArray(data.normalAlerts) ||
			Array.isArray(data.fuelAlerts)
		) {
			if (totalAlerts !== tempTotalAlerts || isOpenNotificationIndexStateChanged) {
				setTimeout(() => {
					if (data.normalAlerts.length > 0 && openNotificationIndex.Idle !== -1) {
						const normalData = data.normalAlerts[openNotificationIndex.Idle];

						if (normalData.alert_type === 'idle') {
							openNotification({
								description: normalData.msg,
								vehicleNumber: normalData.vehicleno,
								title: 'Idle',
								type: 'Idle',
								alertId: normalData.alert_id,
								vehicleId: normalData.sys_service_id,
								dateTime: normalData.datetime,
								api: api,
								setOpenNotificationIndex: setOpenNotificationIndex,
								openNotificationIndex: openNotificationIndex,
								setIsAlertPopupActive: setIsAlertPopupActive,
								key: normalData.alert_id + openNotificationIndex.Idle,
								dataLength: data.normalAlerts.length,
							});
						} else if (normalData.alert_type === 'POI Alert') {
							openNotification({
								description: normalData.msg,
								vehicleNumber: normalData.vehicleno,
								title: 'POI Alert',
								type: 'Normal',
								alertId: normalData.alert_id,
								vehicleId: normalData.sys_service_id,
								dateTime: normalData.datetime,
								api: api,
								setOpenNotificationIndex: setOpenNotificationIndex,
								openNotificationIndex: openNotificationIndex,
								setIsAlertPopupActive: setIsAlertPopupActive,
								key: normalData.alert_id + openNotificationIndex.Idle,
								dataLength: data.normalAlerts.length,
							});
						}
					}

					if (data.elockAlerts.length > 0 && openNotificationIndex.Elock !== -1) {
						const elockData = data.elockAlerts[openNotificationIndex.Elock];
						openNotification({
							description: elockData.description,
							vehicleNumber: elockData.vehicle_no,
							title: elockData.title,
							type: 'Elock',
							alertId: elockData.id,
							vehicleId: elockData.veh_id,
							dateTime: elockData.log_time,
							api: api,
							setOpenNotificationIndex: setOpenNotificationIndex,
							openNotificationIndex: openNotificationIndex,
							setIsAlertPopupActive: setIsAlertPopupActive,
							key: elockData.id + openNotificationIndex.Elock,
							dataLength: data.elockAlerts.length,
						});
					}

					if (data.temperatureAlerts.length > 0 && openNotificationIndex.Temperature !== -1) {
						const temperatureData = data.temperatureAlerts[openNotificationIndex.Temperature];
						openNotification({
							description: temperatureData.msg,
							vehicleNumber: temperatureData.idle_vehicle,
							type: 'Temperature',
							alertId: temperatureData.id,
							api: api,
							setOpenNotificationIndex: setOpenNotificationIndex,
							openNotificationIndex: openNotificationIndex,
							setIsAlertPopupActive: setIsAlertPopupActive,
							key: temperatureData.id + openNotificationIndex.Temperature,
							dataLength: data.temperatureAlerts.length,
						});
					}

					if (data.panicAlerts.length > 0 && openNotificationIndex.Panic !== -1) {
						const panicData = data.panicAlerts[openNotificationIndex.Panic];
						openNotification({
							description: panicData.msg,
							vehicleNumber: panicData.idle_vehicle,
							type: 'Panic',
							alertId: panicData.id,
							alertType: 'Panic',
							api: api,
							setOpenNotificationIndex: setOpenNotificationIndex,
							openNotificationIndex: openNotificationIndex,
							setIsAlertPopupActive: setIsAlertPopupActive,
							key: panicData.id + openNotificationIndex.Panic,
							dataLength: data.panicAlerts.length,
						});
					}
					if (data.fuelAlerts.length > 0 && openNotificationIndex.Fuel !== -1) {
						const fuelData = data.fuelAlerts[openNotificationIndex.Fuel];
						openNotification({
							description: fuelData.msg,
							vehicleNumber: fuelData.idle_vehicle,
							type: 'Fuel',
							alertId: fuelData.id,
							alertType: 'Fuel',
							api: api,
							setOpenNotificationIndex: setOpenNotificationIndex,
							openNotificationIndex: openNotificationIndex,
							setIsAlertPopupActive: setIsAlertPopupActive,
							key: fuelData.id + openNotificationIndex.Fuel,
							dataLength: data.fuelAlerts.length,
						});
					}

					if (!isOpenNotificationIndexStateChanged) {
						setIsAudioPlaying(true);

						setTimeout(() => {
							setIsAudioPlaying(false);
						}, 15000);

						setTotalAlerts(tempTotalAlerts);
					}
				}, 500);
			}
		}
	};

	useEffect(() => {
		if (alertsElockRes || alertsTempRes || alertsNormalRes) {
			setData({
				elockAlerts: alertsElockRes && !alertsElockRes[0]?.status ? alertsElockRes : [],
				temperatureAlerts: alertsTempRes && !alertsTempRes[0]?.status ? alertsTempRes : [],
				fuelAlerts: alertsFuelRes && !alertsFuelRes[0]?.status ? alertsFuelRes : [],
				panicAlerts: alertsPanicRes && !alertsPanicRes[0]?.status ? alertsPanicRes : [],
				normalAlerts: alertsNormalRes && !alertsNormalRes[0]?.status ? alertsNormalRes : [],
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alertsElockRes, alertsTempRes, alertsNormalRes, alertsPanicRes, isElockLoading]);

	useEffect(() => {
		setOpenNotificationIndex({ Elock: 0, Temperature: 0, Panic: 0, Fuel: 0, Idle: 0, Normal: 0 });
		openNotificationFn();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	useEffect(() => {
		openNotificationFn(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openNotificationIndex]);

	setTwoToneColor(isAlertPopupActive ? '#000' : '#468B83');

	return (
		<ConfigProvider
			theme={{
				components: {
					Notification: {
						width: 500,
						zIndexPopup: open ? -9999 : 9999,
					},
				},
			}}
		>
			<div
				className={`selection:text-xl absolute top-[10px] ${
					(!isUser3356Or82815 && !isParentUser3356Or82815) || Number(userId) === 87470 ? 'right-[170px]' : 'right-[120px]'
				}  ${isAlertPopupActive ? 'shadow' : ''} bg-white py-2 px-3 rounded-full cursor-pointer`}
				onClick={() => {
					if (!isAlertPopupActive) {
						setOpenNotificationIndex({ Elock: 0, Temperature: 0, Panic: 0, Fuel: 0, Idle: 0, Normal: 0 });
						openNotificationFn();
					}
					setIsAlertPopupActive((prev) => !prev);
				}}
			>
				<AlertTwoTone />
			</div>
			{isAlertPopupActive ? notificationContextHolder : null}

			{(!isUser3356Or82815 && !isParentUser3356Or82815) || Number(userId) === 87470 ? (
				<>
					<div className='rounded-full border-primary-red border-2 relative z-20' onClick={() => setOpen((prev) => !prev)}>
						<ReactHowler src='https://gtrac.in/newtracking/images/red_alert.mp3' playing={isAudioPlaying} />
						<div className='rounded-full border-white border-2 cursor-pointer h-[28px]'>
							<Badge
								count={totalAlerts}
								overflowCount={90}
								offset={totalAlerts > 0 && totalAlerts > 10 ? ['-29', '0'] : ['-29', '0']}
								showZero={false}
								className='z-20'
							>
								<Image src={alertsRed} width={24} height={24} alt='alerts icon' className='-mb-[6px]' />
							</Badge>
						</div>
					</div>

					<AlertNotificationsList open={open} setOpen={setOpen} data={data} totalAlerts={totalAlerts} />
				</>
			) : null}
		</ConfigProvider>
	);
};

export default AlertNotifications;
