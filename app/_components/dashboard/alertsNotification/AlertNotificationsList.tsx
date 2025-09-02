'use client';

import { ConfigProvider, Drawer, Skeleton, Tooltip } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import type { DrawerClassNames, DrawerStyles } from 'antd/es/drawer/DrawerPanel';
import { AlertNotificationCard } from './AlertNotificationCard';
import { GetAlertsPopupsResponse } from '@/app/_globalRedux/services/types/alerts';
import { DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import { useDeleteAllAlertNotificationsMutation } from '@/app/_globalRedux/services/yatayaat';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import React from 'react';
import { useInView } from 'react-intersection-observer';

const useStyle = createStyles(({ token }) => ({
	'my-drawer-body': {
		background: '#F2F5F3',
	},
	'my-drawer-mask': {
		boxShadow: `inset 0 0 15px #fff`,
	},
	'my-drawer-header': {
		background: '#F2F5F3',
		fontSize: '30px !important',
	},
	'my-drawer-footer': {
		color: token.colorPrimary,
	},
	'my-drawer-content': {
		// borderLeft: '2px dotted #333',
	},
}));

export const AlertNotificationsList = ({
	open,
	setOpen,
	data,
	totalAlerts,
}: {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	data: {
		elockAlerts: ElockAlertsResponse[];
		temperatureAlerts: TemperatureAlertsResponse[];
		fuelAlerts: FuelAlertsResponse[];
		normalAlerts: GetAlertsPopupsResponse[];
		panicAlerts: PanicAlertResponse[];
	};
	totalAlerts: number;
}) => {
	const { styles } = useStyle();
	const token = useTheme();
	const { groupId, accessLabel } = useSelector((state: RootState) => state.auth);
	const [deleteAlerts] = useDeleteAllAlertNotificationsMutation();

	const [visibleAlerts, setVisibleAlerts] = useState(20);
	const observerRef = useRef<HTMLDivElement | null>(null);

	const classNames: DrawerClassNames = {
		body: styles['my-drawer-body'],
		mask: styles['my-drawer-mask'],
		header: styles['my-drawer-header'],
		footer: styles['my-drawer-footer'],
		content: styles['my-drawer-content'],
	};

	const drawerStyles: DrawerStyles = {
		mask: {
			// backdropFilter: 'blur(1px)',
		},
		content: {
			boxShadow: '-5px 0 10px #777',
		},
		header: {
			background: '#F2F5F3',
			fontSize: token.fontSizeXL,
			border: 0,
		},
		body: {
			// fontSize: token.fontSizeLG,
			padding: 0,
		},
		footer: {
			// borderTop: `1px solid ${token.colorBorder}`,
		},
	};

	const getVisibleData = (alerts: any[]) => {
		return alerts.slice(0, visibleAlerts);
	};

	const [ref, inView] = useInView({
		threshold: 0,
	});

	useEffect(() => {
		if (inView) {
			setVisibleAlerts((prev) => prev + 20);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inView]);

	return (
		<ConfigProvider
			drawer={{
				classNames,
				styles: drawerStyles,
			}}
		>
			<Drawer
				title={
					<>
						<div className='flex justify-between items-center'>
							<div className='flex items-end gap-2'>
								<p className='text-xl'>Alert Notifications</p>
							</div>
							<div className='flex gap-2.5 items-center'>
								<Tooltip title='Clear Alerts' className='text-lg cursor-pointer' mouseEnterDelay={1}>
									<DeleteOutlined onClick={() => deleteAlerts({ token: groupId })} className='hover:opacity-75 transition-opacity duration-300' />
								</Tooltip>
								<Tooltip title='Go to Alert Reports' className='text-lg cursor-pointer' mouseEnterDelay={1}>
									<a href={accessLabel === 6 ? '/dashboard/elock-alerts' : '/dashboard/alerts'} target='_blank' referrerPolicy='no-referrer'>
										<ExportOutlined />
									</a>
								</Tooltip>
							</div>
						</div>
						<div>
							<p className='text-xs text-neutral-500'>Alerts Count - {totalAlerts}</p>
						</div>
					</>
				}
				placement='right'
				onClose={() => {
					setVisibleAlerts(20);
					setOpen(false);
				}}
				open={open}
				width={500}
				id='alert-notification-drawer'
			>
				<div>
					{data.panicAlerts.length ? (
						<div className='flex items-center'>
							<div className='h-[1px] bg-gray-300 w-full'></div>
							<p className='py-3 font-semibold text-gray-600 text-sm min-w-[140px] text-center'>Panic Alerts</p>
							<div className='h-[1px] bg-gray-300 w-full'></div>
						</div>
					) : (
						''
					)}
					{data.panicAlerts.length
						? getVisibleData(data.panicAlerts).map((alert, index) => (
								<div key={alert.id + index} className={`py-3 px-6  ${index !== data.temperatureAlerts.length - 1 && 'border-b'}`}>
									<AlertNotificationCard
										description={alert.msg}
										alertId={alert.id}
										type={'Panic'}
										vehicleNumber={alert.idle_vehicle}
										alertType={'Panic'}
									/>
								</div>
						  ))
						: ''}
				</div>
				<div>
					{data.elockAlerts.length ? (
						<div className='flex items-center'>
							<div className='h-[1px] bg-gray-300 w-full'></div>
							<p className='py-3 font-semibold text-gray-600 text-sm min-w-[140px] text-center'>Elock Alerts</p>
							<div className='h-[1px] bg-gray-300 w-full'></div>
						</div>
					) : (
						''
					)}
					{data.elockAlerts.length
						? getVisibleData(data.elockAlerts).map((alert, index) => (
								<div key={alert.id + index} className={`py-3 px-6  ${index !== data.temperatureAlerts.length - 1 && 'border-b'}`}>
									<AlertNotificationCard
										title={alert.title}
										description={alert.description}
										alertId={alert.id}
										type={'Elock'}
										vehicleNumber={alert.vehicle_no}
										vehicleId={alert.veh_id}
										dateTime={alert.log_time}
									/>
								</div>
						  ))
						: ''}
				</div>
				<div>
					{data.temperatureAlerts.length ? (
						<div className='flex items-center'>
							<div className='h-[1px] bg-gray-300 w-full'></div>
							<p className='py-3 font-semibold text-gray-600 text-sm min-w-[140px] text-center'>Temperature Alerts</p>
							<div className='h-[1px] bg-gray-300 w-full'></div>
						</div>
					) : (
						''
					)}
					{data.temperatureAlerts.length
						? getVisibleData(data.temperatureAlerts).map((alert, index) => (
								<div key={alert.id + index} className={`py-3 px-6  ${index !== data.temperatureAlerts.length - 1 && 'border-b'}`}>
									<AlertNotificationCard description={alert.msg} alertId={alert.id} type={'Temperature'} vehicleNumber={alert.idle_vehicle} />
								</div>
						  ))
						: ''}
				</div>

				<div>
					{data.fuelAlerts.length ? (
						<div className='flex items-center'>
							<div className='h-[1px] bg-gray-300 w-full'></div>
							<p className='py-3 font-semibold text-gray-600 text-sm min-w-[140px] text-center'>Fuel Alerts</p>
							<div className='h-[1px] bg-gray-300 w-full'></div>
						</div>
					) : (
						''
					)}
					{data.fuelAlerts.length
						? getVisibleData(data.fuelAlerts).map((alert, index) => (
								<div key={alert.id + index} className={`py-3 px-6  ${index !== data.fuelAlerts.length - 1 && 'border-b'}`}>
									<AlertNotificationCard description={alert.msg} alertId={alert.id} type={'Fuel'} vehicleNumber={alert.idle_vehicle} />
								</div>
						  ))
						: ''}
				</div>

				<div>
					{data.normalAlerts.length ? (
						<div className='flex items-center'>
							<div className='h-[1px] bg-gray-300 w-full'></div>
							<p className='py-3 font-semibold text-gray-600 text-sm min-w-[140px] text-center'>Alerts</p>
							<div className='h-[1px] bg-gray-300 w-full'></div>
						</div>
					) : (
						''
					)}
					{data.normalAlerts.length
						? getVisibleData(data.normalAlerts).map((alert, index) => (
								<div key={alert.alert_id + index} className={`py-3 px-6  ${index !== data.temperatureAlerts.length - 1 && 'border-b'}`}>
									<AlertNotificationCard
										description={alert.msg}
										alertId={alert.alert_id}
										type={'Normal'}
										vehicleNumber={alert.vehicleno}
										alertType={alert.alert_type}
										dateTime={alert.datetime}
									/>
								</div>
						  ))
						: ''}
				</div>

				{visibleAlerts <= data.normalAlerts.length ||
				visibleAlerts <= data.panicAlerts.length ||
				visibleAlerts <= data.temperatureAlerts.length ||
				visibleAlerts <= data.fuelAlerts.length ||
				visibleAlerts <= data.elockAlerts.length ? (
					<div className=' w-full px-9 my-4 mb-10' ref={ref}>
						<Skeleton className='pt-5' active />
					</div>
				) : null}
			</Drawer>
		</ConfigProvider>
	);
};
