'use client';

import { DrawingManager } from '@/@react-google-maps/api';
import {
	setCenter,
	setCircle,
	setCoordinates,
	setDrawingManager,
	setIsCreatePoiModalOpen,
	setName,
	setPolygon,
	setRadius,
} from '@/app/_globalRedux/dashboard/createPoi';
import { setIsLoadingScreenActive } from '@/app/_globalRedux/dashboard/mapSlice';
import { setGeoFence, setPoiData } from '@/app/_globalRedux/dashboard/poiSlice';
import { useCreateGeofenceMutation, useLazyCreatePOIQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { RootState } from '@/app/_globalRedux/store';
import { Button, Input, message, Modal } from 'antd';
import { NoticeType } from 'antd/es/message/interface';
import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

function PolygonDrawingOptions() {
	const { isCreatePoi } = useSelector((state: RootState) => state.createPoi);

	return (
		<div>
			{isCreatePoi ? (
				<>
					<CustomDrawingManager />
					<PolygonDrawingModal />
				</>
			) : null}
		</div>
	);
}

export default PolygonDrawingOptions;

const CustomDrawingManager = () => {
	const { shape, isCreatePoi } = useSelector((state: RootState) => state.createPoi);
	const dispatch = useDispatch();
	if (shape) {
		return (
			<DrawingManager
				drawingMode={shape}
				onLoad={(drawingManager) => {
					dispatch(setDrawingManager(drawingManager));
				}}
				options={{
					drawingControl: false,
					drawingControlOptions: {
						drawingModes: [shape],
					},
					drawingMode: isCreatePoi ? shape : null,
					polygonOptions: {
						editable: false,
						strokeColor: '#478C81',
						strokeWeight: 3,
						fillColor: '#478C81',
						fillOpacity: 0.3,
					},
					circleOptions: {
						editable: false,
						strokeColor: '#478C81',
						strokeWeight: 3,
						fillColor: '#478C81',
						fillOpacity: 0.3,
					},
				}}
				onCircleComplete={(circle) => {
					const circleBounds = circle.getRadius();
					const bounds = [];
					bounds.push(circle.getCenter());
					dispatch(setCircle(circle));
					dispatch(setIsCreatePoiModalOpen(true));
					dispatch(setCenter({ lat: bounds[0]?.lat() || 0, lng: bounds[0]?.lng() || 0 }));
					dispatch(setRadius(circleBounds));
				}}
				onPolygonComplete={(polygon) => {
					const polygonBounds = polygon.getPath().getArray();
					const bounds = [];
					for (var i = 0; i < polygonBounds.length; i++) {
						var point = {
							lat: polygonBounds[i].lat(),
							lng: polygonBounds[i].lng(),
						};
						bounds.push(point);
					}

					dispatch(setPolygon(polygon));
					dispatch(setIsCreatePoiModalOpen(true));
					dispatch(setCoordinates(bounds));
				}}
			/>
		);
	}
	return <></>;
};

const Subtitle = ({ title }: { title: string }) => <h3 className='font-semibold'>{title}</h3>;
const DataSet = ({ title, dataSet }: { title: string; dataSet: any }) => (
	<div className='flex gap-3 items-center'>
		<Subtitle title={title} />
		{dataSet}
	</div>
);

const PolygonDrawingModal = () => {
	const [messageApi, contextHolder] = message.useMessage();

	const createMessage = ({ type, content }: { type: NoticeType; content: string }) => {
		messageApi.open({
			type: type,
			content,
		});
	};

	const { userId, groupId } = useSelector((state: RootState) => state.auth);
	const { isCreatePoiModalOpen, shape, center, coordinates, radius, name, circle, polygon, drawingManager } = useSelector(
		(state: RootState) => state.createPoi
	);
	const { poi, geofenceList, selectedPOI } = useSelector((state: RootState) => state.poiData);

	const dispatch = useDispatch();

	const [createGeofence, { isLoading: isCreateGeofenceLoading }] = useCreateGeofenceMutation();
	const [triggerCreatePOI, { isLoading: isCreatePOILoading }] = useLazyCreatePOIQuery();

	const [error, setError] = React.useState('');

	const cancelDrawingPoi = () => {
		dispatch(setCenter({ lat: 0, lng: 0 }));
		dispatch(setRadius(0));
		dispatch(setCoordinates([]));
		dispatch(setName(''));
		circle?.setVisible(false);
		polygon?.setVisible(false);
		dispatch(setPolygon(null));
		dispatch(setCircle(null));
		dispatch(setIsCreatePoiModalOpen(false));
	};

	const createPoi = async () => {
		try {
			if (shape === 'polygon') {
				await triggerCreatePOI({
					poiName: name,
					radius: 1000,
					lat: coordinates[0].lat,
					long: coordinates[0].lng,
					userId: userId,
					isGeofence: 24,
				});
				setTimeout(async () => {
					await createGeofence({
						userId: userId,
						token: Number(groupId),
						points: coordinates,
						radius: 1000,
						name: name,
					});
					createMessage({ type: 'success', content: 'POI created successfully!' });
					let tempCords = coordinates.map((item) => {
						return { gps_latitude: item.lat, gps_longitude: item.lng };
					});
					dispatch(setGeoFence({ geofenceList: [...geofenceList, { name: name, points: tempCords, id: Math.random() * 100, typeId: 24 }] }));
				}, 1);
			} else if (shape === 'circle') {
				await triggerCreatePOI({
					poiName: name,
					radius: radius,
					lat: center.lat,
					long: center.lng,
					userId: userId,
					isGeofence: 0,
				});
				createMessage({ type: 'success', content: 'POI created successfully!' });
				dispatch(
					setPoiData({
						poi: [
							...poi,
							{
								name: name,
								gps_latitude: center.lat,
								gps_longitude: center.lng,
								gps_radius: radius,
								sys_user_id: Number(userId),
								id: Math.random() * 100,
							},
						],
					})
				);
			}

			cancelDrawingPoi();

			dispatch(setIsLoadingScreenActive(true));

			setTimeout(() => dispatch(setIsLoadingScreenActive(false)), 1);
		} catch (err) {
			createMessage({ type: 'error', content: 'Something went wrong, please try again!' });
		}
	};
	return (
		<>
			{contextHolder}
			<Modal
				title={`Create ${(shape?.toUpperCase().split('')[0] ?? '') + (shape?.toLowerCase().slice(1) ?? '')}`}
				open={isCreatePoiModalOpen}
				onCancel={() => {
					cancelDrawingPoi();
				}}
				footer={null}
			>
				{shape === 'polygon' ? (
					<div className='space-y-2'>
						<div className='flex gap-3 items-center'>
							<Subtitle title={'Name: '} />
							<div className='flex gap-5 items-center'>
								<div className='border-b-[1px]  border-neutral-300 px-0.5'>
									<Input
										type='text'
										variant='borderless'
										value={name}
										onChange={(e) => dispatch(setName(e.target.value))}
										styles={{ input: { padding: 0 } }}
									/>
								</div>
								{error ? <p className='text-red-500 text-xs'>{error}</p> : <p className='text-red-500 text-xs'></p>}
							</div>
						</div>
						<Subtitle title={'Coordinates: '} />
						{coordinates.map((coordinate) => {
							return (
								<div key={coordinate.lat + coordinate.lng} className='flex gap-5 items-center mb-2'>
									<div className='w-[80px]'>
										<DataSet title={'Lat: '} dataSet={coordinate.lat?.toFixed(2)} />
									</div>
									<div className='w-[80px]'>
										<DataSet title={'Lng: '} dataSet={coordinate.lng?.toFixed(2)} />
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className='space-y-2'>
						<div className='flex gap-3 items-center'>
							<Subtitle title={'Name: '} />
							<div className='flex gap-5 items-center'>
								<div className='border-b-[1px]  border-neutral-300 px-0.5'>
									<Input
										type='text'
										variant='borderless'
										value={name}
										onChange={(e) => dispatch(setName(e.target.value))}
										styles={{ input: { padding: 0 } }}
									/>
								</div>
								{error ? <p className='text-red-500 text-xs'>{error}</p> : <p className='text-red-500 text-xs'></p>}
							</div>
						</div>

						<Subtitle title={'Center: '} />

						<div className='flex gap-2 items-center'>
							<div className='w-[80px]'>
								<DataSet title={'Lat: '} dataSet={center.lat?.toFixed(2)} />
							</div>
							<div className='w-[80px]'>
								<DataSet title={'Lng: '} dataSet={center.lng?.toFixed(2)} />
							</div>
						</div>
						<DataSet title={'Radius: '} dataSet={radius} />
					</div>
				)}
				<div className='space-x-3 flex justify-end mt-5'>
					<Button onClick={() => cancelDrawingPoi()}>Close</Button>

					<Button
						type='primary'
						onClick={() => {
							if (name === '') {
								setError('Name is required');
							} else {
								createPoi();
							}
						}}
						loading={isCreatePOILoading || isCreateGeofenceLoading}
					>
						Save
					</Button>
				</div>
			</Modal>
		</>
	);
};
