'use client';

import { createSlice } from '@reduxjs/toolkit';

type VehicleOverviewOptions = {
	shareUrlOpenIndex: number;
	optionOpenIndex: number;
	mapYourVehicleIndex: number;
	driverInfoIndex: number;
	createPOIIndex: number;
};

const initialState: VehicleOverviewOptions = {
	shareUrlOpenIndex: -1,
	optionOpenIndex: -1,
	mapYourVehicleIndex: -1,
	driverInfoIndex: -1,
	createPOIIndex: -1,
};

const optionsSlice = createSlice({
	name: 'vehicle-overview-options',
	initialState,
	reducers: {
		setIsShareUrlOpenIndex: (state, action: { payload: number; type: string }) => {
			state.shareUrlOpenIndex = action.payload;
			return state;
		},
		setOptionsIndex: (state, action: { payload: number; type: string }) => {
			if (state.optionOpenIndex === action.payload) {
				state.optionOpenIndex = -1;
			} else {
				state.optionOpenIndex = action.payload;
			}
			return state;
		},
		setMapYourInfoIndex: (state, action: { payload: number; type: string }) => {
			if (state.mapYourVehicleIndex === action.payload) {
				state.mapYourVehicleIndex = -1;
			} else {
				state.mapYourVehicleIndex = action.payload;
			}
			return state;
		},
		setDriverInfoIndex: (state, action: { payload: number; type: string }) => {
			if (state.driverInfoIndex === action.payload) {
				state.driverInfoIndex = -1;
			} else {
				state.driverInfoIndex = action.payload;
			}
			return state;
		},
		setCreatePoiIndex: (state, action: { payload: number; type: string }) => {
			if (state.createPOIIndex === action.payload) {
				state.createPOIIndex = -1;
			} else {
				state.createPOIIndex = action.payload;
			}
			return state;
		},
		resetOption: (state) => {
			state = initialState;
			return state;
		},
	},
});
export const { setIsShareUrlOpenIndex, setOptionsIndex, setMapYourInfoIndex, setDriverInfoIndex, resetOption, setCreatePoiIndex } =
	optionsSlice.actions;
export default optionsSlice.reducer;
