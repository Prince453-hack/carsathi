import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface POI {
	id: number;
	sys_user_id: number;
	name: string;
	gps_latitude: number;
	gps_longitude: number;
	gps_radius: number;
}

export interface Geofence {
	id: number;
	name: string;
	typeId: number;
	points: {
		gps_latitude: number;
		gps_longitude: number;
	}[];
}

export const initialPOIDropDownState: { poi: POI[]; selectedPOI: POI | Geofence; geofenceList: Geofence[] } = {
	poi: [],
	geofenceList: [],
	selectedPOI: { id: -1, sys_user_id: 0, name: '', gps_latitude: 0, gps_longitude: 0, gps_radius: 0 },
};

export const poiSlice = createSlice({
	name: 'poi-data',
	initialState: initialPOIDropDownState,
	reducers: {
		setPoiData: (state, action: PayloadAction<{ poi: POI[] }>) => {
			state.poi = action.payload.poi;

			return state;
		},

		setGeoFence: (state, action: PayloadAction<{ geofenceList: Geofence[] }>) => {
			state.geofenceList = action.payload.geofenceList;

			return state;
		},

		setSelectedPOI: (state, action: PayloadAction<POI | Geofence>) => {
			state.selectedPOI = action.payload;

			return state;
		},
	},
});
export const { setPoiData, setGeoFence, setSelectedPOI } = poiSlice.actions;
export default poiSlice.reducer;
