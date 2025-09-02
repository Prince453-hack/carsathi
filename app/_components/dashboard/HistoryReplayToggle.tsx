import { setHistoryReplayModeToggle } from '@/app/_globalRedux/dashboard/historyReplaySlice';
import { RootState } from '@/app/_globalRedux/store';
import { FloatButton } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import HistoryReplay from '@/app/_assets/svgs/map/history_replay';
import Live from '@/app/_assets/svgs/map/live';

export const HistoryReplayToggle = () => {
	const dispatch = useDispatch();

	const collapseVehicleStatusToggle = useSelector((state: RootState) => state.collapseVehicleStatusToggle);
	const historyReplay = useSelector((state: RootState) => state.historyReplay);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const { type: createTripOrPlanningTripActive } = useSelector((state: RootState) => state.createTripOrPlanningTripActive);

	return (
		<FloatButton
			onClick={() => {
				if (createTripOrPlanningTripActive !== 'create-trip' && createTripOrPlanningTripActive !== 'trip-planning') {
					dispatch(setHistoryReplayModeToggle(!historyReplay.isHistoryReplayMode));

					if (collapseVehicleStatusToggle && selectedVehicle.vId === 0) {
					} else if (selectedVehicle.vId === 0 && !collapseVehicleStatusToggle) {
					} else if (selectedVehicle.vId !== 0 && collapseVehicleStatusToggle) {
					} else if (!collapseVehicleStatusToggle && selectedVehicle.vId !== 0) {
					}
				}
			}}
			tooltip={historyReplay.isHistoryReplayMode ? 'Toggle Live' : 'Toggle History replay'}
			icon={historyReplay.isHistoryReplayMode ? <HistoryReplay /> : <Live />}
		></FloatButton>
	);
};
