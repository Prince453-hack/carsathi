'use client';

import React, { useState } from 'react';
import { Button, Input, Select } from 'antd';
import {
	useAddElockAlertCommentMutation,
	useAddFuelAlertsMutation,
	useAddPanicAlertApprovalByControlRoomMutation,
	useAddTemperatureAlertCommentMutation,
	useLazyGetElockAlertsQuery,
	useLazyGetFuelAlertsQuery,
	useLazyGetPanicAlertsQuery,
	useLazyGetTemperatureAlertsQuery,
} from '@/app/_globalRedux/services/gtrac_newtracking';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import overspeedMap from '@/app/_assets/mapsimg/alerts/overspeedMap.png';
import poiAlert from '@/app/_assets/mapsimg/alerts/outOfRouteIcon.png';
import harshBreakMap from '@/app/_assets/mapsimg/alerts/harshBreakMap.png';
import harshAccelerationMap from '@/app/_assets/mapsimg/alerts/harshAccelerationMap.png';
import freeWheelMap from '@/app/_assets/mapsimg/alerts/freeWheelMap.png';
import mainPowerMap from '@/app/_assets/mapsimg/alerts/mainPowerMap.png';
import internalBatteryMap from '@/app/_assets/mapsimg/alerts/internalBatteryMap.png';
import idleIcon from '@/app/_assets/mapsimg/alerts/idleIcon.png';
import panic from '@/app/_assets/mapsimg/alerts/panic.svg';
import unlockOnMove from '@/app/_assets/mapsimg/alerts/unlock-on-move.svg';
import services from '@/app/_assets/mapsimg/alerts/services.svg';
import ac from '@/app/_assets/mapsimg/alerts/ac.svg';
import Image from 'next/image';
import document from '@/app/_assets/mapsimg/alerts/document.svg';
import { useAddNormalAlertCommentMutation, useLazyGetNormalAlertsQuery } from '@/app/_globalRedux/services/reactApi';
import type { AlertType } from '@/app/_globalRedux/services/types/alerts';
import { NotificationInstance } from 'antd/es/notification/interface';

interface NormalAlerts {
	[key: string]: any;
}

const normalAlerts: NormalAlerts = {
	['panic']: panic,
	['idle']: idleIcon,
	['unlockonmove']: unlockOnMove,
	['idling']: idleIcon,
	['overspeed']: overspeedMap,
	['mainpowerdisconnected']: mainPowerMap,
	['mainpowerdisconnect']: mainPowerMap,
	['mainpowerconnected']: mainPowerMap,
	['internalbatterydisconnected']: internalBatteryMap,
	['internalbatteryconnected']: internalBatteryMap,
	['poscooverspeed']: overspeedMap,
	['freewheeling']: freeWheelMap,
	['harshbreaking']: harshBreakMap,
	['harshaccleration']: harshAccelerationMap,
	['services']: services,
	['document']: document,
	['ac']: ac,
	['poialert']: poiAlert,
};

const temperatureSelectOptions = [
	{ value: 'Refer Issue', label: 'Refer Issue' },
	{ value: 'Sensor Issue', label: 'Sensor Issue' },
	{ value: 'Lack of fuel', label: 'Lack of fuel' },
	{ value: 'Driver is not maintaining', label: 'Driver is not maintaining' },
	{ value: 'Multiple Unloading/ Loading', label: 'Multiple Unloading/ Loading' },
	{ value: 'Trip completed', label: 'Trip completed' },
	{ value: 'Trip didnot start', label: 'Trip didnot start' },
	{ value: 'Accident', label: 'Accident' },
	{ value: 'Temperature Maintained', label: 'Temperature Maintained' },
	{ value: 'Reefer Defrost', label: 'Reefer Defrost' },
	{ value: 'Dry Load', label: 'Dry Load' },
	{ value: 'GPS issue', label: 'GPS issue' },
	{ value: 'Other', label: 'Other' },
];

const fuelSelectOptions = [
	{ value: 'Fueling OK', label: 'Fueling OK' },
	{ value: 'Driver Negligence', label: 'Driver Negligence' },
	{ value: 'Route Issue', label: 'Route Issue' },
	{ value: 'Outside Route', label: 'Outside Route' },
	{ value: 'No Entry', label: 'No Entry' },
	{ value: 'Pump Closed', label: 'Pump Closed' },
	{ value: 'GPS issue', label: 'GPS issue' },
	{ value: 'Others', label: 'Others' },
];
export const AlertNotificationCard = ({
	alertId,
	vehicleNumber,
	title,
	description,
	vehicleId,
	alertType,
	dateTime,
	type,
	popup,
	api,
	key,
	changeOpenNotificationIndexState,
	from,
	fetchUpdatedAlerts,
}: {
	alertId: string;
	vehicleNumber: string;
	title?: string;
	description: string;
	vehicleId?: string;
	alertType?: string;
	dateTime?: string;
	type: string;
	popup?: boolean;
	api?: NotificationInstance;
	key?: string;
	changeOpenNotificationIndexState?: () => void;
	from?: string;
	fetchUpdatedAlerts?: () => void;
}) => {
	const { userId, groupId, parentUser, accessLabel, userName } = useSelector((state: RootState) => state.auth);

	const [expandState, setExpandState] = useState(popup ? true : false);
	const [commentInputActive, setCommentInputActive] = useState(popup && type !== 'Normal' ? true : false);
	const [isCommentLoading, setIsCommentLoading] = useState(false);

	const [commentInputValue, setCommentInputValue] = useState('');
	const [temperatureAlertSelectValue, setTemperatureAlertSelectValue] = useState('');

	const [getElockAlerts] = useLazyGetElockAlertsQuery();
	const [getTempAlerts] = useLazyGetTemperatureAlertsQuery();
	const [getPanicAlerts] = useLazyGetPanicAlertsQuery();
	const [getFuelAlerts] = useLazyGetFuelAlertsQuery();
	const [getNormalAlerts] = useLazyGetNormalAlertsQuery();

	const [addElockAlertComment] = useAddElockAlertCommentMutation();
	const [addTempAlertCommnet] = useAddTemperatureAlertCommentMutation();
	const [addPanicAlertApprovalByControlRoom] = useAddPanicAlertApprovalByControlRoomMutation();
	const [addFuelAlert] = useAddFuelAlertsMutation();
	const [addNormalAlertComment] = useAddNormalAlertCommentMutation();

	const handleCommentSubmit = async () => {
		setIsCommentLoading(true);
		if (type === 'Temperature') {
			await addTempAlertCommnet({
				token: groupId,
				userId: userId,
				puserId: parentUser,
				body: {
					veh_no: vehicleNumber,
					comment: temperatureAlertSelectValue,
					username: userId,
					close_time_msg: commentInputValue,
					alert_id: Number(alertId),
				},
			}).then(() => {
				if (changeOpenNotificationIndexState && api) {
					api.destroy(key);
					changeOpenNotificationIndexState();
				}
				getTempAlerts({ token: groupId, userId: userId, puserId: parentUser });
			});
		} else if (type === 'Elock') {
			if (accessLabel === 6 && title) {
				await addElockAlertComment({
					token: groupId,
					userId: userId,
					puserId: parentUser,
					body: {
						id: Number(alertId),
						remarks: commentInputValue,
						title: title,
						veh_id: Number(vehicleId),
					},
				}).then(() => {
					if (changeOpenNotificationIndexState && api) {
						api.destroy(key);
						changeOpenNotificationIndexState();
					}
					getElockAlerts({ token: groupId, userId: userId, puserId: parentUser });
				});
			}
		} else if (type === 'Panic') {
			await addPanicAlertApprovalByControlRoom({
				token: groupId,
				userId: userId,
				puserId: parentUser,
				body: {
					comment: 'Approved by Control Room',
					username: userName,
					veh_no: vehicleNumber,
				},
			}).then(() => {
				if (changeOpenNotificationIndexState && api) {
					api.destroy(key);
					changeOpenNotificationIndexState();
				}
				getPanicAlerts({ token: groupId, userId: userId, puserId: parentUser });
			});
		} else if (type === 'Fuel') {
			await addFuelAlert({
				token: groupId,
				userId: userId,
				puserId: parentUser,
				body: {
					veh_no: vehicleNumber,
					comment: commentInputValue,
					username: userId,
				},
			}).then(() => {
				if (changeOpenNotificationIndexState && api) {
					api.destroy(key);
					changeOpenNotificationIndexState();
				}
				getFuelAlerts({ token: groupId, userId: userId, puserId: parentUser });
			});
		} else if (type === 'Idle') {
			await addNormalAlertComment({
				token: Number(groupId),
				remark: commentInputValue,
				issue: '',
				service_id: Number(vehicleId),
				alert_type: 'idle' as AlertType.idle,
			}).then(() => {
				if (changeOpenNotificationIndexState && api) {
					api.destroy(key);
					changeOpenNotificationIndexState();
				}
				if (from === 'ALERTS_TABLE' && fetchUpdatedAlerts) {
					fetchUpdatedAlerts();
				} else {
					getNormalAlerts({ token: Number(groupId) === 5267 ? 6364 : Number(groupId) });
				}
			});
		}

		setCommentInputValue('');
		setTemperatureAlertSelectValue('');
		setIsCommentLoading(false);
		setCommentInputActive(false);
	};

	const options = [
		{
			label: 'Refer Issue',
			value: 'Refer Issue',
		},
		{
			label: 'Sensor Issue',
			value: 'Sensor Issue',
		},
		{
			label: 'Lack of fuel',
			value: 'Lack of fuel',
		},
		{
			label: 'Driver is not maintaining',
			value: 'Driver is not maintaining',
		},
		{
			label: 'Multiple Unloading/ Loading',
			value: 'Multiple Unloading/ Loading',
		},
		{
			label: 'Trip completed',
			value: 'Trip completed',
		},
		{
			label: 'Trip didnot start',
			value: 'Trip didnot start',
		},
		{
			label: 'Accident',
			value: 'Accident',
		},
		{
			label: 'Temperature Maintained',
			value: 'Temperature Maintained',
		},
		{
			label: 'Reefer Defrost',
			value: 'Reefer Defrost',
		},
		{
			label: 'Dry Load',
			value: 'Dry Load',
		},
		{
			label: 'Other',
			value: 'Other',
		},
	];

	return (
		<div className={`${type !== 'Normal' ? 'min-h-[90px]' : ''} relative`}>
			<div className={`${type !== 'Normal' ? 'flex items-start gap-2' : ''}`}>
				{type !== 'Normal' ? (
					<div
						className={`${
							type === 'Temperature' ? 'bg-blue-500' : type === 'Panic' ? 'bg-red-700' : 'bg-yellow-500'
						} mt-1 rounded-full min-w-10 max-w-10 min-h-10 max-h-10 flex justify-center items-center text-white font-medium text-lg`}
					>
						<div>{type[0]}</div>
					</div>
				) : (
					<>
						<div className='flex items-start gap-2'>
							<div className='mt-2'>
								<i>
									{alertType ? (
										<Image
											width={40}
											height={40}
											src={normalAlerts[alertType?.replaceAll(' ', '').toLowerCase()]}
											alt='alert icon'
											className='min-w-10 max-w-10 max-h-10 min-h-10'
										/>
									) : null}
								</i>
							</div>
							<div>
								<div className='flex justify-between items-center'>
									<p className='text-base font-bold '>{alertType}</p>
									{(popup && type !== 'Normal') || popup === false ? (
										<div>
											<p className='text-base font-semibold text-nowrap'>{vehicleNumber}</p>
										</div>
									) : null}
								</div>
								<div className={`mt-1 text-neutral-600 ${type !== 'Normal' ? 'w-[calc(100%-60px)]' : ''}`}>{description}</div>
							</div>
						</div>
						<p className='text-xs text-gray-500 text-right font-bold mt-3'>{dateTime}</p>
					</>
				)}
				<div className='w-full'>
					{title ? (
						<div className='flex justify-between items-center w-full'>
							<div dangerouslySetInnerHTML={{ __html: title }} />
							<div className='font-bold text-base'>{vehicleNumber}</div>
						</div>
					) : null}
					{type === 'Temperature' ? (
						<div className='mt-1 text-neutral-600 w-[calc(100%-60px)]'>
							<div dangerouslySetInnerHTML={{ __html: description }} />
						</div>
					) : type !== 'Normal' ? (
						<div className={`mt-1 text-neutral-600 w-[calc(100%-60px)]`}>
							{type === 'Elock' ? <p className='font-semibold text-neutral-500'>{dateTime}</p> : ''}
							{expandState ? description : description.slice(0, 50)}
							<span onClick={() => setExpandState(!expandState)} className='font-medium text-primary-green'>
								{description.length > 50 && !expandState ? '...' : ''}
							</span>
							<span onClick={() => setExpandState(!expandState)} className='font-medium text-primary-green cursor-pointer '>
								{description.length > 50 && !expandState ? 'show more' : description.length > 50 && expandState && !popup ? ' show less' : ''}
							</span>
						</div>
					) : (
						''
					)}
				</div>
			</div>
			{commentInputActive ? (
				<div className='ml-10 mt-2'>
					{type === 'Temperature' || type === 'Fuel' ? (
						<div className='mt-5'>
							<Select
								defaultValue={'Refer Issue'}
								onChange={(value) => setTemperatureAlertSelectValue(value)}
								placeholder='Select Reason'
								className='w-full'
								options={type === 'Temperature' ? temperatureSelectOptions : fuelSelectOptions}
								getPopupContainer={(triggerNode) => triggerNode.parentNode}
							></Select>
						</div>
					) : null}
					<div className='mt-2'>
						<Input
							type='text'
							variant='borderless'
							placeholder='Add Comment'
							value={commentInputValue}
							onChange={(e) => setCommentInputValue(e.target.value)}
						/>
					</div>
				</div>
			) : null}

			{type === 'Normal' || type === 'Panic' ? null : (
				<>
					<div className='h-[40px] w-full'></div>
					<div className={`absolute bottom-0 w-full flex justify-end items-center gap-4 text-sm font-medium`}>
						{commentInputActive ? (
							<>
								{popup ? null : (
									<Button type='default' onClick={() => setCommentInputActive((prev) => !prev)}>
										Cancel
									</Button>
								)}
								<Button type='primary' onClick={async () => await handleCommentSubmit()} loading={isCommentLoading}>
									Submit
								</Button>
							</>
						) : (
							<Button type='default' onClick={() => setCommentInputActive((prev) => !prev)}>
								Comment
							</Button>
						)}
					</div>
				</>
			)}
			{type === 'Panic' ? (
				<div className='w-full flex justify-end gap-2 mt-8'>
					<Button type='primary' onClick={async () => await handleCommentSubmit()} loading={isCommentLoading}>
						Accepted By Control Room
					</Button>
				</div>
			) : null}
		</div>
	);
};
