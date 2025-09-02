import { allVehicles } from './../../_globalRedux/dashboard/allVehicles';
import { AlertByDayEvents } from '@/app/_globalRedux/services/types/alerts';

type DtcData = {
	SPN_Code: number;
	SPN_Description: string;
	SPN_Category: string;
	FMI_Category: string;
	Set_At: string;
	VehicleNumber: number;
};

function aggregateSPNData(data: Record<string, any>): DtcData[] {
	const aggregatedData: DtcData[] = [];

	for (let i = 1; i <= 6; i++) {
		const spnCode = data[`SPN${i}_Code`];
		const spnDescription = data[`SPN${i}_Description`];
		const spnCategory = data[`SPN${i}_Category`];
		const fmiCategory = data[`FMI${i}_Category`];

		if (spnCode !== null && spnCode !== undefined) {
			aggregatedData.push({
				SPN_Code: spnCode,
				SPN_Description: spnDescription,
				SPN_Category: spnCategory,
				FMI_Category: fmiCategory,
				Set_At: `${data.odometer} Km`,
				VehicleNumber: data.sys_service_id,
			});
		}
	}

	return aggregatedData;
}

export function covertDtcToAlerts(data: GetDTCResponse['list'], allVehicles: { id: number; veh_reg: string }[]): AlertByDayEvents[] {
	if (!data) return [];

	const aggregatedData: DtcData[] = [];

	data.forEach((item) => {
		aggregatedData.push(...aggregateSPNData(item));
	});

	return aggregatedData.map((item) => {
		return {
			starttime: '',
			endtime: '',
			vehicle_no: allVehicles.find((vehicle) => vehicle.id === item.VehicleNumber)?.veh_reg ?? `${item.VehicleNumber}`,
			exception_type: item.SPN_Category,
			KM: item.Set_At,
			duration: '',
			startlocation: item.SPN_Description,
			startlat: 0,
			startLong: 0,
			endlocation: '',
			endlat: 0,
			endLong: 0,
			speed: 0,
			journey_statusfinal: null,
			Halting: null,
			hour: '',
			InvoiceNo: '',
			InvoiceDate: item.FMI_Category === 'RED' ? 'Severe' : item.FMI_Category === 'YELLOW' ? 'Moderate' : 'Minor',
			remark: '',
			id: 0,
			service_id: '',
			route_name: `${item.SPN_Code}`,
		};
	});
}
//Description | Alert | Set At | Severity | Code
