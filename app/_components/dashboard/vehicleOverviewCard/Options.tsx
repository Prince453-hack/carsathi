'use client';

import { setCreateTripOrTripPlanningActive } from '@/app/_globalRedux/dashboard/createTripOrTripPlanningActive';
import { setVehicleDetailsStatus } from '@/app/_globalRedux/dashboard/isVehicleStatusOrTripStatusActive';
import {
	setCreatePoiIndex,
	setDriverInfoIndex,
	setIsShareUrlOpenIndex,
	setMapYourInfoIndex,
	setOptionsIndex,
} from '@/app/_globalRedux/dashboard/optionsSlice';
import {
	initialSelectedVehicleState,
	setSelectedVehicleBySelectElement,
	setSelectedVehicleStatus,
} from '@/app/_globalRedux/dashboard/selectedVehicleSlice';
import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { RootState } from '@/app/_globalRedux/store';
import { Card } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const Options = ({ vehicleData }: { vehicleData: VehicleData }) => {
	const { optionOpenIndex } = useSelector((state: RootState) => state.vehicleOverviewOptions);
	const auth = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch();

	return (
		<>
			{optionOpenIndex === vehicleData.vId ? (
				<div className='w-50 absolute z-[100000] right-8 top-14'>
					<Card
						styles={{
							body: {
								padding: 0,
								display: 'flex',
								flexDirection: 'column',
								overflow: 'hidden',
								borderRadius: '10px',
								background: '#F2F5F3',
								boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
								minWidth: '130px',
							},
						}}
						style={{ borderRadius: '10px' }}
					>
						<div
							className='py-2 px-3 hover:bg-[rgba(71,140,131,.1)] cursor-pointer'
							onClick={() => {
								dispatch(setIsShareUrlOpenIndex(vehicleData.vId));
								dispatch(setOptionsIndex(-1));
							}}
						>
							Share Url
						</div>
						{auth.isMarketVehicle || auth.isPadlock || Number(auth.userId) === 85380 || Number(auth.parentUser) === 85380 ? (
							<div
								className='py-2 px-3 hover:bg-[rgba(71,140,131,.1)] cursor-pointer'
								onClick={() => {
									if (Number(auth.userId) !== 87162) {
										dispatch(setMapYourInfoIndex(vehicleData.vId));
										dispatch(setOptionsIndex(-1));
									} else {
										dispatch(setOptionsIndex(-1));
										dispatch(setVehicleDetailsStatus({ type: 'vehicle-allocation-trip' }));
										dispatch(setCreateTripOrTripPlanningActive({ type: 'create-trip' }));
										dispatch(
											setSelectedVehicleStatus({
												...vehicleData,
												searchType: '',
												selectedVehicleHistoryTab: initialSelectedVehicleState.selectedVehicleHistoryTab,
												nearbyVehicles: [],
												prevVehicleSelected: initialSelectedVehicleState.prevVehicleSelected,
											})
										);
									}
								}}
							>
								Map Your Vehicle
							</div>
						) : null}
						<div
							className='py-2 px-3 hover:bg-[rgba(71,140,131,.1)] cursor-pointer'
							onClick={() => {
								dispatch(setDriverInfoIndex(vehicleData.vId));
								dispatch(setOptionsIndex(-1));
							}}
						>
							Driver Info
						</div>
						<div
							className='py-2 px-3 hover:bg-[rgba(71,140,131,.1)] cursor-pointer'
							onClick={() => {
								dispatch(setCreatePoiIndex(vehicleData.vId));
								dispatch(setOptionsIndex(-1));
							}}
						>
							Create POI
						</div>
					</Card>
				</div>
			) : null}
		</>
	);
};
