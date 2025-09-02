'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { RootState } from '@/app/_globalRedux/store';
import { useMap } from '@vis.gl/react-google-maps';

export const HistoryReplayMarker = () => {
	// Get the map instance
	const map = useMap();

	// Retrieve state from Redux store
	const vehicleItnaryWithPath = useSelector((state: RootState) => state.vehicleItnaryWithPath);
	const historyReplay = useSelector((state: RootState) => state.historyReplay);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);

	// State to hold the marker and info window instances
	const [marker, setMarker] = useState<google.maps.Marker | null>(null);
	const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

	// Effect to manage the marker and info window imperatively
	useEffect(() => {
		if (!map) return;

		const shouldShowMarker =
			vehicleItnaryWithPath.patharry && vehicleItnaryWithPath.patharry.length >= 2 && historyReplay.isHistoryReplayMode && selectedVehicle.vId !== 0;

		let newMarker = marker;
		let newInfoWindow = infoWindow;

		if (shouldShowMarker) {
			const manualPathIndex = Math.floor((historyReplay.manualPath / 100) * (vehicleItnaryWithPath.patharry.length - 2));
			const pathIndex = historyReplay.currentPathArrayIndex + manualPathIndex;
			const pathPoint = pathIndex >= 0 && pathIndex < vehicleItnaryWithPath.patharry.length ? vehicleItnaryWithPath.patharry[pathIndex] : null;

			if (pathPoint) {
				const position = { lat: pathPoint.lat, lng: pathPoint.lng };

				if (!newMarker) {
					newMarker = new google.maps.Marker({
						position,
						map,
						icon: {
							url: '/assets/images/map/moving-vehicle.png',
							scaledSize: new google.maps.Size(60, 60),
							anchor: new google.maps.Point(30, 30),
						},
					});
					setMarker(newMarker);

					newInfoWindow = new google.maps.InfoWindow({
						content: getInfoWindowContent(pathPoint),
					});
					setInfoWindow(newInfoWindow);

					newMarker.addListener('click', () => {
						newInfoWindow && newInfoWindow.open(map, newMarker);
					});

					if (historyReplay.isHistoryReplayPlaying) {
						newInfoWindow.open(map, newMarker);
					}
				} else {
					newMarker.setPosition(position);
					if (newInfoWindow) {
						newInfoWindow.setContent(getInfoWindowContent(pathPoint));
						if (historyReplay.isHistoryReplayPlaying) {
							newInfoWindow.open(map, newMarker);
						} else {
							newInfoWindow.close();
						}
					}
				}
			}
		} else {
			if (newMarker) {
				newMarker.setMap(null);
				setMarker(null);
			}
			if (newInfoWindow) {
				newInfoWindow.close();
				setInfoWindow(null);
			}
		}

		return () => {
			if (newMarker && !shouldShowMarker) {
				newMarker.setMap(null);
			}
			if (newInfoWindow && !shouldShowMarker) {
				newInfoWindow.close();
			}
		};
	}, [map, vehicleItnaryWithPath, historyReplay, selectedVehicle]);

	// Function to generate info window content
	const getInfoWindowContent = (pathPoint: any) => {
		return `
      <div class="text-xs text-gray-800 flex flex-col gap-1 max-w-80">
        <div class="flex justify-between mb-1 absolute top-5">
          <p class="font-medium text-lg">Movement Information</p>
        </div>
        <div class="grid grid-cols-5 gap-1 grid-flow-row-dense text-sm font-normal">
          <div class="col-span-2 font-medium text-neutral-700">Date Time:</div>
          <div class="col-span-3">${moment(pathPoint.datetime).format('Do MMM, YYYY HH:mm')}</div>
          <div class="col-span-2 font-medium text-neutral-700">Position:</div>
          <div class="col-span-3">${String(pathPoint.lat).slice(0, 5)}, ${String(pathPoint.lng).slice(0, 5)}</div>
          <div class="col-span-2 font-medium text-neutral-700">KM Covered:</div>
          <div class="col-span-3">${pathPoint.distance?.toFixed(2)} Km</div>
          <div class="col-span-2 font-medium text-neutral-700">Speed:</div>
          <div class="col-span-3">${pathPoint.speed} Km/h</div>
        </div>
      </div>
    `;
	};

	// Return null since we’re managing the marker imperatively
	return null;
};
