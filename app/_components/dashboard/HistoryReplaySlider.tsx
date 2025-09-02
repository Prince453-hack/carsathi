'use client';

import { Slider, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import * as stop from '@/public/assets/svgs/common/Stop.svg';
import * as play from '@/public/assets/svgs/common/Play.svg';
import * as pause from '@/public/assets/svgs/common/Pause.svg';

import {
	setHistoryReplayInterval,
	setHistoryReplayModeToggle,
	setHistoryReplayPathManual,
	setHistoryReplayPlayPause,
	setIncrement,
	setStopHistoryReplay,
	stopHistoryReplayInterval,
} from '@/app/_globalRedux/dashboard/historyReplaySlice';

export const HistoryReplaySlider = () => {
	const vehicleItnaryWithPath = useSelector((state: RootState) => state.vehicleItnaryWithPath);
	const historyReplay = useSelector((state: RootState) => state.historyReplay);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const { type: createTripOrPlanningTripActive } = useSelector((state: RootState) => state.createTripOrPlanningTripActive);

	const dispatch = useDispatch();

	const [historyReplayProgressPercentage, setHistoryReplayProgressPercentage] = useState(0);

	const startHistoryReplay = () => {
		dispatch(setHistoryReplayPlayPause(true));

		const interval = setInterval(() => {
			dispatch(setIncrement());
		}, historyReplay.playTimeInMilliseconds);

		dispatch(setHistoryReplayInterval(interval));
	};

	useEffect(() => {
		if (vehicleItnaryWithPath.patharry && vehicleItnaryWithPath.patharry.length >= 2) {
			setHistoryReplayProgressPercentage(
				(historyReplay.currentPathArrayIndex / (vehicleItnaryWithPath.patharry.length - 2)) * 100 + historyReplay.manualPath
			);

			const manualPathIndex = Math.floor((historyReplay.manualPath / 100) * (vehicleItnaryWithPath.patharry.length - 2));
			if (historyReplay.currentPathArrayIndex + manualPathIndex >= vehicleItnaryWithPath.patharry.length - 2 && historyReplay.historyReplayInterval) {
				dispatch(setStopHistoryReplay());
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [historyReplay.currentPathArrayIndex]);

	useEffect(() => {
		dispatch(setStopHistoryReplay());
		setHistoryReplayProgressPercentage(0);

		if (createTripOrPlanningTripActive !== '') {
			// dispatch(setHistoryReplayModeToggle(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVehicle]);

	const handleSliderChange = (e: number) => {
		const newValue = Math.floor(e);
		if (vehicleItnaryWithPath.patharry && vehicleItnaryWithPath.patharry.length >= 2) {
			const newProgressPercentage = Math.floor((historyReplay.currentPathArrayIndex / (vehicleItnaryWithPath.patharry.length - 2)) * 100 + newValue);
			dispatch(setHistoryReplayPathManual(newValue));
			setHistoryReplayProgressPercentage(newProgressPercentage);
		}
	};

	return (
		<>
			{historyReplay.isHistoryReplayMode && selectedVehicle.vId !== 0 ? (
				<div className='absolute right-20 bottom-8 z-[999]  py-4 px-6 rounded-3xl flex gap-4 bg-neutral-green shadow-inner  shadow-[#dee2df]'>
					<div className='flex items-center gap-3'>
						{historyReplay.isHistoryReplayPlaying ? (
							<div className='cursor-pointer'>
								<Tooltip title='Pause' mouseEnterDelay={1}>
									<Image
										src={pause}
										alt='pause icon'
										width='12'
										height='12'
										onClick={() => {
											dispatch(setHistoryReplayPlayPause(false));
											dispatch(stopHistoryReplayInterval());
										}}
									/>
								</Tooltip>
							</div>
						) : (
							<div className='cursor-pointer'>
								<Tooltip title='Play' mouseEnterDelay={1}>
									<Image src={play} alt='play icon' width='12' height='12' onClick={() => startHistoryReplay()} />
								</Tooltip>
							</div>
						)}
						<div className='cursor-pointer'>
							<Tooltip title='Stop' mouseEnterDelay={1}>
								<Image
									src={stop}
									alt='stop icon'
									width='12'
									height='12'
									onClick={() => {
										dispatch(setStopHistoryReplay());
									}}
								/>
							</Tooltip>
						</div>
					</div>

					<div>
						<Slider
							max={99}
							defaultValue={0}
							value={historyReplayProgressPercentage}
							onChange={(e) => handleSliderChange(e)}
							disabled={historyReplay.isHistoryReplayPlaying}
							className='w-56'
							styles={{
								track: {
									background: '#478C83',
								},
								rail: {
									background: '#ccc',
									width: '100%',
								},
							}}
						/>
					</div>
				</div>
			) : null}
		</>
	);
};
