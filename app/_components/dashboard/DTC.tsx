'use client';

import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import DtcIcon from '@/public/assets/images/common/dtc.png';
import { Modal, Tooltip } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import TableN from '../alerts-dashboard/table';
import { useLazyGetDTCResultQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { RootState } from '@/app/_globalRedux/store';
import { useSelector } from 'react-redux';

// svgs
import accelerationImg from '@/public/assets/svgs/dtc/acceleration.svg';
import batteryImg from '@/public/assets/svgs/dtc/battery.svg';
import brakeImg from '@/public/assets/svgs/dtc/brake.svg';
import engineImg from '@/public/assets/svgs/dtc/engine.svg';
import safetySystemsImg from '@/public/assets/svgs/dtc/safety-systems.svg';
import tireImg from '@/public/assets/svgs/dtc/tire.svg';
import transmissionImg from '@/public/assets/svgs/dtc/transmission.svg';
import otherImg from '@/public/assets/svgs/dtc/other.svg';
import { isKmtAccount } from '@/app/helpers/isKmtAccount';
import moment from 'moment';
type AlertServerity = 'GREEN' | 'YELLOW' | 'RED';
const getColorFromStatus = (status: string) => {
	if (status === 'Good' || status === 'GREEN') {
		return <div className='bg-green-100 text-green-800 py-2 px-3 rounded-sm'>Good</div>;
	} else if (status === 'Moderate' || status === 'YELLOW') {
		return <div className='bg-orange-100 text-orange-800 py-2 px-3 rounded-sm'>Moderate</div>;
	} else if (status === 'Severe' || status === 'RED') {
		return <div className='bg-red-100 text-red-800 py-2 px-3 rounded-sm'>Severe</div>;
	} else {
		return <div className='bg-green-100 text-green-800 py-2 px-3 rounded-sm'>Good</div>;
	}
};

const getColorFromStatusForAlerts = (status: string) => {
	if (status === 'Good' || status === 'GREEN') {
		return <div className='bg-yellow-100 text-yellow-800 py-2 px-3 rounded-sm'>Minor</div>;
	} else if (status === 'Moderate' || status === 'YELLOW') {
		return <div className='bg-orange-100 text-orange-800 py-2 px-3 rounded-sm'>Moderate</div>;
	} else if (status === 'Severe' || status === 'RED') {
		return <div className='bg-red-100 text-red-800 py-2 px-3 rounded-sm'>Severe</div>;
	} else {
		return <div className='bg-yellow-100 text-yellow-800 py-2 px-3 rounded-sm'>Minor</div>;
	}
};

function aggregateSPNData(data: Record<string, any>): any[] {
	const aggregatedData: any[] = [];

	for (let i = 1; i <= 6; i++) {
		const spnCode = data[`SPN${i}_Code`];
		const spnDescription = data[`SPN${i}_Description`];
		const spnCategory = data[`SPN${i}_Category`];
		const fmiCategory = data[`FMI${i}_Category`];

		if (spnCode !== null && spnCode !== undefined) {
			aggregatedData.push({
				SPN_Code: <p className='text-blue-500 font-bold text-sm'>#{spnCode}</p>,
				SPN_Description: spnDescription,
				SPN_Category: spnCategory,
				FMI_Category: getColorFromStatusForAlerts(fmiCategory),
				Set_At: `${data.odometer} Km`,
				category: (fmiCategory as AlertServerity) ?? ('GREEN' as AlertServerity),
			});
		}
	}

	return aggregatedData;
}

export const DTC = ({ data }: { data: VehicleData }) => {
	const { userId, parentUser } = useSelector((state: RootState) => state.auth);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeAlerts, setActiveAlerts] = useState<
		{ FMI_Category: string; FMI_Code: number; FMI_Description: string; SPN_Category: string; SPN_Code: number; SPN_Description: string }[]
	>([]);

	const tableHead = ['Code', 'Issue', 'Alert', 'Severity', 'Set At'];
	const tablePredectiveHeader = ['Alert Message', 'Date', 'Prognosis'];

	const [getDTCquery, { data: dtcResultData }] = useLazyGetDTCResultQuery();

	const [predectiveAlerts, setPredectiveAlerts] = useState([
		{
			icon: <Image src={accelerationImg} alt='acceleration' width={40} height={40} />,
			category: 'Acceleration',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN' as 'GREEN' | 'YELLOW' | 'RED',
		},
		{
			icon: <Image src={batteryImg} alt='battery' width={40} height={40} />,
			category: 'Battery',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN',
		},
		{
			icon: <Image src={brakeImg} alt='brake' width={40} height={40} />,
			category: 'Brake',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN',
		},
		{
			icon: <Image src={engineImg} alt='engine' width={40} height={40} />,
			category: 'Engine',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN',
		},
	]);

	const [otherAlerts, setOtherAlerts] = useState([
		{
			icon: <Image src={otherImg} alt='other' width={40} height={40} />,
			category: 'Other',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN',
		},
		{
			icon: <Image src={safetySystemsImg} alt='safetySystems' width={40} height={40} />,
			category: 'Safety Systems',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN',
		},
		{
			icon: <Image src={tireImg} alt='tire' width={40} height={40} />,
			category: 'Tire',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN',
		},
		{
			icon: <Image src={transmissionImg} alt='transmission' width={40} height={40} />,
			category: 'Transmission',
			status: getColorFromStatus('Good'),
			serverity: 'GREEN',
		},
	]);

	useEffect(() => {
		if (dtcResultData && dtcResultData.list.length > 0) {
			const agregatedData = aggregateSPNData({ ...dtcResultData.list[0], odometer: data.gpsDtl.tel_odometer });

			setActiveAlerts(agregatedData);

			const severityObj: Record<AlertServerity, number> = {
				GREEN: 2,
				YELLOW: 3,
				RED: 4,
			};

			// we will create a list of predective alerts
			const tempPredectiveAlerts = [...predectiveAlerts];
			const tempOtherAlerts = [...otherAlerts];
			// we will go through the list of predeicve alerts and update the serverity if it is greater than the current severity
			tempPredectiveAlerts.forEach((alert) => {
				const alertSeverity = severityObj[alert.serverity as AlertServerity];
				agregatedData.forEach((item) => {
					if (item.SPN_Category === alert.category) {
						if (severityObj[item.category as AlertServerity] > alertSeverity) {
							alert.serverity = item.category;
							alert.status = getColorFromStatusForAlerts(item.category);
						}
					}
				});
			});
			/// we will go through the list of other alerts and update the serverity if it is greater than the current severity
			tempOtherAlerts.forEach((alert) => {
				const alertSeverity = severityObj[alert.serverity as AlertServerity];
				agregatedData.forEach((item) => {
					if (item.SPN_Category === alert.category) {
						if (severityObj[item.category as AlertServerity] > alertSeverity) {
							alert.serverity = item.category;
							alert.status = getColorFromStatusForAlerts(item.category);
						}
					}
				});
			});
		}
	}, [dtcResultData]);

	return (
		<>
			{data.gpsDtl.immoblizeStatus === 1 && (isKmtAccount(Number(userId), Number(parentUser)) || Number(userId) === 833061) ? (
				<Tooltip title='DTC Alerts' mouseEnterDelay={1}>
					<div
						className='w-[24px] cursor-pointer'
						onClick={(e) => {
							e.stopPropagation();
							setIsModalOpen(true);

							const vehicleId = data.vId;

							if (vehicleId) {
								getDTCquery({
									vehicleId: data.vId,
								});
							}
						}}
					>
						<Image src={DtcIcon} alt='dtc alerts icon' width={40} height={40} />
					</div>
				</Tooltip>
			) : null}

			<Modal
				open={isModalOpen}
				onCancel={(e) => {
					e.stopPropagation();
					setIsModalOpen(false);
				}}
				footer={null}
				style={{ top: 0 }}
				centered
				width={1000}
			>
				<div
					className='flex flex-col gap-4'
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<div className='flex items-center justify-between mt-6'>
						<div className='text-lg font-semibold'>DTC ({data.vehReg})</div>
						<div className='text-sm font-medium mr-5 text-neutral-600'>
							Last Data Received: {moment(dtcResultData?.list[0]?.gps_time)?.format('DD-MM-YYYY hh:mm')}
						</div>
					</div>

					<div className='flex items-start justify-between w-full'>
						<div className='min-w-[58x0px] max-w-[580px]'>
							<p className='font-semibold text-neutral-500 text-base mb-1'>Active Code</p>
							<TableN tableHead={tableHead} tableData={activeAlerts} isStripped={true} />
						</div>
						<div className='flex flex-col gap-2'>
							<div>
								<p className='font-semibold text-neutral-500 text-base mb-1'>Predictive Alerts</p>
								<TableN tableHead={tablePredectiveHeader} tableData={predectiveAlerts} isStripped={true} />
							</div>
							<div>
								<p className='font-semibold text-neutral-500 text-base mb-1 '>Other Alerts</p>
								<TableN tableHead={tablePredectiveHeader} tableData={otherAlerts} isStripped={true} />
							</div>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};
