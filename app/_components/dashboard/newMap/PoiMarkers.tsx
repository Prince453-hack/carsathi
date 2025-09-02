'use client';

import { useEffect, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import { useDebounceObj } from '@/app/hooks/useDebounce';

const createLabelIcon = () => {
	const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0">
     
    </svg>
  `;
	return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Create a label marker with consistent styling
const createLabelMarker = (position: google.maps.LatLngLiteral, labelText: string, map: google.maps.Map) => {
	const labelIcon = createLabelIcon();

	return new google.maps.Marker({
		position,
		map,
		icon: labelIcon,
		label: {
			text: labelText,
			color: '#fff',
			fontSize: '11px', // Fixed font size
			fontWeight: '600',
			fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
			className: 'marker-label',
		},
		zIndex: 10,
	});
};

const PoiMarkersImperative = ({ bounds }: { bounds: any }) => {
	const poiData = useSelector((state: RootState) => state.poiData);

	const visiblePoi = useMemo(() => {
		return poiData.poi.filter((item) => {
			if (!bounds || !bounds.east || !bounds.north || !bounds.south || !bounds.west) return true;
			return (
				item.gps_latitude <= bounds.north &&
				item.gps_latitude >= bounds.south &&
				item.gps_longitude <= bounds.east &&
				item.gps_longitude >= bounds.west
			);
		});
	}, [poiData.poi, bounds]);

	const debouncePoi = useDebounceObj(visiblePoi, 500);
	const map = useMap();

	const visibleGeofence = useMemo(() => {
		return poiData.geofenceList.filter((item) => {
			return item.points.some((point) => {
				if (!bounds || !bounds.east || !bounds.north || !bounds.south || !bounds.west) return true;
				return (
					point.gps_latitude <= bounds.north &&
					point.gps_latitude >= bounds.south &&
					point.gps_longitude <= bounds.east &&
					point.gps_longitude >= bounds.west
				);
			});
		});
	}, [poiData.geofenceList, bounds]);

	const debounceGeofence = useDebounceObj(visibleGeofence, 500);

	useEffect(() => {
		if (!map) return;

		const circles: google.maps.Circle[] = [];
		const geofenceMarkers: google.maps.Polygon[] = [];
		const markers: google.maps.Marker[] = [];

		const circleOptions = {
			strokeColor: '#027832',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#027832',
			fillOpacity: 0.35,
			clickable: false,
			editable: false,
			zIndex: 1,
		};

		// Render POIs (Circles) with Labels
		debouncePoi
			.filter((item) => poiData.selectedPOI.id === -1 || item.id === poiData.selectedPOI.id)
			.forEach((item) => {
				const circle = new google.maps.Circle({
					...circleOptions,
					map,
					center: { lat: item.gps_latitude, lng: item.gps_longitude },
					radius: item.gps_radius,
				});
				circles.push(circle);

				const labelText = item.name?.substring(0, 20) || 'Unnamed POI';
				const position = { lat: item.gps_latitude, lng: item.gps_longitude };
				const labelMarker = createLabelMarker(position, labelText, map);
				markers.push(labelMarker);
			});

		// Render Geofences (Polygons) with Labels
		debounceGeofence
			.filter((item) => item.points.length > 0 && (poiData.selectedPOI.id === -1 || item.id === poiData.selectedPOI.id))
			.forEach((item) => {
				const polygon = new google.maps.Polygon({
					paths: item.points.map((p) => ({ lat: p.gps_latitude, lng: p.gps_longitude })),
					strokeColor: '#027832',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#027832',
					fillOpacity: 0.35,
					clickable: false,
					editable: false,
					zIndex: 1,
					map,
				});
				geofenceMarkers.push(polygon);

				const firstPoint = item.points[0];
				const labelText = item.name?.substring(0, 20) || 'Unnamed Geofence';
				const position = { lat: firstPoint.gps_latitude, lng: firstPoint.gps_longitude };
				const labelMarker = createLabelMarker(position, labelText, map);
				markers.push(labelMarker);
			});

		// Cleanup function
		return () => {
			markers.forEach((marker) => marker.setMap(null));
			circles.forEach((circle) => circle.setMap(null));
			geofenceMarkers.forEach((polygon) => polygon.setMap(null));
		};
	}, [map, debouncePoi, debounceGeofence, poiData]);

	return null;
};

export default PoiMarkersImperative;
