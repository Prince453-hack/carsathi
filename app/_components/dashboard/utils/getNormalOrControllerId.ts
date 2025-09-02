import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { getLatestGPSTime } from './getLatestGPSTime';

export const getNormalOrControllerId = (data: VehicleData) => {
	if (data.GPSInfo.gps_fix === 1 && data.ELOCKInfo.gps_fix === 0) {
		return data.vId;
	} else if (data.GPSInfo.gps_fix === 0 && data.ELOCKInfo.gps_fix === 1) {
		return Number(data.controllermergeId);
	} else {
		return getLatestGPSTime(data) === 'ELOCK' ? Number(data.controllermergeId) : data.vId;
	}
};

export const getGPSOrElock = (data: VehicleData) => {
	if (data.GPSInfo.gps_fix === 1 && data.ELOCKInfo.gps_fix === 0) {
		return 'GPS';
	} else if (data.GPSInfo.gps_fix === 0 && data.ELOCKInfo.gps_fix === 1) {
		return 'ELOCK';
	} else {
		return getLatestGPSTime(data) === 'ELOCK' ? 'GPS' : 'ELOCK';
	}
};
