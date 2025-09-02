'use client';

import { setAllMarkers } from '@/app/_globalRedux/dashboard/markersSlice';
import { initialSelectedVehicleState, setSelectedVehicleBySelectElement } from '@/app/_globalRedux/dashboard/selectedVehicleSlice';
import { RootState } from '@/app/_globalRedux/store';
import { CloseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VehicleDetailsSelect } from '../VehicleDetailsSelect';
import { setVehicleDetailsStatus } from '@/app/_globalRedux/dashboard/isVehicleStatusOrTripStatusActive';
import Image from 'next/image';
import BlurBg from '@/public/assets/images/common/blurbg.jpg';
import { useGetMettaxDeviceInfoMutation } from '@/app/_globalRedux/services/mettax';
import { setChannels } from '@/app/_globalRedux/dashboard/videoTelematics';
import { getToken } from '@/lib/mettax';

const selectedStyles = {
	selectorBg: 'transparent',
	colorBorder: 'transparent',
	fontSize: 19,
	optionFontSize: 14,
	optionPadding: '5px',
	optionSelectedColor: '#000',
};

const VideoOverview = () => {
	const dispatch = useDispatch();
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const collapseVehicleStatusToggle = useSelector((state: RootState) => state.collapseVehicleStatusToggle);
	const markers = useSelector((state: RootState) => state.markers);
	const { channels, selectedVehicleDeviceId } = useSelector((state: RootState) => state.videoTelematics);

	const [getMettaxDeviceInfo] = useGetMettaxDeviceInfoMutation();

	const [activeChannelId, setActiveChannelId] = useState<number[]>([]);
	const [visibleDetailsStyling, setVisibleDetailsStyling] = useState('');
	const [channelsVideoLinks, setChannelsVideoLinks] = useState<string[]>([]);

	const setChannelsFn = async () => {
		try {
			const response = await getMettaxDeviceInfo({
				deviceId: selectedVehicleDeviceId,
			}).unwrap();

			const channelObj = (await JSON.parse(response.data.channelName)) as Array<{ id: number; name: string }>;
			dispatch(setChannels(channelObj.map((channel) => channel.id)));
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (selectedVehicle.vId === 0) {
			if (collapseVehicleStatusToggle) {
				setVisibleDetailsStyling('-translate-x-[442px]');
			} else {
				setVisibleDetailsStyling('-translate-x-[20px]');
			}
		} else if (selectedVehicle.vId !== 0) {
			if (collapseVehicleStatusToggle) {
				setVisibleDetailsStyling('translate-x-[20px]');
			} else {
				setVisibleDetailsStyling('translate-x-[442px]');
			}
			dispatch(setChannels([]));
			setChannelsFn();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVehicle, collapseVehicleStatusToggle]);

	useEffect(() => {
		if (channels.length > 0) {
			getToken().then((token) => {
				const channelsLinksList: string[] = [];
				channels.forEach((channel) => {
					const link = `https://mettaxiot.com/h5/#/live/v2?deviceId=${selectedVehicleDeviceId}&channelId=${channel}&token=${token}`;
					channelsLinksList.push(link);
				});
				setChannelsVideoLinks(channelsLinksList);
			});
			setActiveChannelId([]);
		}
	}, [channels, selectedVehicleDeviceId]);

	return (
		<div
			className={`ml-2 absolute py-[22px] z-20 ${visibleDetailsStyling} min-w-[450px] w-[450px] bg-neutral-green h-[calc(100vh-60px)] transition-all duration-300`}
		>
			<div className='flex items-center justify-between px-5 mb-4'>
				<div className='flex gap-2 items-start flex-col'>
					<p className='text-primary-green font-semibold text-sm ml-1'>Video Overview</p>
					<div className='w-full'>
						<VehicleDetailsSelect selectedStyles={selectedStyles} type='' />
					</div>
				</div>
				<Tooltip title='Close' placement='right' mouseEnterDelay={1}>
					<div
						className='pr-1'
						onClick={() => {
							dispatch(setSelectedVehicleBySelectElement(initialSelectedVehicleState));
							// dispatch(setHistoryReplayModeToggle(false));
							setActiveChannelId([]);
							dispatch(setAllMarkers(markers.map((m) => ({ ...m, isVisible: true, isVisibility: true, visibility: true }))));
							dispatch(setVehicleDetailsStatus({ type: 'vehicle' }));
						}}
					>
						<CloseOutlined className='cursor-pointer' />
					</div>
				</Tooltip>
			</div>

			{/* <div className='px-5'>
				<CustomRangePicker />
			</div> */}

			<div className='space-y-2 px-5 mt-4 flex-col items-center'>
				{channels.map((channel, index) => (
					<div key={channel} className='aspect-video relative'>
						{activeChannelId.includes(channel) ? (
							<iframe src={channelsVideoLinks[index]} className='w-full h-full rounded-lg shadow-lg' allowFullScreen />
						) : (
							<div className='w-full h-full relative rounded-lg overflow-hidden'>
								<div className='absolute inset-0 bg-gray-200 blur-lg'>
									<Image src={BlurBg} alt='Placeholder' fill />
								</div>
								<button
									onClick={() => {
										setActiveChannelId((prev) => [...prev, channel]);
									}}
									className='absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors'
								>
									<PlayCircleOutlined className='text-white text-4xl opacity-80 hover:opacity-100 transition-opacity' />
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default VideoOverview;
