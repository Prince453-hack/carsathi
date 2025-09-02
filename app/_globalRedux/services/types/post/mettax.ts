// create token
interface CreateTokenResponse {
	code: number;
	data: string;
	msg: string;
}

interface GetMettaxDevicesResponse {
	code: number;
	data: {
		deviceData: {
			deviceName: string;
			deviceId: string;
			deviceTime: string;
			address: any;
			speed: number;
			course: number;
			acc: number;
			lat: number;
			lon: number;
			num: number;
			signal: number;
			quantity: any;
			voltage: any;
			elec: number;
			type: number;
			voltageLevel: any;
			rssi: any;
			disarmingStatus: any;
			chargeStatus: any;
			blockedStatus: number;
		};
		expand: { status: boolean; activeTime: string; reportTime: string };
	}[];
	msg: string;
}

interface GetMettaxDeviceInfoResponse {
	code: number;
	data: { id: string; channelName: string };
	msg: string;
}
