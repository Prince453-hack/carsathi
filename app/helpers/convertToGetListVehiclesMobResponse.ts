import { initialSelectedVehicleState } from '../_globalRedux/dashboard/selectedVehicleSlice';
import { GetListVehiclesMobResponse } from '../_globalRedux/services/types';
import { Drivers, GpsDetail, VehicleData, VehicleTrip } from '../_globalRedux/services/types/getListVehiclesmobTypes';

export const convertToGetListVehiclesMobResponse = (response: getTripVehiclesResponse): GetListVehiclesMobResponse => {
	// Map getTripVehicleResponse to GetListVehiclesMobResponse

	const vehicleDataList: VehicleData[] = response.list.map((item) => {
		// Map each item in the list to the VehicleData type
		const vehicleTrip: VehicleTrip = {
			sys_service_id: item.sys_service_id,
			lorry_no: item.lorry_no,
			trip_id: item.id, // Assuming this is not provided in the updated response, default to 0
			trip_status_update: '', // Assuming not provided, default to empty string
			trip_status_batch: item.trip_status_batch,
			party_name: item.party_name,
			challan_no: item.challan_no,
			departure_date: item.departure_date,
			station_from_location: item.station_from_location,
			station_to_location: item.station_to_location,
			arrival_date: '', // Assuming arrival_date is no longer present in the new response, set as empty string

			totaltripkmbygoogle: `${item.totaltripkmbygoogle}`,
			delay: item.delay ?? 0, // Default to 0 if null
			driver_name: item.driver_name,
			driver_number: item.driver_number || '',
			trip_status: item.trip_status,
			veh_remark: '', // Assuming not provided, default to empty string
			TripCreateddate: '', // Assuming not provided, default to empty string
			SourceIn: '', // Assuming not provided, default to empty string
			SourceOut: item.SourceOut,
			DestinationIN: item.destinationIn,
			DestinationOut: '', // Assuming not provided, default to empty string
			Actualtriphour: 0, // Assuming not provided, default to 0
			Hourstaken: 0, // Assuming not provided, default to 0
			KM: '', // Assuming not provided, default to 0
			gps: {
				latLngDtl: {
					lat: item.lat,
					lng: item.lng,
					latlong: '', // Assuming latlong is not directly provided, default to empty string
					addr: item.addr,
					poi: '', // Assuming not provided, default to empty string
					gpstime: '', // Assuming not provided, default to empty string
					epochtime: 0, // Default to 0
				},
				volt: 0, // Assuming not provided, default to 0
				fuel: 0, // Assuming not provided, default to 0
				temperature: 0, // Assuming not provided, default to 0
			},
		};

		const gpsDetail: GpsDetail = {
			latLngDtl: {
				lat: item.lat,
				lng: item.lng,
				latlong: '', // Assuming not provided, default to empty string
				addr: item.addr,
				poi: '', // Assuming not provided, default to empty string
				gpstime: '', // Assuming not provided, default to empty string
				epochtime: 0, // Default to 0
			},
			speed: 0, // Defaulting to 0
			ignState: 'Off', // Default to 'Off'
			acState: 'Off', // Default to 'Off'
			Elock: '', // Assuming not provided, default to empty string
			ElockDataTime: '', // Assuming not provided, default to empty string
			volt: 0, // Default to 0
			fuel: 0, // Default to 0
			temperature: 0, // Default to 0
			controllernum: '',
			mode: 'NOT WORKING', // Default to 'NOT WORKING'
			modeTime: '', // Assuming not provided, default to empty string
			modeTimeFormat: '', // Assuming not provided, default to empty string
			hatledSince: '', // Assuming not provided, default to empty string
			HaltingInHRS: '', // Assuming not provided, default to empty string
			angle: 0, // Default to 0
			cellId: 0, // Default to 0
			gpsStatus: 0, // Default to 0
			model: null, // Default to null
			isacconnected: null, // Default to null
			Yesterday_KM: 0, // Default to 0
			ismainpoerconnected: '', // Assuming not provided, default to empty string
			alertCount: 0, // Default to 0
			main_powervoltage: 0, // Default to 0
			percentageBttry: 0,
			tel_rfid: '', // Assuming not provided, default to empty string
			tel_odometer: 0, // Default to 0
			jny_distance: '', // Assuming not provided, default to empty string
			veh_destinationShow: '', // Assuming not provided, default to empty string
			immoblizeStatus: null, // Default to null
			notworkingHrs: 0, // Default to 0
			port: 0, // Default to 0
			alcoholLevel: 0, // Default to 0
		};

		const drivers: Drivers = {
			driverName: item.driver_name,
			phoneNumber: item.driver_number || '',
		};

		const vehicleData: VehicleData = {
			deviceId: '',
			vId: item.sys_service_id,
			vehReg: item.lorry_no,
			transporterVendor: '', // Assuming this might be filled in elsewhere
			controllermergeId: '', // Assuming this might be filled in elsewhere
			drivers: drivers,
			disInKM: item.KMfromDestination, // Assuming distance from destination is desired
			gpsDtl: gpsDetail,
			vehicleState: item.trip_status,
			vehicleTrip: vehicleTrip,
			ETA: item.ETA,
			GPSInfo: initialSelectedVehicleState.GPSInfo,
			ELOCKInfo: initialSelectedVehicleState.ELOCKInfo,
		};

		return vehicleData;
	});

	// Construct the final GetListVehiclesMobResponse object
	return {
		message: response.message,
		success: response.success,
		list: vehicleDataList,
	};
};
