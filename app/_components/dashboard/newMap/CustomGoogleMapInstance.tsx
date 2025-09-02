'use client';

import React, { useEffect, useState } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import InfoBanner from '../../common/InfoBanner';
import MapTypeController from '../MapTypeController';
import { isCheckInAccount } from '@/app/helpers/isCheckInAccount';
import { StartAndEndPointMarker } from './StartAndEndPointMarker';
import CustomPolyline from './CustomPolyline';
import { Markers } from './Markers';
import { FloatButton } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { PoiToggle } from '../PoiToggle';
import { PolygonToggle } from '../PolygonToggle';
import { ClusterToggle } from '../ClusterToggle';
import { CreateTripOrPlanMarker } from './CreateTripOrPlanMarker';
import { getLatestGPSTime } from '../utils/getLatestGPSTime';
import { StoppageMarkersImperative } from './StoppageMarkers';
import { AlertMarkersImperative } from './AlertMarkers';
import { PolylineMarkersImperative } from './PolylineMarkers';
import { HistoryReplaySlider } from '../HistoryReplaySlider';

import PoiMarkersImperative from './PoiMarkers';
import { HistoryReplayToggle } from '../HistoryReplayToggle';
import { HistoryReplayMarker } from './HistoryReplayMarker';

const getMarkerPosition = (marker: any, auth: any) => {
	if (auth.accessLabel === 6 && getLatestGPSTime(marker) === 'ELOCK') {
		return {
			lat: marker.ELOCKInfo.lat,
			lng: marker.ELOCKInfo.lng,
		};
	} else {
		return {
			lat: marker.gpsDtl.latLngDtl.lat,
			lng: marker.gpsDtl.latLngDtl.lng,
		};
	}
};

export const CustomGoogleMapInstance = () => {
	const map = useMap();
	const [bounds, setBounds] = useState<{ north: number | null; east: number | null; south: number | null; west: number | null } | null>(null);
	const [isFloatSettingButtons, setIsFloatSettingButtons] = useState(false);
	const [checked, setChecked] = useState('');
	const [manualReRenderMapLoader, setManualReRenderMapLoader] = useState(false);

	const { containerStyle, zoomNo, centerOfMap, selectedMapTypeId } = useSelector((state: RootState) => state.map);
	const { userId, accessLabel } = useSelector((state: RootState) => state.auth);
	const markers = useSelector((state: RootState) => state.markers);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const historyReplay = useSelector((state: RootState) => state.historyReplay);
	const vehicleItnaryWithPath = useSelector((state: RootState) => state.vehicleItnaryWithPath);
	const { isGetNearbyVehiclesActive } = useSelector((state: RootState) => state.nearbyVehicles);
	const liveVehicleItnaryWithPath = useSelector((state: RootState) => state.liveVehicleData);
	const selectedDashboardVehicle = useSelector((state: RootState) => state.selectedDashboardVehicle);
	const isGetVehiclesByStatusLoading = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((q) => q && q.endpointName === 'getVehiclesByStatus' && q.status === 'pending')
	);

	const isGetCurrentLocationPending = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((q) => q && q.endpointName === 'getVehicleCurrentLocation' && q.status === 'pending')
	);

	// Effect to update map bounds or center based on conditions
	useEffect(
		() => {
			if (!map) return; // Exit if map instance is not available

			// Case 1: Single vehicle selected
			if (selectedVehicle.vId !== 0) {
				if (historyReplay.isHistoryReplayMode) {
					// Sub-case: History replay mode is active
					if (vehicleItnaryWithPath.patharry?.length > 0) {
						const pathBounds = new google.maps.LatLngBounds();
						vehicleItnaryWithPath.patharry.forEach((point) => {
							if (point.lat !== 0 && point.lng !== 0) {
								pathBounds.extend({ lat: point.lat, lng: point.lng });
							}
						});
						if (!pathBounds.isEmpty()) {
							map.fitBounds(pathBounds); // Fit map to the historical path bounds
						}
					}
				} else {
					if (isGetCurrentLocationPending == false) {
						// Sub-case: History replay mode is inactive
						const position = getMarkerPosition(selectedVehicle, { accessLabel });
						if (position.lat !== 0 && position.lng !== 0) {
							map.setCenter(position); // Center map on current vehicle position
							map.setZoom(15); // Set a specific zoom level (e.g., 15)
						}
					}
				}
			}
			// Case 2: No vehicle selected (keep existing behavior)
			else {
				if (isGetVehiclesByStatusLoading === false) {
					const latLngBounds = new google.maps.LatLngBounds();
					let visibleMakers = 0;
					markers.forEach((marker) => {
						if (marker.visibility) {
							visibleMakers++;
							const position = getMarkerPosition(marker, { accessLabel });
							if (position.lat !== 0 && position.lng !== 0) {
								latLngBounds.extend(position);
							}
						}
					});

					if (!latLngBounds.isEmpty()) {
						map.fitBounds(latLngBounds); // Fit map to all visible markers
						if (visibleMakers === 1) {
							google.maps.event.addListenerOnce(map, 'idle', () => {
								map.setZoom((map.getZoom() ?? 15) - 8);
							});
						}
					}
				}
			}
		},

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			map,
			selectedVehicle,
			historyReplay.isHistoryReplayMode,
			vehicleItnaryWithPath.patharry,
			accessLabel,
			selectedDashboardVehicle,
			isGetVehiclesByStatusLoading,
		]
	);
	const onIdle = () => {
		if (map) {
			const b = map.getBounds();
			setBounds({
				north: b?.getNorthEast().lat() ?? null,
				east: b?.getNorthEast().lng() ?? null,
				south: b?.getSouthWest().lat() ?? null,
				west: b?.getSouthWest().lng() ?? null,
			});
		}
	};

	return (
		<Map
			defaultCenter={centerOfMap}
			defaultZoom={zoomNo}
			style={{ ...containerStyle }}
			onIdle={onIdle}
			mapTypeControl={false}
			mapTypeId={selectedMapTypeId}
		>
			{/* Existing JSX remains unchanged */}
			<InfoBanner />
			<MapTypeController />
			{isCheckInAccount(Number(userId)) ? (
				<>{/* Check-in specific markers if needed */}</>
			) : (
				<>
					{selectedVehicle.vId && vehicleItnaryWithPath.patharry && vehicleItnaryWithPath.patharry.length >= 2 && !isGetNearbyVehiclesActive ? (
						<>
							<StartAndEndPointMarker />
							<CustomPolyline path={historyReplay.isHistoryReplayMode ? vehicleItnaryWithPath.patharry : []} />
						</>
					) : null}

					{selectedVehicle.vId && liveVehicleItnaryWithPath.patharry && !isGetNearbyVehiclesActive ? (
						<>
							<StartAndEndPointMarker />
							<CustomPolyline path={!historyReplay.isHistoryReplayMode ? liveVehicleItnaryWithPath.patharry : []} />
						</>
					) : null}

					<Markers />

					{!isGetNearbyVehiclesActive && selectedVehicle.selectedVehicleHistoryTab === 'Alerts' ? <AlertMarkersImperative /> : null}

					{!isGetNearbyVehiclesActive &&
					(selectedVehicle.selectedVehicleHistoryTab === 'All' ||
						selectedVehicle.selectedVehicleHistoryTab === 'Stoppages' ||
						selectedVehicle.selectedVehicleHistoryTab === 'Running' ||
						selectedVehicle.selectedVehicleHistoryTab === 'Diagnostic') ? (
						<StoppageMarkersImperative />
					) : null}

					<PolylineMarkersImperative />

					{/* not in below */}
					<HistoryReplaySlider />
					<HistoryReplayMarker />
					<PoiMarkersImperative bounds={bounds} />

					<CreateTripOrPlanMarker />
					<FloatButton.Group
						open={isFloatSettingButtons}
						trigger='click'
						onClick={() => setIsFloatSettingButtons(!isFloatSettingButtons)}
						style={{ insetInlineEnd: 10, insetBlockEnd: 200 }}
						icon={<SettingOutlined />}
					>
						<HistoryReplayToggle />
						<PoiToggle checked={checked} setChecked={setChecked} />
						<PolygonToggle />
						{/* {selectedVehicle.vId !== 0 ? <NearbyVehiclesToggle /> : null} */}
						{selectedVehicle.vId === 0 ? <ClusterToggle setLoading={setManualReRenderMapLoader} /> : null}
					</FloatButton.Group>
				</>
			)}
		</Map>
	);
};
