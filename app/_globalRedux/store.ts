'use client';

import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './dashboard/mapSlice';
import olMapReducer from './dashboard/olMapSlice';
import selectedVehicleReducer from './dashboard/selectedVehicleSlice';
import selectedDashboardVehicleReducer from './dashboard/dashboardVehicleDetailsSelect';
import collapseVehicleStatusToggleReducer from './dashboard/collapseVehicleStatusToggleSlice';
import collapseTripStatusToggleReducer from './dashboard/collapseTripStatusToggleSlice';
import markersReducer from './dashboard/markersSlice';
import authReducer from './common/authSlice';
import clusterReducer from './common/clusterSlice';
import globalNewMapCluster from './dashboard/globalNewMapCluster';
import vehicleItnaryWithPathReducer from './dashboard/vehicleItnaryWithPathSlice';
import isVehicleDetailsCollapsedReducer from './dashboard/isVehicleDetailsCollapsedSlice';
import historyReplayReducer from './dashboard/historyReplaySlice';
import selectedVehicleCustomRangeReducer from './dashboard/selectedVehicleCustomRangeSlice';
import selectedVehicleListTabReducer from './dashboard/selectedVehicleListTab';
import mapAlertIconsReducer from './dashboard/mapAlertIcons';
import nearbyVehicleReducer from './dashboard/nearbyVehicleSlice';
import poiDataReducer from './dashboard/poiSlice';
import liveVehicleItnaryWithPathReducer from './dashboard/liveVehicleSlice';
import isDashboardVehicleDetailsSearchTriggeredReducer from './dashboard/isDashboardVehicleDetailsSearchTriggered';
import isVehicleStatusOrTripStatusActiveReducer from './dashboard/isVehicleStatusOrTripStatusActive';
import createTripOrTripPlanningActiveReducer from './dashboard/createTripOrTripPlanningActive';
import allVehiclesReducer from './dashboard/allVehicles';
import selectedTripReducer from './dashboard/selectedTripSlice';
import editTripOrTripPlanningActiveReducer from './dashboard/editTripOrEditPlanningActive';
import markerInfoWindowReducer from './dashboard/markerInfoWindow';
import CreatePOIReducer from './dashboard/createPoi';
import CreateOlPOIReducer from './dashboard/createOlPoi';
import CheckInDataReducer from './dashboard/CheckInData';
import VideoTelematicsReducer from './dashboard/videoTelematics';
import IsApmTotalKmLoadingReducer from './dashboard/isApmTotalKmLoading';

// services
import { trackingDashboard } from './services/trackingDashboard';
import { tracking } from './services/tracking';
import { setupListeners } from '@reduxjs/toolkit/query';
import { reactApi } from './services/reactApi';
import { yatayaatNewTrackingApi } from './services/yatayaatNewtracking';
import optionsSlice from './dashboard/optionsSlice';
import { serverLiveApi } from './services/serverLive';
import { masterData } from './services/masterData';
import { gtracNewtracking } from './services/gtrac_newtracking';
import { yatyaat } from './services/yatayaat';
import { trackingReport } from './services/trackingReport';
import { mettax } from './services/mettax';
import { carvanMapTracking } from './services/carvanmaptracking';

export const store = configureStore({
	reducer: {
		map: mapReducer,
		olMap: olMapReducer,
		cluster: clusterReducer,
		globalNewMapCluster: globalNewMapCluster,
		selectedVehicle: selectedVehicleReducer,
		selectedDashboardVehicle: selectedDashboardVehicleReducer,
		collapseVehicleStatusToggle: collapseVehicleStatusToggleReducer,
		markers: markersReducer,
		auth: authReducer,
		vehicleItnaryWithPath: vehicleItnaryWithPathReducer,
		isVehicleDetailsCollapsedSlice: isVehicleDetailsCollapsedReducer,
		historyReplay: historyReplayReducer,
		customRange: selectedVehicleCustomRangeReducer,
		mapAlertsIcons: mapAlertIconsReducer,
		vehicleOverviewOptions: optionsSlice,
		selectedVehicleListTab: selectedVehicleListTabReducer,
		nearbyVehicles: nearbyVehicleReducer,
		poiData: poiDataReducer,
		liveVehicleData: liveVehicleItnaryWithPathReducer,
		isDashboardVehicleDetailsSearchTriggered: isDashboardVehicleDetailsSearchTriggeredReducer,
		selectedTrip: selectedTripReducer,
		collapseTripStatusToggle: collapseTripStatusToggleReducer,
		isVehicleStatusOrTripStatusActive: isVehicleStatusOrTripStatusActiveReducer,
		createTripOrPlanningTripActive: createTripOrTripPlanningActiveReducer,
		allVehicles: allVehiclesReducer,
		editTripOrPlanningTripActive: editTripOrTripPlanningActiveReducer,
		isMarkerInfoWindowOpen: markerInfoWindowReducer,
		createPoi: CreatePOIReducer,
		createOlPoi: CreateOlPOIReducer,
		checkIndData: CheckInDataReducer,
		videoTelematics: VideoTelematicsReducer,
		isApmTotalKmmLoading: IsApmTotalKmLoadingReducer,

		[trackingDashboard.reducerPath]: trackingDashboard.reducer,
		[tracking.reducerPath]: tracking.reducer,
		[masterData.reducerPath]: masterData.reducer,
		[reactApi.reducerPath]: reactApi.reducer,
		[yatayaatNewTrackingApi.reducerPath]: yatayaatNewTrackingApi.reducer,
		[serverLiveApi.reducerPath]: serverLiveApi.reducer,
		[gtracNewtracking.reducerPath]: gtracNewtracking.reducer,
		[yatyaat.reducerPath]: yatyaat.reducer,
		[trackingReport.reducerPath]: trackingReport.reducer,
		[mettax.reducerPath]: mettax.reducer,
		[carvanMapTracking.reducerPath]: carvanMapTracking.reducer,
	},
	devTools: process.env.NODE_ENV !== 'production',
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({}).concat([
			trackingDashboard.middleware,
			tracking.middleware,
			reactApi.middleware,
			yatayaatNewTrackingApi.middleware,
			serverLiveApi.middleware,
			masterData.middleware,
			gtracNewtracking.middleware,
			yatyaat.middleware,
			trackingReport.middleware,
			mettax.middleware,
			carvanMapTracking.middleware,
		]),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
