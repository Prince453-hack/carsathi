'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Tabs, TabsProps } from 'antd';

import { setSelectedVehicleHistoryTab } from '@/app/_globalRedux/dashboard/selectedVehicleSlice';
import { useDispatch, useSelector } from 'react-redux';
import DiagnosticCardList from './Diagnostic/DiagnosticCardList';
import { VehicleDetailsContext } from './View';
import { RootState } from '@/app/_globalRedux/store';
import { VehicleItnaryWithPath } from '@/app/_globalRedux/services/types/getItnaryWithMapResponse';
import { VehicleHistoryCardListItnary } from './VehicleHistoryCardListItnary';
import { VehicleHistoryCardListDiagnostic } from './VehicleHistoryCardListDiagnostic';

interface VehicleHistoryTabsProps {
	data: VehicleItnaryWithPath;
	view: 'VehicleDetails' | 'ExpandedReportsModal';
}

export const VehicleHistoryTabs: React.FC<VehicleHistoryTabsProps> = ({ data, view }) => {
	const dispatch = useDispatch();
	const [tabsLabelStyling, setTabsLabelStyling] = useState({ key: 'Trip', style: 'border-dark-glow-green border-opacity-100' });
	const { type: vehicleListType } = useSelector((state: RootState) => state.isVehicleStatusOrTripStatusActive);
	const { reportsModalState } = useContext(VehicleDetailsContext);
	const { isReportsExpanded } = reportsModalState;

	const [items, setItems] = useState<TabsProps['items']>([
		{
			key: 'All',
			label: 'All',
			children: <VehicleHistoryCardListItnary type='All' data={data} view={view} />,
		},
		{
			key: 'Running',
			label: 'Movement',
			children: <VehicleHistoryCardListDiagnostic type='Running' data={data} view={view} />,
		},
		{
			key: 'Stoppages',
			label: 'Stoppages',
			children: <VehicleHistoryCardListDiagnostic type='Stoppages' data={data} view={view} />,
		},
		{
			key: 'Diagnostic',
			label: 'Diagnostic',
			children: <DiagnosticCardList />,
		},
		{
			key: 'Alerts',
			label: 'Alerts',
			children: <VehicleHistoryCardListDiagnostic type='Alerts' data={data} view={view} />,
		},
	]);

	useEffect(() => {
		let newItems: TabsProps['items'] = [
			{
				key: 'All',
				label: 'All',
				children: <VehicleHistoryCardListItnary type='All' data={data} view={view} />,
			},
			{
				key: 'Running',
				label: 'Movement',
				children: <VehicleHistoryCardListDiagnostic type='Running' data={data} view={view} />,
			},
			{
				key: 'Stoppages',
				label: 'Stoppages',
				children: <VehicleHistoryCardListDiagnostic type='Stoppages' data={data} view={view} />,
			},
			{
				key: 'Diagnostic',
				label: 'Diagnostic',
				children: <DiagnosticCardList />,
			},
			{
				key: 'Alerts',
				label: 'Alerts',
				children: <VehicleHistoryCardListDiagnostic type='Alerts' data={data} view={view} />,
			},
		];
		if (vehicleListType === 'trip' || vehicleListType === 'vehicle-allocation-trip') {
			if (!newItems.find((item) => item.key === 'Trip') && !isReportsExpanded) {
				// remove all
				newItems = newItems.filter((item) => item.key !== 'All');
				newItems.unshift({
					key: 'Trip',
					label: 'Trip',
					children: <VehicleHistoryCardListItnary type='Trip' data={data} view={view} />,
				});
			}
		}

		if (isReportsExpanded) {
			newItems = newItems.filter((item) => item.key !== 'Trip' && item.key !== 'Alerts');
		}

		setItems(newItems);
	}, [vehicleListType, isReportsExpanded, tabsLabelStyling, data, view]);

	const handleTabClick = (activeKey: 'All' | 'Alerts' | 'Stoppages' | 'Running' | 'Diagnostic' | 'Trip') => {
		dispatch(setSelectedVehicleHistoryTab(activeKey));

		setTabsLabelStyling((prev) => ({ ...prev, key: activeKey }));
	};

	return <Tabs items={items} centered={view === 'ExpandedReportsModal' ? false : true} onChange={(activeKey: any) => handleTabClick(activeKey)} />;
};
