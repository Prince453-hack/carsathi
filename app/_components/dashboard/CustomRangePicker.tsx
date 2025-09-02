'use client';

import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { trackingDashboard, useLazyGetRawWithDateQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import moment from 'moment';
import { useAppDispatch } from '@/app/_globalRedux/provider';
import { setVehicleItnaryWithPath, vehicleItnaryWithPathInitialState } from '@/app/_globalRedux/dashboard/vehicleItnaryWithPathSlice';
import { setHistoryReplayModeToggle, setStopHistoryReplay } from '@/app/_globalRedux/dashboard/historyReplaySlice';
import {
	setSelectedVehicleCustomDateRange,
	setSelectedVehicleCustomRangeSelected,
} from '@/app/_globalRedux/dashboard/selectedVehicleCustomRangeSlice';

import { liveVehicleInitialState, setLiveVehicleItnaryWithPath } from '@/app/_globalRedux/dashboard/liveVehicleSlice';

import { GetItnaryWithMapResponse } from '@/app/_globalRedux/services/types';
import CustomDatePicker from '../common/datePicker';
import { setHours, setMinutes } from 'date-fns';
import { SearchOutlined } from '@ant-design/icons';
import { setCheckInData } from '@/app/_globalRedux/dashboard/CheckInData';
import { isKmtAccount } from '@/app/helpers/isKmtAccount';
import { isCheckInAccount } from '@/app/helpers/isCheckInAccount';
import { apmTotalKm } from '@/app/helpers/apmTotalKm';
import { getLatestGPSTime } from './utils/getLatestGPSTime';
import { getNormalOrControllerId } from './utils/getNormalOrControllerId';

export type NoUndefinedRangeValueType<DateType> = [start: DateType | null, end: DateType | null];

export type RangeValueType<DateType> = [start: DateType | null | undefined, end: DateType | null | undefined];

export const CustomRangePicker = () => {
	const [selectOpen, setSelectOpen] = useState(false);
	const vehicleItnaryWithPath = useSelector((state: RootState) => state.vehicleItnaryWithPath);
	const { userId, parentUser, extra } = useSelector((state: RootState) => state.auth);
	const selectedVehicle = useSelector((state: RootState) => state.selectedVehicle);
	const { accessLabel } = useSelector((state: RootState) => state.auth);

	const { dateRangeToDisplay, dateRangeForDataFetching, customRangeSelected } = useSelector((state: RootState) => state.customRange);
	const [fetchGetRawWithDate] = useLazyGetRawWithDateQuery();

	const options = [
		{
			label: 'Today',
			value: 'Today',
		},
		{
			label: 'Yesterday',
			value: 'Yesterday',
		},
		{
			label: 'Last 3 Days',
			value: 'Last 3 Days',
		},
		{
			label: 'Last 7 Days',
			value: 'Last 7 Days',
		},
		{
			label: 'This Month',
			value: 'This Month',
		},
		{
			label: 'Last Month',
			value: 'Last Month',
		},
		{
			label: 'Custom Date Range',
			value: 'Custom Date Range',
		},
	];

	const dispatch = useAppDispatch();

	const fetchDataOnDateOrVehicleChange = async (updatedStartDate?: string, updatedEndDate?: string) => {
		// * Set vehicleItnaryWithPath to initial state
		dispatch(setVehicleItnaryWithPath(vehicleItnaryWithPathInitialState));
		dispatch(setLiveVehicleItnaryWithPath(liveVehicleInitialState));
		let adjustedItItineraryvehIdBDateNwStData: GetItnaryWithMapResponse | undefined = undefined;
		let adjustedDiagnostic: GetpathwithDateDaignosticReponse | undefined = undefined;

		const startDate = updatedStartDate || dateRangeForDataFetching.startDate;
		const endDate = updatedEndDate || dateRangeForDataFetching.endDate;

		const dateObject = {
			userId: userId,
			vId: accessLabel === 6 ? getNormalOrControllerId(selectedVehicle) : selectedVehicle.vId,
			startDate,
			endDate,
			requestFor: 0,
		};

		const { data: itItineraryvehIdBDateNwStData, isLoading: itineraryvehIdBDateNwStLoading } = await dispatch(
			trackingDashboard.endpoints.getItineraryvehIdBDateNwSt.initiate(dateObject, { subscribe: false, forceRefetch: true })
		);

		if (itItineraryvehIdBDateNwStData && !itineraryvehIdBDateNwStLoading) {
			adjustedItItineraryvehIdBDateNwStData = structuredClone(itItineraryvehIdBDateNwStData); // Deep copy
			let mergedData: any[] = [];

			adjustedItItineraryvehIdBDateNwStData.data.forEach((value, index) => {
				if (adjustedItItineraryvehIdBDateNwStData) {
					if (
						(index > 0 && value.mode === 'Idle' && adjustedItItineraryvehIdBDateNwStData.data[index - 1]?.mode === 'Idle') ||
						(index > 0 &&
							value.mode === 'Idle' &&
							value.fromLat === adjustedItItineraryvehIdBDateNwStData.data[index - 1].toLat &&
							value.fromLng === adjustedItItineraryvehIdBDateNwStData.data[index - 1].toLong)
					) {
						// merge the current value with the previous one
						mergedData[mergedData.length - 1] = {
							...mergedData[mergedData.length - 1],
							fromLat: value.fromLat,
							fromLng: value.fromLng,
							fromTime: value.fromTime,
							startLocation: value.startLocation,
							totalTimeInMIN: mergedData[mergedData.length - 1].totalTimeInMIN + value.totalTimeInMIN,
						};
					} else {
						mergedData.push({
							...value,
							totalDistance: `${
								isNaN(Number(extra)) || Number(extra) === 0
									? Number(value?.totalDistance.split(' ')[0])
									: Number(value?.totalDistance.split(' ')[0]) + (Number(value?.totalDistance.split(' ')[0]) * Number(extra)) / 100
							} KM`,
						});
					}
				}
			});

			adjustedItItineraryvehIdBDateNwStData.data = isKmtAccount(Number(userId), Number(parentUser))
				? adjustedItItineraryvehIdBDateNwStData.data
				: mergedData;

			const apmKm = await apmTotalKm({
				startDate,
				endDate,
				userId: Number(userId),
				vehicleId: Number(selectedVehicle.vId),
				parentUser: Number(parentUser),
				dispatch,
			});

			dispatch(
				setVehicleItnaryWithPath({
					...vehicleItnaryWithPath,
					vehicleId: vehicleItnaryWithPath.vehicleId,
					diagnosticData: vehicleItnaryWithPath.diagnosticData,
					fromTime: vehicleItnaryWithPathInitialState.fromTime,
					toTime: vehicleItnaryWithPathInitialState.toTime,
					totalDistance: Number(userId) === 4607 || Number(parentUser) === 4607 ? apmKm : vehicleItnaryWithPathInitialState.totalDistance,
					calculatedTotalDistance: 0,
					runningTime: vehicleItnaryWithPathInitialState.runningTime,
					stoppageTime: vehicleItnaryWithPathInitialState.stoppageTime,
					patharry: vehicleItnaryWithPathInitialState.patharry,
				})
			);
		}

		const { data: pathwithDateData, isLoading: pathwithDateLoading } = await dispatch(
			trackingDashboard.endpoints.getpathwithDateDaignostic.initiate(dateObject, { subscribe: false, forceRefetch: true })
		);

		if (
			pathwithDateData &&
			!pathwithDateLoading &&
			itItineraryvehIdBDateNwStData &&
			adjustedItItineraryvehIdBDateNwStData &&
			!itineraryvehIdBDateNwStLoading
		) {
			adjustedDiagnostic = structuredClone(pathwithDateData); // Deep copy
			let mergedDiagnosticData: any[] = [];
			let totalDistance = 0;

			adjustedDiagnostic.data.forEach((value, index) => {
				totalDistance +=
					isNaN(Number(extra)) || Number(extra) === 0
						? Number(value?.totalDistance.split(' ')[0])
						: Number(Number(value?.totalDistance.split(' ')[0]) + (Number(value?.totalDistance.split(' ')[0]) * Number(extra)) / 100);
				if (adjustedDiagnostic) {
					if (
						(index > 0 && value.mode === 'Idle' && adjustedDiagnostic.data[index - 1]?.mode === 'Idle') ||
						(index > 0 &&
							value.mode === 'Idle' &&
							value.fromLat === adjustedDiagnostic.data[index - 1].toLat &&
							value.fromLng === adjustedDiagnostic.data[index - 1].toLong)
					) {
						// merge the current value with the previous one
						mergedDiagnosticData[mergedDiagnosticData.length - 1] = {
							...mergedDiagnosticData[mergedDiagnosticData.length - 1],
							fromLat: value.fromLat,
							fromLng: value.fromLng,
							fromTime: value.fromTime,
							startLocation: value.startLocation,
							totalTimeInMIN: mergedDiagnosticData[mergedDiagnosticData.length - 1].totalTimeInMIN + value.totalTimeInMIN,
							totalDistance: `${
								isNaN(Number(extra)) || Number(extra) === 0
									? Number(mergedDiagnosticData[mergedDiagnosticData.length - 1]?.totalDistance.split(' ')[0])
									: Number(
											(
												Number(mergedDiagnosticData[mergedDiagnosticData.length - 1]?.totalDistance.split(' ')[0]) +
												(Number(mergedDiagnosticData[mergedDiagnosticData.length - 1]?.totalDistance.split(' ')[0]) * Number(extra)) / 100
											)?.toFixed(2)
									  )
							} KM`,
						};
					} else {
						mergedDiagnosticData.push({
							...value,
							totalDistance: `${
								isNaN(Number(extra)) || Number(extra) === 0
									? Number(value?.totalDistance.split(' ')[0])
									: Number(
											(Number(value?.totalDistance.split(' ')[0]) + (Number(value?.totalDistance.split(' ')[0]) * Number(extra)) / 100)?.toFixed(2)
									  )
							} KM`,
						});
					}
				}
			});

			adjustedDiagnostic.data = isKmtAccount(Number(userId), Number(parentUser)) ? adjustedDiagnostic.data : mergedDiagnosticData;

			const apmKm = await apmTotalKm({
				startDate,
				endDate,
				userId: Number(userId),
				vehicleId: Number(selectedVehicle.vId),
				parentUser: Number(parentUser),
				dispatch,
			});

			dispatch(
				setVehicleItnaryWithPath({
					...adjustedItItineraryvehIdBDateNwStData,
					vehicleId: adjustedDiagnostic.vehicleId,
					patharry: adjustedDiagnostic.patharry,
					fromTime: adjustedDiagnostic.fromTime,
					toTime: adjustedDiagnostic.toTime,
					totalDistance: Number(userId) === 4607 || Number(parentUser) === 4607 ? apmKm : adjustedDiagnostic.totalDistance,
					calculatedTotalDistance: Number(totalDistance?.toFixed(2)),
					runningTime: adjustedDiagnostic.runningTime,
					stoppageTime: adjustedDiagnostic.stoppageTime,
					diagnosticData: adjustedDiagnostic.data,
				})
			);
		}
	};
	const fetchDataOnDataOrVehicleChangeWhenCheckInData = async (updatedStartDate?: string, updatedEndDate?: string) => {
		fetchGetRawWithDate({
			userId: Number(userId),
			vehId: accessLabel === 6 ? getNormalOrControllerId(selectedVehicle) : selectedVehicle.vId,
			startDate: updatedStartDate || dateRangeForDataFetching.startDate,
			endDate: updatedEndDate || dateRangeForDataFetching.endDate,
			interval: 'All',
		}).then(({ data }) => {
			if (data && data.rawdata && Array.isArray(data.rawdata)) dispatch(setCheckInData(data.rawdata));
		});
	};
	let localDateRange = { startDate: '', endDate: '' };
	const getVehicleDetailsByDate = async (selectedDateType: string, customDateRange: any) => {
		if (selectedDateType === 'Today') {
			localDateRange = {
				startDate: moment().startOf('day').format('YYYY-MM-DD HH:mm'),
				endDate: moment().format('YYYY-MM-DD HH:mm'),
			};
		} else if (selectedDateType === 'Yesterday') {
			localDateRange = {
				startDate: moment().startOf('day').subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
				endDate: moment().endOf('day').subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
			};
		} else if (selectedDateType === 'Last 7 Days') {
			localDateRange = {
				startDate: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm'),
				endDate: moment().format('YYYY-MM-DD HH:mm'),
			};
		} else if (selectedDateType === 'Last 3 Days') {
			localDateRange = {
				startDate: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm'),
				endDate: moment().format('YYYY-MM-DD HH:mm'),
			};
		} else if (selectedDateType === 'Last Month') {
			localDateRange = {
				startDate: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm'),
				endDate: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm'),
			};
		} else if (selectedDateType === 'This Month') {
			localDateRange = {
				startDate: moment().startOf('month').format('YYYY-MM-DD HH:mm'),
				endDate: moment().format('YYYY-MM-DD HH:mm'),
			};
		} else if (selectedDateType === 'Custom Date Range') {
			if (customDateRange) {
				localDateRange = {
					startDate: moment(customDateRange[0]?.toISOString()).format('YYYY-MM-DD HH:mm'),
					endDate: moment(customDateRange[1]?.toISOString()).format('YYYY-MM-DD HH:mm'),
				};
			}
		}
		if (
			selectedDateType === 'Yesterday' ||
			selectedDateType === 'Last 7 Days' ||
			selectedDateType === 'Last 3 Days' ||
			selectedDateType === 'Last Month' ||
			selectedDateType === 'This Month' ||
			selectedDateType === 'Custom Date Range'
		) {
			dispatch(setHistoryReplayModeToggle(true));
		} else if (selectedDateType === 'Today') {
			// dispatch(setHistoryReplayModeToggle(false));
		}
		dispatch(
			setSelectedVehicleCustomDateRange({
				dateRangeToDisplay: {
					startDate: moment(localDateRange.startDate).format('Do MMM, YYYY HH:mm'),
					endDate: moment(localDateRange.endDate).format('Do MMM, YYYY HH:mm'),
				},
				dateRangeForDataFetching: { startDate: localDateRange.startDate, endDate: localDateRange.endDate },
			})
		);

		if (isCheckInAccount(Number(userId))) {
			fetchDataOnDataOrVehicleChangeWhenCheckInData(localDateRange.startDate, localDateRange.endDate);
			fetchDataOnDateOrVehicleChange(localDateRange.startDate, localDateRange.endDate);
		} else {
			fetchDataOnDateOrVehicleChange(localDateRange.startDate, localDateRange.endDate);
		}
	};
	useEffect(() => {
		if (dateRangeForDataFetching.startDate && selectedVehicle.vId) {
			if (isCheckInAccount(Number(userId))) {
				fetchDataOnDataOrVehicleChangeWhenCheckInData();
				fetchDataOnDateOrVehicleChange(localDateRange.startDate, localDateRange.endDate);
			} else {
				fetchDataOnDateOrVehicleChange();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVehicle.vId]);

	const [customDateRange, setCustomDateRange] = useState([setHours(setMinutes(new Date(), 0), 0), new Date()]);

	const getDataForNewRange = (e: Date[]) => {
		getVehicleDetailsByDate('Custom Date Range', e);
		dispatch(setStopHistoryReplay());
	};

	return (
		<div className={`${customRangeSelected === 'Custom Date Range' ? 'mb-6' : ''}`}>
			<Select
				className='w-full'
				size='large'
				options={options}
				open={selectOpen}
				value={customRangeSelected}
				onDropdownVisibleChange={(visible) => setSelectOpen(visible)}
				onChange={(e) => {
					dispatch(setSelectedVehicleCustomRangeSelected(e));
					if (e !== 'Custom Date Range') {
						getVehicleDetailsByDate(e, dateRangeForDataFetching);
						dispatch(setStopHistoryReplay());
					}
				}}
				optionRender={(e) => (
					<p
						onClick={() => {
							setSelectOpen(false);
						}}
					>
						{e.label}
					</p>
				)}
			/>
			{customRangeSelected === 'Custom Date Range' ? (
				<div className='mt-2.5 -mb-3 text-base flex gap-2 items-center'>
					<CustomDatePicker dateRange={customDateRange} setDateRange={setCustomDateRange} datePickerStyles='py-2' />
					<div className='bg-[#4FB090] text-white p-2 rounded-full flex justify-center items-center h-fit cursor-pointer hover:bg-[#62c5a4] transition-all duration-300'>
						<SearchOutlined onClick={() => getDataForNewRange(customDateRange)} />
					</div>
				</div>
			) : (
				<div className='w-[calc(100%-4px)] ml-0.5 mt-2 mb-[18px] rounded-md p-2 h-[38px] text-base bg-white'>
					{dateRangeToDisplay.startDate ? (
						<div className='flex justify-between px-2'>
							<p>{dateRangeToDisplay.startDate}</p> - <p>{dateRangeToDisplay.endDate}</p>
						</div>
					) : (
						<div className='flex justify-between px-2'>
							<p>{moment().startOf('day').format('Do MMM, YYYY HH:mm')}</p> - <p>{moment().format('Do MMM, YYY HH:mm')}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
