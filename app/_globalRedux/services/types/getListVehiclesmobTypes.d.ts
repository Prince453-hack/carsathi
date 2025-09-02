type LatLngDetail = {
	lat: number;
	lng: number;
	latlong: string;
	addr: string;
	poi: string;
	gpstime: string;
	epochtime: number;
};

type Drivers = {
	driverName: string;
	phoneNumber: string;
};

type GpsDetail = {
	fuel: 0 | 1;
	latLngDtl: LatLngDetail;
	speed: number;
	ignState: 'Off' | 'On';
	acState: 'Off' | 'On';
	Elock: string;
	ElockDataTime: string;
	volt: null | number;
	fuel: number;
	temperature: null | number;
	mode: 'NOT WORKING' | 'IDLE' | 'STOPPED' | 'RUNNING';
	modeTime: string;
	modeTimeFormat: string;
	hatledSince: string;
	HaltingInHRS: string;
	angle: number;
	controllernum: string;
	cellId: number;
	gpsStatus: number;
	model: null | string;
	isacconnected: null | boolean;
	Yesterday_KM: number;
	ismainpoerconnected: string;
	alertCount: number;
	main_powervoltage: number;
	percentageBttry: number;
	tel_rfid: string;
	tel_odometer: number;
	jny_distance: string;
	veh_destinationShow: string;
	immoblizeStatus: number | null;
	notworkingHrs: number;
	port: number;
	alcoholLevel: number;
};

type VehicleTrip = {
	sys_service_id: number;
	lorry_no: string;
	trip_id: number;
	trip_status_update: string;
	party_name: string;
	challan_no: string;
	departure_date: string;
	station_from_location: string;
	station_to_location: string;
	arrival_date: string;
	totaltripkmbygoogle: string;
	delay: number;
	driver_name: string;
	driver_number: string | null;
	trip_status: string;
	trip_status_batch: string;
	veh_remark: string;
	TripCreateddate: string;
	SourceIn: string | null;
	SourceOut: string | null;
	DestinationIN: string | null;
	DestinationOut: string | null;
	Actualtriphour: number | null;
	Hourstaken: number | null;
	KM: string;
	gps: {
		latLngDtl: {
			lat: number;
			lng: number;
			latlong: string;
			addr: string;
			poi: string;
			gpstime: string;
			epochtime: number;
		};
		volt: number | null;
		fuel: number;
		temperature: number | null;
	};
};

type LatLngInfo = {
	lat: number;
	lng: number;
	latlong: string;
	addr: string;
	poi: string;
	gpstime: string;
	gps_fix: number;
	vId: number;
};

export type VehicleData = {
	vId: number;
	vehReg: string;
	transporterVendor: string;
	controllermergeId: string;
	drivers: Drivers;
	deviceId: string;
	ETA?: string;
	disInKM: number;
	gpsDtl: GpsDetail;
	vehicleState: string;
	vehicleTrip: VehicleTrip;
	GPSInfo: LatLngInfo;
	ELOCKInfo: LatLngInfo & {
		Unhealthy: {
			type: 'Buffer';
			data: [0 | 1];
		};
		UnhealthyDesc: string | null;
	};
};

export type GetListVehiclesMobResponse = {
	message: string;
	success: boolean;
	list: VehicleData[];
};

type Visibility = { visibility: boolean; isMarkerInfoWindowOpen: boolean };

export type Markers = Visibility & VehicleData;
