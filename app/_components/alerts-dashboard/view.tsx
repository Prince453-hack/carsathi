'use client';

import {
	useGetAlertsByDateQuery,
	useGetCurrentMonthReportQuery,
	useLazyGetAlertsByDateQuery,
	useLazyGetCurrentMonthReportQuery,
} from '@/app/_globalRedux/services/trackingDashboard';
import ChartTable from './charts/chartTable';
import PieChartTable from './charts/pieChartTable';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import moment from 'moment';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AlertByDateLorryData } from '@/app/_globalRedux/services/types/alerts';
import ChartTable2 from './charts/chartTable2';

const leastUserVehiclesTableHead = ['Vehicle No', 'KM'];
const productivityMeterHead = ['Vehicle No', 'KM'];
const vehiclesWithMostAlertsHead = ['Vehicle No', 'Alert Types', 'Alerts Count'];

interface VehicleNumberKm {
	vehicleNo: string;
	km: number;
}

interface VehiclesWithAlerts {
	vehicleNo: string;
	alertsType: string[];
	alertsCount: number;
}

const initialBarChartState = {
	labels: [],
	datasets: [
		{
			data: [],
			backgroundColor: '#478D81',
			datalabels: {
				display: false,
			},
			legend: {
				display: false,
			},
			label: '',
			barThickness: 19,
			borderRadius: {
				topLeft: 5,
				topRight: 5,
				bottomLeft: 5,
				bottomRight: 5,
			},
		},
	],
};

const initialPieChartData = {
	labels: [],
	datasets: [
		{
			data: [],
			backgroundColor: ['#4FB090', '#84E7C7', '#84C5AF'],
		},
	],
};

const getAdjustedAlerts = ({
	data,
	setVehicleWithMostAlerts,
}: {
	data: AlertByDateLorryData[];
	setVehicleWithMostAlerts: Dispatch<SetStateAction<VehiclesWithAlerts[]>>;
}) => {
	if (data && data.length) {
		const alert = data[0];
		const tempAlerts = [
			...(alert.contineousDrive ? alert.contineousDrive : []),
			...(alert.freewheeling ? alert.freewheeling : []),
			...(alert.freewheelingWrong ? alert.freewheelingWrong : []),
			...(alert.harshBreak ? alert.harshBreak : []),
			...(alert.harshacc ? alert.harshacc : []),
			...(alert.highenginetemperature ? alert.highenginetemperature : []),
			...(alert.idle
				? alert.idle.map((idleAlert) => ({
						...idleAlert,
						AlertStatus: idleAlert.remark ? 'Closed' : 'Open',
				  }))
				: []),
			...(alert.internalPower ? alert.internalPower : []),
			...(alert.lowengineoilpressure ? alert.lowengineoilpressure : []),
			...(alert.mainpower ? alert.mainpower : []),
			...(alert.MainpowerConnected ? alert.MainpowerConnected : []),
			...(alert.nightdrive ? alert.nightdrive : []),
			...(alert.overspeed ? alert.overspeed : []),
			...(alert.overspeedKMT ? alert.overspeedKMT : []),
			...(alert.panic ? alert.panic : []),
			...(alert.services ? alert.services : []),
			...(alert.document ? alert.document : []),
			...(alert.transitdelay ? alert.transitdelay : []),
			...(alert.unlockonmove ? alert.unlockonmove : []),
			...(alert.PoscoOverspeed ? alert.PoscoOverspeed : []),
			...(alert.geofence ? alert.geofence : []),
		];

		let getAlertsByVehicleNumber: { vehicleNo: string; alertsCount: number; alertsType: string[] }[] = [];

		tempAlerts.forEach((alert) => {
			const existingVehicle = getAlertsByVehicleNumber.find((v) => v.vehicleNo === alert.vehicle_no);
			if (existingVehicle) {
				existingVehicle.alertsType = existingVehicle.alertsType.some((p) => p === alert.exception_type)
					? [...existingVehicle.alertsType]
					: [...existingVehicle.alertsType, alert.exception_type];
				existingVehicle.alertsCount++;
			} else {
				getAlertsByVehicleNumber.push({
					vehicleNo: alert.vehicle_no,
					alertsType: [alert.exception_type],
					alertsCount: 1,
				});
			}
		});
		getAlertsByVehicleNumber.sort((a, b) => b.alertsCount - a.alertsCount);
		setVehicleWithMostAlerts(getAlertsByVehicleNumber.slice(0, 5));
	}
};

const classifyVehiclesBasedOnTheirKm = (vehicles: VehicleNumberKm[]) => {
	const maxKm = Math.max(...vehicles.map((v) => v.km));

	// Define thresholds (using 33% and 66% of max as breakpoints)
	const lowThreshold = maxKm * 0.33;
	const highThreshold = maxKm * 0.66;

	let tempPieChartLeastUsedVehicles: VehicleNumberKm[] = [];
	let tempPieChartMediumUsedVehicles: VehicleNumberKm[] = [];
	let tempPieChartMostUsedVehicles: VehicleNumberKm[] = [];

	// Classify each vehicle based on its km.
	vehicles.forEach((vehicle) => {
		if (vehicle.km < lowThreshold) {
			tempPieChartLeastUsedVehicles.push(vehicle);
		} else if (vehicle.km >= lowThreshold && vehicle.km <= highThreshold) {
			tempPieChartMediumUsedVehicles.push(vehicle);
		} else {
			tempPieChartMostUsedVehicles.push(vehicle);
		}
	});

	return {
		leastUsedVehicles: tempPieChartLeastUsedVehicles,
		mediumUsedVehicles: tempPieChartMediumUsedVehicles,
		mostUsedVehicles: tempPieChartMostUsedVehicles,
	};
};

export const dateFilters = [
	{
		label: 'Last 7 days',
		value: 'last7days',
		startDate: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm'),
		endDate: moment().format('YYYY-MM-DD HH:mm'),
	},
	{
		label: 'Last Month',
		value: 'lastmonth',
		startDate: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm'),
		endDate: moment().format('YYYY-MM-DD HH:mm'),
	},
	{
		label: 'Last 14 days',
		value: 'last14days',
		startDate: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm'),
		endDate: moment().format('YYYY-MM-DD HH:mm'),
	},
];

export const View = () => {
	const { userId, groupId } = useSelector((state: RootState) => state.auth);
	const [leastUsedVehicles, setLeastUsedVehicles] = useState<VehicleNumberKm[]>([]);

	const [pieChartLeastUsedVehicles, setPieChartLeastUsedVehicles] = useState<VehicleNumberKm[]>([]);
	const [pieChartMediumUsedVehicles, setPieChartMediumUsedVehicles] = useState<VehicleNumberKm[]>([]);
	const [pieChartMostUsedVehicles, setPieChartMostUsedVehicles] = useState<VehicleNumberKm[]>([]);

	const [vehiclesWithMostAlerts, setVehiclesWithMostAlerts] = useState<VehiclesWithAlerts[]>([]);

	const [leastUserVehiclesDateRange, setLeastUsedVehiclesDateRange] = useState<{ startDate: string; endDate: string }>({
		startDate: dateFilters[0].startDate,
		endDate: dateFilters[0].endDate,
	});

	const [productivityMeterDateRange, setProductivityMeterDateRange] = useState<{ startDate: string; endDate: string }>({
		startDate: dateFilters[0].startDate,
		endDate: dateFilters[0].endDate,
	});

	const [vehiclesWithMostAlertsDateRange, setVehiclesWithMostAlertsDateRange] = useState<{
		startDate: string;
		endDate: string;
	}>({
		startDate: dateFilters[0].startDate,
		endDate: dateFilters[0].endDate,
	});

	const [isLeastVehiclessLoading, setIsLeastVehiclesLoading] = useState(true);
	const [isProductivityMeterLoading, setIsProductivityMeterLoading] = useState(true);

	const [getCurrentMonthReportTrigger] = useLazyGetCurrentMonthReportQuery();
	const [getAlertsByDateTrigger] = useLazyGetAlertsByDateQuery();

	const isGetAlertsLoading = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((query) => query && query.endpointName === 'getAlertsByDate' && query.status === 'pending')
	);

	const tableData = [
		{
			vehicleNo: '12345',
			km: '12345',
		},
		{
			vehicleNo: '12345',
			km: '12345',
		},
		{
			vehicleNo: '12345',
			km: '12345',
		},
		{
			vehicleNo: '12345',
			km: '12345',
		},
		{
			vehicleNo: '12345',
			km: '12345',
		},
	];

	useEffect(() => {
		if (!userId || !groupId) return;

		setIsLeastVehiclesLoading(true);
		getCurrentMonthReportTrigger({
			groupId: groupId,
			startDateTime: leastUserVehiclesDateRange.startDate,
			endDateTime: leastUserVehiclesDateRange.endDate,
		}).then((res) => {
			if (res.data && res.data.list.length > 0) {
				const tempData = res.data.list.map((item) => {
					return {
						vehicleNo: item.vehicleNum,
						km: Number(item.km?.toFixed(2)),
					};
				});
				const sortedVehicleTempData = tempData.sort((a, b) => Number(a.km) - Number(b.km));
				const sortedVehicleTempDataWithoutZeroKm = sortedVehicleTempData.filter((item) => Number(item.km) > 10);

				setLeastUsedVehicles(sortedVehicleTempDataWithoutZeroKm.slice(0, 5));

				setIsLeastVehiclesLoading(false);
			}
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, groupId, leastUserVehiclesDateRange]);

	useEffect(() => {
		if (!userId || !groupId) return;

		setIsProductivityMeterLoading(true);
		// setIsProductivityMeterLoading(true);
		getCurrentMonthReportTrigger({
			groupId: groupId,
			startDateTime: productivityMeterDateRange.startDate,
			endDateTime: productivityMeterDateRange.endDate,
		}).then((res) => {
			if (res.data && res.data.list.length > 0) {
				const tempData = res.data.list.map((item) => {
					return {
						vehicleNo: item.vehicleNum,
						km: Number(item.km?.toFixed(2)),
					};
				});
				const sortedVehicleTempData = tempData.sort((a, b) => Number(a.km) - Number(b.km));
				const sortedVehicleTempDataWithoutZeroKm = sortedVehicleTempData.filter((item) => Number(item.km) > 10);

				const vehiclesByClassification = classifyVehiclesBasedOnTheirKm(sortedVehicleTempDataWithoutZeroKm);

				setPieChartLeastUsedVehicles(vehiclesByClassification.leastUsedVehicles);
				setPieChartMediumUsedVehicles(vehiclesByClassification.mediumUsedVehicles);
				setPieChartMostUsedVehicles(vehiclesByClassification.mostUsedVehicles);

				setIsProductivityMeterLoading(false);
			}
		});
	}, [userId, groupId, productivityMeterDateRange]);

	useEffect(() => {
		if (!userId || !groupId) return;

		const data = {
			userId: userId,
			startDateTime: vehiclesWithMostAlertsDateRange.startDate,
			endDateTime: vehiclesWithMostAlertsDateRange.endDate,
			alertType: 'All',
			token: groupId,
			vehReg: 0,
			vehId: 0,
		};
		getAlertsByDateTrigger(data).then((res) => {
			if (res.data) {
				getAdjustedAlerts({ data: res.data.list, setVehicleWithMostAlerts: setVehiclesWithMostAlerts });
			}
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, groupId, vehiclesWithMostAlertsDateRange]);

	return (
		<div className='grid grid-cols-6 gap-2 p-6'>
			<div className='col-span-3'>
				<ChartTable
					setDateRange={setLeastUsedVehiclesDateRange}
					isLoading={isLeastVehiclessLoading}
					title='Least Used Vehicles'
					data={{
						tableHead: leastUserVehiclesTableHead,
						tableData: leastUsedVehicles,
						barChartData: {
							...initialBarChartState,
							labels: leastUsedVehicles.map((item) => item.vehicleNo),
							datasets: [{ ...initialBarChartState.datasets[0], data: leastUsedVehicles.map((item) => item.km), label: 'Least Used Vehicles By Km' }],
						},
					}}
				/>
			</div>

			<div className='col-span-3'>
				<PieChartTable
					setDateRange={setProductivityMeterDateRange}
					isLoading={isProductivityMeterLoading}
					title='Productivity Meter'
					data={{
						tableHead: productivityMeterHead,
						tableData,
						pieChartData: {
							...initialPieChartData,
							labels: ['Least Used Vehicles', 'Medium Used Vehicles', 'Most Used Vehicles'],
							datasets: [
								{
									...initialPieChartData.datasets[0],
									data: [pieChartLeastUsedVehicles.length, pieChartMediumUsedVehicles.length, pieChartMostUsedVehicles.length],
								},
							],
						},
					}}
				/>
			</div>
			<div className='col-span-4'>
				<ChartTable2
					setDateRange={setVehiclesWithMostAlertsDateRange}
					isLoading={isGetAlertsLoading}
					title='Vehicles With Most Alerts'
					data={{
						tableHead: vehiclesWithMostAlertsHead,
						tableData: vehiclesWithMostAlerts,
						barChartData: {
							...initialBarChartState,
							labels: vehiclesWithMostAlerts.map((item) => item.vehicleNo),
							datasets: [
								{
									...initialBarChartState.datasets[0],
									data: vehiclesWithMostAlerts.map((item) => item.alertsCount),
									label: 'Vehicles With Most Alerts',
								},
							],
						},
					}}
				/>
			</div>
		</div>
	);
};
