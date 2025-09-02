'use client';

import { useGetKMAnkurCarrierQuery, useGetVehiclesByStatusQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { CustomVehicleStatusReport } from './CustomVehicleStatusReport';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { Button, Card, Modal, Spin, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import lessThanGreaterThanFilter from '@/app/helpers/lessThanGreaterThanFilter';
import { ColumnDef, Row } from '@tanstack/react-table';
import { operatorFilterFn } from '@/app/helpers/customTableFilterFns';
import { convertMilliSecondToHours } from '@/app/helpers/convertMillisecondsToHours';

export interface VehicleDataWithAnkurTravelsData extends VehicleData {
	ankurCarrierData: AnukurCarrierData | undefined;
}

export const View = () => {
	const { groupId, userId, accessLabel, parentUser: pUserId } = useSelector((state: RootState) => state.auth);
	const [vehicleStatus, setVehicleStatus] = useState('');
	const [filteredData, setFilteredData] = useState<VehicleDataWithAnkurTravelsData[] | VehicleData[]>([]);
	const [isFiltering, setIsFiltering] = useState(false);
	const [vehicleCountPercentage, setVehicleCountPercentage] = useState({
		all: 0,
		inGeofence: 0,
		outsideGeofence: 0,
	});

	// Filter refs for each column (unchanged)
	const vehicleNumberRef = useRef<HTMLInputElement>(null);
	const gpsTimeRef = useRef<HTMLInputElement>(null);
	const locationRef = useRef<HTMLInputElement>(null);
	const speedRef = useRef<HTMLInputElement>(null);
	const yesterdayKmRef = useRef<HTMLInputElement>(null);
	const ignitionStateRef = useRef<HTMLInputElement>(null);
	const haltInHrsRef = useRef<HTMLInputElement>(null);
	const haltingSinceRef = useRef<HTMLInputElement>(null);
	const statusRef = useRef<HTMLInputElement>(null);
	const destinationRef = useRef<HTMLInputElement>(null);
	const driverNameRef = useRef<HTMLInputElement>(null);
	const driverNumberRef = useRef<HTMLInputElement>(null);

	const [filterColumns, setFilterColumns] = useState([
		{ title: 'Vehicle Number', dataIndex: ['vehReg'], width: '200px', filterValue: '', ref: vehicleNumberRef },
		{ title: 'GPS Time', dataIndex: ['gpsDtl', 'latLngDtl', 'gpstime'], width: '200px', filterValue: '', ref: gpsTimeRef },
		{ title: 'Location', dataIndex: ['gpsDtl', 'latLngDtl', 'addr'], width: '200px', filterValue: '', ref: locationRef },
		{ title: 'Speed', dataIndex: ['gpsDtl', 'speed'], width: '200px', filterValue: '', ref: speedRef },
		{ title: 'Yesterday KM', dataIndex: ['gpsDtl', 'Yesterday_KM'], width: '200px', filterValue: '', ref: yesterdayKmRef },
		{ title: 'Ignition State', dataIndex: ['gpsDtl', 'ignState'], width: '200px', filterValue: '', ref: ignitionStateRef },
		{ title: 'Halting Hours', dataIndex: ['gpsDtl', 'HaltingInHRS'], width: '200px', filterValue: '', ref: haltInHrsRef },
		{ title: 'Halting Since', dataIndex: ['gpsDtl', 'hatledSince'], width: '200px', filterValue: '', ref: haltingSinceRef },
		{ title: 'Status', dataIndex: ['gpsDtl', 'mode'], width: '200px', filterValue: '', ref: statusRef },
		{ title: 'Destination', dataIndex: ['vehicleTrip', 'station_to_location'], width: '200px', filterValue: '', ref: destinationRef },
		{ title: "Driver's Name", dataIndex: ['drivers', 'driverName'], width: '300px', filterValue: '', ref: driverNameRef },
		{ title: "Driver's Number", dataIndex: ['drivers', 'phoneNumber'], width: '200px', filterValue: '', ref: driverNumberRef },
	]);

	const { data, isLoading, isFetching } = useGetVehiclesByStatusQuery(
		{ token: groupId, userId, pUserId, mode: vehicleStatus },
		{ skip: !groupId || !userId }
	);

	const {
		data: ankurCarrierData,
		isLoading: isAnkurCarrierLoading,
		isFetching: isAnkurCarrierFetching,
	} = useGetKMAnkurCarrierQuery({ token: Number(groupId) }, { skip: !groupId || Number(groupId) !== 56028 });

	useEffect(() => {
		if (Number(groupId) !== 56028) {
			if (data) setFilteredData(data.list);
		} else {
			if (data && ankurCarrierData) {
				const adjustedAnkurCarrierDataInExistingVehicleData = data.list.map((vehicle) => ({
					...vehicle,
					ankurCarrierData: ankurCarrierData.list.find((ankurVehicle) => vehicle.vId === ankurVehicle.vehicleId),
				}));
				setFilteredData(adjustedAnkurCarrierDataInExistingVehicleData);
			}
		}
	}, [data, ankurCarrierData, groupId]);

	useEffect(() => {
		if (filteredData && Array.isArray(filteredData) && filteredData.length > 0) {
			const allVehicles = filteredData.length;
			const inPoiVehicles = filteredData.filter((marker) =>
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
	}, [filteredData]);

	const [isAddressOpenInPopup, setIsAddressOpenInPopup] = useState(-1);
	const [Loading, setLoading] = useState(false); // New unified loading state
	const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

	const handleOpenAddressPopup = (vId: number) => {
		setSelectedVehicle(filteredData.find((vehicle) => vehicle.vId === vId));
		setIsAddressOpenInPopup(vId);
		setLoading(true); // Set loading to true when modal opens
	};

	// Rest of your useEffect for filter handling (unchanged)
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent, dataIndex: string[]) => {
			setIsFiltering(true);
			if (event.key === 'Enter' && data && data.list) {
				const filteredList = data.list.filter((vehicle) => {
					return filterColumns.every((filterColumn) => {
						let value: any = vehicle;
						const currentDataIndex = filterColumn.dataIndex;
						if (Array.isArray(currentDataIndex)) {
							for (const key of currentDataIndex) {
								if (value && value[key] !== undefined) value = value[key];
								else return false;
							}
						} else {
							value = value[currentDataIndex];
						}
						const filterValue = filterColumn.filterValue;
						if (isNaN(Number(filterValue.slice(1).trim())) || filterValue === '') {
							return String(value).toLowerCase().includes(filterValue.toLowerCase());
						} else {
							return lessThanGreaterThanFilter(filterValue, currentDataIndex, vehicle);
						}
					});
				});
				setFilteredData(filteredList);
				setIsFiltering(false);
			}
		};

		const vehicleNumber = vehicleNumberRef.current;
		const gps = gpsTimeRef.current;
		const location = locationRef.current;
		const speed = speedRef.current;
		const yesterdayKm = yesterdayKmRef.current;
		const ignitionState = ignitionStateRef.current;
		const haltingHrs = haltInHrsRef.current;
		const haltingSince = haltingSinceRef.current;
		const status = statusRef.current;
		const destination = destinationRef.current;
		const driverName = driverNameRef.current;
		const driverNumber = driverNumberRef.current;

		if (
			gps &&
			location &&
			speed &&
			yesterdayKm &&
			ignitionState &&
			haltingHrs &&
			haltingSince &&
			status &&
			destination &&
			driverName &&
			driverNumber &&
			vehicleNumber
		) {
			vehicleNumber.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['vehReg']));
			gps.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['gpsDtl', 'latLngDtl', 'gpstime']));
			location.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['gpsDtl', 'latLngDtl', 'addr']));
			speed.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['gpsDtl', 'speed']));
			yesterdayKm.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['gpsDtl', 'Yesterday_KM']));
			ignitionState.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['gpsDtl', 'ignState']));
			haltingHrs.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['gpsDtl', 'HaltingInHRS']));
			haltingSince.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['vehicleTrip', 'haltSince']));
			status.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['gpsDtl', 'mode']));
			destination.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['vehicleTrip', 'station_to_location']));
			driverName.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['drivers', 'driverName']));
			driverNumber.addEventListener('keypress', (event) => event.key === 'Enter' && handleKeyPress(event, ['drivers', 'phoneNumber']));
		}
	}, [filterColumns, data]);

	// Rest of your ankurCarrier, getVehiclesNotWorking, and columns definitions (unchanged)
	const ankurCarrier = () => {
		let colData: ColumnDef<VehicleDataWithAnkurTravelsData>[] = [];
		if (Number(userId) === 83823) {
			const today = new Date();
			colData = [
				{
					accessorFn: (row) => row.ankurCarrierData?.todayKm,
					id: 'today_km',
					cell: ({ row }) => (row.original.ankurCarrierData?.todayKm ? `${row.original.ankurCarrierData.todayKm} ` : '0'),
					header: `${moment(today).format('Do MMM, YYYY')}`,
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					accessorFn: ({ ankurCarrierData }) => ankurCarrierData?.yesterdayKm[0].km,
					id: 'yesterday_km',
					cell: ({ row }) => (row.original.ankurCarrierData?.yesterdayKm ? `${row.original.ankurCarrierData.yesterdayKm[0].km}` : '0'),
					header: `${moment(today).subtract(1, 'days').format('Do MMM, YYYY')}`,
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					accessorFn: ({ ankurCarrierData }) => ankurCarrierData?.minusTwodays[0].km,
					id: 'two_days_km',
					cell: ({ row }) => (row.original.ankurCarrierData?.minusTwodays ? `${row.original.ankurCarrierData.minusTwodays[0].km}` : '0'),
					header: `${moment(today).subtract(2, 'days').format('Do MMM, YYYY')}`,
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					accessorFn: ({ ankurCarrierData }) => ankurCarrierData?.minusThreedays[0].km,
					id: 'three_days_km',
					cell: ({ row }) => (row.original.ankurCarrierData?.minusThreedays ? `${row.original.ankurCarrierData.minusThreedays[0].km}` : '0'),
					header: `${moment(today).subtract(3, 'days').format('Do MMM, YYYY')}`,
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					accessorFn: ({ ankurCarrierData }) => ankurCarrierData?.minusFourdays[0].km,
					id: 'four_days_km',
					cell: ({ row }) => (row.original.ankurCarrierData?.minusFourdays ? `${row.original.ankurCarrierData.minusFourdays[0].km}` : '0'),
					header: `${moment(today).subtract(4, 'days').format('Do MMM, YYYY')}`,
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					accessorFn: ({ ankurCarrierData }) => ankurCarrierData?.cMonth[0].km,
					id: 'current_month_km',
					cell: ({ row }) => (row.original.ankurCarrierData?.cMonth ? `${row.original.ankurCarrierData.cMonth[0].km}` : '0'),
					header: `Current Month`,
					footer: (props) => props.column.id,
					meta: { width: 'auto' },
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
				},
				{
					accessorFn: ({ ankurCarrierData }) => ankurCarrierData?.pMonth[0].km,
					id: 'last_month_km',
					cell: ({ row }) => (row.original.ankurCarrierData?.pMonth ? `${row.original.ankurCarrierData.pMonth[0].km}` : '0'),
					header: `Last Month`,
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
			];
		} else {
			colData = [
				{
					accessorKey: 'gpsDtl.speed',
					id: 'speed',
					cell: ({ row }) => <>{row.original.gpsDtl.speed ? `${row.original.gpsDtl.speed} Km/h` : '-'}</>,
					header: 'Speed',
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					id: 'yesterday_km',
					accessorFn: (row) => row.gpsDtl.Yesterday_KM,
					cell: ({ row }) => (row.original.gpsDtl.Yesterday_KM ? `${row.original.gpsDtl.Yesterday_KM}` : '0'),
					header: `Yesterday KM`,
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				...(Number(userId) === 87364 || Number(pUserId) === 87634
					? [
							{
								accessorKey: 'gpsDtl.latLngDtl.poi',
								id: 'geofence',
								cell: ({ row }: { row: any }) => (
									<>
										{row.original.gpsDtl.latLngDtl.poi && row.original.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ') === 'Inside POI'
											? 'Inside Geofence'
											: row.original.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ') === 'No Nearest POI'
											? 'No Nearest Geofence'
											: row.original.gpsDtl.latLngDtl.poi?.replaceAll('_', ' ')}{' '}
									</>
								),
								header: 'Nearby Geofence',
								footer: (props: any) => props.column.id,
								filterFn: (row: Row<VehicleDataWithAnkurTravelsData>, id: string, value: any) => operatorFilterFn(row, id, value),
								meta: { width: 'auto' },
							},
					  ]
					: []),
				{
					accessorKey: 'gpsDtl.HaltingInHRS',
					id: 'halting_hours',
					cell: ({ row }) => <>{row.original.gpsDtl.HaltingInHRS}</>,
					header: 'Halting Hours',
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					accessorKey: 'gpsDtl.hatledSince',
					id: 'halting_since',
					cell: ({ row }) => <>{row.original.gpsDtl.hatledSince ? moment(row.original.gpsDtl.hatledSince).format('Do MMM, YYYY, HH:mm') : '-'}</>,
					header: 'Halting Since',
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
				{
					accessorKey: 'gpsDtl.mode',
					id: 'status',
					cell: ({ row }) => <>{row.original.gpsDtl.mode ? `${row.original.gpsDtl.mode}` : '-'}</>,
					header: 'Status',
					footer: (props) => props.column.id,
					filterFn: (row, id, value) => operatorFilterFn(row, id, value),
					meta: { width: 'auto' },
				},
			];
		}
		return colData;
	};

	const getVehiclesNotWorking = (row: Row<VehicleDataWithAnkurTravelsData>) => {
		const gpsTimeInHours = convertMilliSecondToHours(new Date(row.original.gpsDtl.latLngDtl.gpstime).getTime());
		const currentTimeHours = convertMilliSecondToHours(new Date().getTime());
		return currentTimeHours - gpsTimeInHours > 24;
	};

	const columns: ColumnDef<VehicleDataWithAnkurTravelsData>[] = [
		{
			accessorKey: 'vehReg',
			id: 'vehReg',
			cell: ({ row }) => (
				<p className={`${getVehiclesNotWorking(row) ? 'text-red-700 ' : ''}`}>
					{row.original.vehReg ? row.original.vehReg?.replaceAll('_', ' ') : ''}
				</p>
			),
			header: 'Vehicle Number',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
			meta: { width: 'auto' },
		},
		{
			accessorKey: 'gpsDtl.latLngDtl.addr',
			id: 'location',
			cell: ({ row }) => {
				const value = row.original.gpsDtl.latLngDtl.addr;
				return (
					<>
						<div
							onClick={() => handleOpenAddressPopup(row.original.vId)}
							className={`${getVehiclesNotWorking(row) ? 'text-red-700' : ''} font-semibold hover:text-primary-green transition-colors duration-150`}
						>
							<Tooltip title={value ? value?.replaceAll('_', ' ') : ''} mouseEnterDelay={1}>
								<p className='cursor-pointer'>
									{value ? value?.replaceAll('_', ' ').slice(0, 60) : ''}
									{value ? (value.length > 60 ? '...' : '') : ''}
								</p>
							</Tooltip>
						</div>
					</>
				);
			},
			header: 'Location',
			footer: (props) => props.column.id,
			size: 450,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
		},
		{
			accessorKey: 'gpsDtl.latLngDtl.gpstime',
			id: 'gpsTime',
			cell: ({ row }) => (
				<p className={`${getVehiclesNotWorking(row) ? 'text-red-700 ' : ''}`}>
					{row.original.gpsDtl.latLngDtl.gpstime ? moment(row.original.gpsDtl.latLngDtl.gpstime).format('Do MMM, YYYY, HH:mm') : ''}
				</p>
			),
			header: 'Last Update',
			footer: (props) => props.column.id,
			filterFn: (row, id, value) => operatorFilterFn(row, id, value),
			meta: { width: 'auto' },
		},
		...ankurCarrier(),
		...(accessLabel === 6
			? [
					{
						accessorKey: 'gpsDtl.acState',
						id: 'e_lock',
						cell: ({ row }: { row: any }) => <>{row.original.gpsDtl.acState === 'Off' ? 'Lock' : 'Unlock'}</>,
						header: 'ELock',
						footer: (props: any) => props.column.id,
						filterFn: (row: Row<VehicleDataWithAnkurTravelsData>, id: string, value: any) => operatorFilterFn(row, id, value),
						meta: { width: 'auto' },
					},
			  ]
			: []),
		...(accessLabel === 6
			? [
					{
						accessorKey: 'gpsDtl.jny_distance',
						id: 'controller_number',
						cell: ({ row }: { row: any }) => <>{row.original.gpsDtl.jny_distance ? `${row.original.gpsDtl.jny_distance}` : '-'}</>,
						header: 'Controller No.',
						footer: (props: any) => props.column.id,
						filterFn: (row: Row<VehicleDataWithAnkurTravelsData>, id: string, value: any) => operatorFilterFn(row, id, value),
						meta: { width: 'auto' },
					},
			  ]
			: []),
		...(userId && Number(userId) === 83823
			? [
					{
						id: 'YT',
						cell: ({ row }: { row: any }) => (
							<a
								href={`https://gtrac.in/trackingyatayaat/reports/journeyandmap.php?Pickup_time=${moment(new Date())
									.subtract(1, 'day')
									.startOf('day')
									.format('YYYY-MMM-DD HH:MMM:ss')}&end_trip=${moment(new Date()).format('YYYY-MMM-DD HH:MMM:ss')}&sys_service_id=${
									row.original.sys_service_id
								}&vehicle=${row.original.vehReg}&token=56028&userid=83823&parent_id=1&extra=0`}
								target='_blank'
								referrerPolicy='no-referrer'
							>
								YT
							</a>
						),
						header: 'YT',
						footer: (props: any) => props.column.id,
						filterFn: (row: Row<VehicleDataWithAnkurTravelsData>, id: string, value: any) => operatorFilterFn(row, id, value),
						meta: { width: 'auto' },
					},
			  ]
			: []),
	];

	return (
		<div>
			<Card
				styles={{ body: { padding: 0, background: '#F6F8F6', borderRadius: '15px', border: 0 } }}
				style={{ borderRadius: '15px', background: '#F6F8F6', border: 0 }}
			>
				<div className='w-full flex items-center justify-between p-5'>
					<div>
						<p className='text-3xl font-semibold'>Vehicle Status Report</p>
						{Number(userId) === 87364 || Number(pUserId) === 87364 ? (
							<p className='my-1'>
								<span className='font-semibold'>Inside Geofence: </span>
								{vehicleCountPercentage.inGeofence}% | <span className='font-semibold'>Outside Geofence: </span>
								{vehicleCountPercentage.outsideGeofence}%
							</p>
						) : null}
					</div>
					<div className='flex items-center'>
						<div>
							<Button type='text' style={{ borderRadius: 0 }} onClick={() => setVehicleStatus('')}>
								All
							</Button>
							|
						</div>
						<div>
							<Button type='text' style={{ borderRadius: 0 }} onClick={() => setVehicleStatus('RUNNING')}>
								Running
							</Button>
							|
						</div>
						<div>
							<Button type='text' style={{ borderRadius: 0 }} onClick={() => setVehicleStatus('IDLE')}>
								Idle
							</Button>
							|
						</div>
						<div>
							<Button type='text' style={{ borderRadius: 0 }} onClick={() => setVehicleStatus('STOPPED')}>
								Stopped
							</Button>
							|
						</div>
						<div>
							<Button type='text' style={{ borderRadius: 0 }} onClick={() => setVehicleStatus('NOT WORKING')}>
								Not Working
							</Button>
						</div>
					</div>
				</div>
				<div>
					<Modal open={isAddressOpenInPopup !== -1} onCancel={() => setIsAddressOpenInPopup(-1)} footer={null} width={'80%'} style={{ top: 40 }}>
						<div className='w-full h-full flex justify-center items-center'>
							{isLoading && (
								<div className='w-full h-full flex justify-center items-center absolute top-0 left-0 right-0 z-10 bg-white'>
									<Spin size='large' />
								</div>
							)}
							<iframe
								title='map'
								loading='lazy'
								src={`https://gtrac.in/trackingyatayaat/mapnewwindow.php?lat=${Number(selectedVehicle?.gpsDtl.latLngDtl.lat)}&long=${Number(
									selectedVehicle?.gpsDtl.latLngDtl.lng
								)}&vehicle=${selectedVehicle?.vehReg}&token=${groupId}&userid=${Number(userId)}`}
								style={{ height: '80vh', width: '100%' }}
								onLoad={() => setLoading(false)} // Hide spinner when iframe loads
							/>
						</div>
					</Modal>
					<CustomVehicleStatusReport
						columns={columns}
						scroll_y={`${Number(userId) === 87364 || Number(pUserId) === 87364 ? 'h-[calc(100vh-240px)]' : 'h-[calc(100vh-200px)]'}`}
						data={filteredData && (filteredData.length < 0 ? null : filteredData)}
						loading={isLoading || isFetching || isFiltering || isAnkurCarrierFetching || isAnkurCarrierLoading}
					/>
				</div>
			</Card>
		</div>
	);
};
