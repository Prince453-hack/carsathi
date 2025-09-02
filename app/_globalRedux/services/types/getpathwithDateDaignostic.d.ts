interface PathwithDateDaignosticData {
	totalDistance: string;
	totalTime: string;
	totalTimeInMIN: number;
	fromLat: number;
	fromLng: number;
	startLocation: string;
	fromTime: string;
	toLat: number;
	toLong: number;
	toTime: string;
	mode: 'Running' | 'Idle';
	fromTimetoMatch: string;
	endLocation: string;
	toTimetoMatch: string;
}

interface GetpathwithDateDaignosticReponse {
	message: string;
	success: boolean;
	data: PathwithDateDaignosticData[];
	fromTime: string;
	toTime: string;
	totalDistance: string;
	stoppageTime: string;
	runningTime: string;
	calculatedTotalDistance: number;
	totalRunningDistanceKM: string;
	totalNogps: number;
	totalIdledistance: number;
	avgSpeedKMH: number;
	totalStoppage: number;
	patharry: PathArrayItem[] | [];
	vehicleId: number;
}
