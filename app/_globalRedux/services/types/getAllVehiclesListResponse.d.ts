interface GetAllVehiclesListResponse {
	message: string;
	success: boolean;
	list: [
		{
			id: number;
			veh_reg: string;
			veh_body: string;
		}
	];
}
