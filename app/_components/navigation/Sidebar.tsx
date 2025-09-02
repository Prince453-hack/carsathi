'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { AppstoreFilled, AppstoreOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons';
import {
	AlertsIcon,
	DashboardIcon,
	ReportsIcon,
	SubUsersIcon,
	TripSystemIcon,
	RawReportIcon,
	VehicleStatusReportIcon,
	CurrentMonthReportIcon,
	TemperatureReportIcon,
	OldReportsIcon,
	AlcoholDrivingIcon,
} from '@/public/assets/svgs/nav';
import { ConfigProvider, Layout, Menu, Modal } from 'antd';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import resetDashboardAndTripSystemState from '@/app/helpers/resetDashboardAndTripSystemState';
import reports, { ReportArr } from '@/lib/reports';
import { PositionType } from 'antd/es/image/style';
import { isCheckInAccount } from '@/app/helpers/isCheckInAccount';

const { Sider } = Layout;

const Sidebar = ({ children }: { children: ReactNode }) => {
	const [authLocal, setAuthLocal] = useState<any>();
	const { extra, userId, groupId, isTemp, parentUser, accessLabel, isMarketVehicle, isPadlock } = useSelector((state: RootState) => state.auth);

	const [reportsForCurrentUser, setReportsForCurrentUser] = useState<ReportArr[]>([]);

	useEffect(() => {
		const getUserReports = async () => {
			if (window) {
				let tempAuth: any;

				tempAuth = JSON.parse(localStorage.getItem('auth-session') || '{}');

				if (tempAuth) {
					const isEcoGpsAll = Number(tempAuth.userId) === 6258 || Number(tempAuth.parentUser) === 6258;
					setAuthLocal(tempAuth);
					const reportsData = reports({ userId: tempAuth.userId, parent_id: tempAuth.parentUser, extra: tempAuth.extra, groupId: tempAuth.groupId });

					const tempFilteredReports = reportsData.filter((report) => {
						return (
							Number(report.userId) === Number(tempAuth.userId) ||
							(report?.showParent === true && Number(report.parentUser) === Number(tempAuth.parentUser)) ||
							(isEcoGpsAll && Number(report.parentUser) === Number(tempAuth.parentUser))
						);
					});

					if (tempFilteredReports.length) {
						if (tempFilteredReports[0].reports) {
							setReportsForCurrentUser(tempFilteredReports[0].reports);
						}
					}
				}
			}
		};

		getUserReports();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [collapsed, setCollapsed] = useState<boolean>(true);
	const pathname = usePathname();
	const dispatch = useDispatch();
	const selectedKeys = [pathname];
	const [isTripOnwardOutward, setIsTripOnwardOutward] = useState<boolean>(false);

	return (
		<Layout className='h-[calc(100vh-62px)] overflow-hidden'>
			<Sider trigger={null} collapsible collapsed={collapsed} collapsedWidth={70} width={200}>
				<ConfigProvider
					theme={{
						components: {
							Menu: {
								colorBgContainer: 'rgb(242,245,243)',
							},
						},
					}}
				>
					<Menu
						mode='inline'
						className='h-[calc(100vh-60px)]  relative z-40  '
						selectedKeys={selectedKeys}
						onClick={(info) => {
							if (info.key === '/dashboard') {
								resetDashboardAndTripSystemState(dispatch);
							}
						}}
						items={[
							...(isCheckInAccount(Number(userId)) || Number(userId) === 87101
								? []
								: accessLabel === 10
								? [
										...(Number(userId) === 87205
											? [
													{
														key: '/dashboard',
														icon: <Image src={DashboardIcon} alt='dashboard icon' width={14} height={14} />,
														label: (
															<a href='/dashboard' target='_blank' referrerPolicy='no-referrer'>
																Dashboard
															</a>
														),
													},
													{
														key: '/trip-report',
														icon: <Image src={TripSystemIcon} alt='trip report' width={14} height={14} />,
														label: (
															<a href={`/dashboard/all-reports/trip-report`} target='_blank' referrerPolicy='no-referrer'>
																Trip Report
															</a>
														),
													},

													{
														key: '/dashboard/alerts',
														icon: <Image src={AlertsIcon} alt='alerts' width={14} height={14} />,
														label: (
															<a href='/dashboard/alerts' target='_blank' referrerPolicy='no-referrer'>
																Alerts
															</a>
														),
													},
											  ]
											: []),
										Number(userId) === 87170
											? {
													key: 'temperature-report',
													icon: <Image src={TemperatureReportIcon} alt='temperature report' width={14} height={14} />,
													label: (
														<a
															href={`https://gtrac.in/newtracking/reports/all_reports_of_vehicle.php?report=Journey&token=${groupId}&userid=${userId}&extra=${extra}&puserid=${parentUser}`}
															target='_blank'
															referrerPolicy='no-referrer'
														>
															Temperature
														</a>
													),
											  }
											: null,
								  ]
								: [
										...(Number(userId) === 87310 || Number(parentUser) === 87310 || Number(userId) === 78443
											? [
													{
														key: '/dashboard',
														icon: <Image src={DashboardIcon} alt='dashboard icon' width={14} height={14} />,
														label: (
															<a href='/dashboard' target='_blank' referrerPolicy='no-referrer'>
																Dashboard
															</a>
														),
													},
											  ]
											: [
													// {
													// 	key: '/dashboard/overview',

													// 	icon: <AppstoreFilled style={{ color: '#478C83' }} />,
													// 	label: (
													// 		<a href='/dashboard/overview' target='_blank' referrerPolicy='no-referrer'>
													// 			Overview
													// 		</a>
													// 	),
													// },
													{
														key: '/dashboard/all-reports',
														icon: <Image src={ReportsIcon} alt='all reports' width={14} height={14} />,
														label: 'All Reports',
														children: [
															{
																key: '/dashboard/all-reports/old-reports',
																icon: <Image src={OldReportsIcon} alt='old report' width={14} height={14} />,
																label: (
																	<a href='/dashboard/all-reports/old-reports' target='_blank' referrerPolicy='no-referrer'>
																		Old Reports
																	</a>
																),
															},

															Number(userId) === 5275
																? {
																		key: '/dashboard/all-reports/trip-report',
																		icon: <Image src={TripSystemIcon} alt='trip report' width={14} height={14} />,
																		label: (
																			<a
																				onClick={() => {
																					setIsTripOnwardOutward(true);
																				}}
																			>
																				Trip Onward/Outward Report
																			</a>
																		),
																  }
																: null,
															accessLabel === 6
																? {
																		key: '/dashboard/all-reports/elock-reports',
																		icon: <Image src={ReportsIcon} alt='elock report' width={14} height={14} />,
																		label: (
																			<a
																				href={`https://gtrac.in/trackingyatayaat/reports/reports_controller_alert_next.php?token=${groupId}&userid=${userId}`}
																				target='_blank'
																				referrerPolicy='no-referrer'
																			>
																				Elock
																			</a>
																		),
																  }
																: null,

															Number(userId) === 4315
																? {
																		key: '/dashboard/all-reports/vehicle-status-report',
																		icon: <Image src={VehicleStatusReportIcon} alt='vehicle status report' width={14} height={14} />,
																		label: (
																			<a
																				href={`https://gtrac.in/newtracking/reports/vehicle_status.php?token=${groupId}&userid=${userId}`}
																				target='_blank'
																				referrerPolicy='no-referrer'
																			>
																				Vehicle Status
																			</a>
																		),
																  }
																: Number(userId) === 83823 || Number(userId) === 85182 || Number(userId) === 81544 || Number(parentUser) === 81544
																? {
																		key: '/dashboard/all-reports/vehicle-status-report',
																		icon: <Image src={VehicleStatusReportIcon} alt='vehicle status report' width={14} height={14} />,
																		label: (
																			<a
																				href={`https://gtrac.in/newtracking/chk_all_veh_data_next.php?token=${groupId}&userid=${userId}`}
																				target='_blank'
																				referrerPolicy='no-referrer'
																			>
																				Vehicle Status
																			</a>
																		),
																  }
																: {
																		key: '/dashboard/all-reports/vehicle-status-report',
																		icon: <Image src={VehicleStatusReportIcon} alt='vehicle status report' width={14} height={14} />,
																		label: (
																			<a href='/dashboard/all-reports/vehicle-status-report' target='_blank' referrerPolicy='no-referrer'>
																				Vehicle Status
																			</a>
																		),
																  },
															{
																key: '/dashboard/all-reports/current-month-report',
																icon: <Image src={CurrentMonthReportIcon} alt='current month report' width={14} height={14} />,
																label: (
																	<a
																		href={`https://gtrac.in/newtracking/reports/currentmonth.php?token=${groupId}&userid=${userId}`}
																		target='_blank'
																		referrerPolicy='no-referrer'
																	>
																		Current Month
																	</a>
																),
															},
															isTemp
																? {
																		key: 'temperature-report',
																		icon: <Image src={TemperatureReportIcon} alt='temperature report' width={14} height={14} />,
																		label: (
																			<a
																				href={`https://gtrac.in/newtracking/reports/all_reports_of_vehicle.php?report=Journey&token=${groupId}&userid=${userId}&extra=${extra}&puserid=${parentUser}`}
																				target='_blank'
																				referrerPolicy='no-referrer'
																			>
																				Temperature
																			</a>
																		),
																  }
																: null,

															{
																key: '/dashboard/all-reports/detailed-report',
																icon: <Image src={RawReportIcon} alt='detailed report' width={14} height={14} />,
																label: (
																	<a href='/dashboard/all-reports/detailed-report' target='_blank' referrerPolicy='no-referrer'>
																		Detailed
																	</a>
																),
															},

															Number(userId) === 83458 || Number(parentUser) === 83458
																? {
																		key: '/newtracking/reports/instantveh.php',
																		icon: <Image src={ReportsIcon} alt='driver alcohol status' width={16} height={16} />,
																		label: (
																			<a href='https://gtrac.in/newtracking/reports/instantveh.php' target='_blank' referrerPolicy='no-referrer'>
																				Overall Device Status
																			</a>
																		),
																  }
																: null,

															isMarketVehicle || isPadlock
																? {
																		key: '/dashboard/all-reports/vehicle-allocation-report',
																		icon: <Image src={ReportsIcon} alt='vehicle allocation report' width={14} height={14} />,
																		label: (
																			<a href='/dashboard/all-reports/vehicle-allocation-report' target='_blank' referrerPolicy='no-referrer'>
																				Vehicle Allocation Report
																			</a>
																		),
																  }
																: null,

															Number(userId) === 80758 || Number(userId) === 81707
																? {
																		key: 'trip-report',
																		icon: <Image src={ReportsIcon} alt='trip report' width={14} height={14} />,
																		label: (
																			<a
																				href={`https://gtrac.in/trackingyatayaat/reports/poireportokara.php?token=${groupId}&userid=${userId}&extra=${extra}&puserid=${parentUser}`}
																				target='_blank'
																				referrerPolicy='no-referrer'
																			>
																				Trip Report
																			</a>
																		),
																  }
																: null,

															Number(userId) === 6258
																? {
																		key: 'panic-not-working',
																		icon: <Image src={ReportsIcon} alt='panic not working' width={14} height={14} />,
																		label: (
																			<a
																				href={`https://gtrac.in/trackingyatayaat/reports/panicnotworking.php?token=${groupId}&userid=${userId}&extra=${extra}&puserid=${parentUser}`}
																				target='_blank'
																				referrerPolicy='no-referrer'
																			>
																				Panic Not Working
																			</a>
																		),
																  }
																: null,

															...reportsForCurrentUser.map((report) => ({
																key: report.url,
																icon: <Image src={ReportsIcon} alt='reports icon' width={14} height={14} />,
																label: (
																	<a
																		href={`${report.url[report.url.length - 1] === '=' ? `${report.url}${extra}` : report.url}`}
																		target='_blank'
																		referrerPolicy='no-referrer'
																	>
																		{report.title}
																	</a>
																),
															})),
														],
													},

													{
														key: '/dashboard/manage-sub-users',
														icon: <Image src={SubUsersIcon} alt='manage sub users' width={14} height={14} />,
														label: (
															<a href='/dashboard/manage-sub-users' target='_blank' referrerPolicy='no-referrer'>
																Manage Sub Users
															</a>
														),
													},
													accessLabel === 6
														? {
																key: '/dashboard/elock-alerts',
																icon: <Image src={AlertsIcon} alt='elock icon' width={14} height={14} />,
																label: (
																	<a href='/dashboard/elock-alerts' target='_blank' referrerPolicy='no-referrer'>
																		Elock Alerts
																	</a>
																),
														  }
														: {
																key: '/dashboard/alerts',
																icon: <Image src={AlertsIcon} alt='elock icon' width={14} height={14} />,
																label: (
																	<a href='/dashboard/alerts' target='_blank' referrerPolicy='no-referrer'>
																		Alerts
																	</a>
																),
														  },
													{
														key: '/dashboard/trip-management',
														icon: <Image src={TripSystemIcon} alt='dashboard icon' width={16} height={16} />,
														label: (
															<a href='/dashboard/trip-management' target='_blank' referrerPolicy='no-referrer'>
																Trip Management
															</a>
														),
													},
											  ]),

										{
											key: '5',
											icon: collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined width={20} />,
											label: collapsed ? 'Expand' : 'Collapse',
											onClick: () => setCollapsed(!collapsed),
											style: {
												position: 'absolute' as PositionType,
												bottom: 2,
											},
										},
								  ]),

							Number(userId) === 3212 || Number(parentUser) === 3212
								? {
										key: '/dashboard/driver-alcohol-status',
										icon: <Image src={AlcoholDrivingIcon} alt='driver alcohol status' width={16} height={16} />,
										label: (
											<a href='/dashboard/driver-alcohol-status' target='_blank' referrerPolicy='no-referrer'>
												Driver Alcohol Status
											</a>
										),
								  }
								: null,
						]}
					/>
				</ConfigProvider>
			</Sider>

			<Modal open={isTripOnwardOutward} onCancel={() => setIsTripOnwardOutward(false)} footer={null} style={{ top: 20 }} width='auto'>
				<iframe title='map' src={`https://gtrac.in/newtracking/gatewayTab.php#tab2`} style={{ height: '90vh', width: '100%' }} />
			</Modal>

			<Layout className='relative' style={{ background: '#F6F8F6' }}>
				{children}
			</Layout>
		</Layout>
	);
};

export default Sidebar;
