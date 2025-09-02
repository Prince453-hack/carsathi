'use client';

import { initialPOIDropDownState, setSelectedPOI } from '@/app/_globalRedux/dashboard/poiSlice';
import { RootState } from '@/app/_globalRedux/store';
import { ConfigProvider, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const selectedStyles = {
	selectorBg: 'transparent',
	fontSize: 14,
	optionFontSize: 14,
	optionPadding: '5px',
	optionSelectedColor: '#000',
};

export const PoiDropdownSelector = () => {
	const poiData = useSelector((state: RootState) => state.poiData);

	const dispatch = useDispatch();

	const [poiOptions, setPoiOptions] = useState<{ value: number; label: string }[]>([]);

	useEffect(() => {
		if (!poiData) return;

		const tempPoiOptions = poiData.poi.map((item) => ({ value: item.id, label: item.name }));
		const tempGeofenceOptions = poiData.geofenceList.filter((item) => item.points.length > 0).map((item) => ({ value: item.id, label: item.name }));

		tempPoiOptions.unshift({ value: -1, label: 'Select POI' });
		setPoiOptions([...tempPoiOptions, ...tempGeofenceOptions]);
	}, [poiData]);

	return (
		<ConfigProvider
			theme={{
				components: {
					Select: {
						...selectedStyles,
						paddingContentVertical: 0,
					},
					Dropdown: {
						paddingBlock: 10,
					},
				},
				token: {
					colorTextPlaceholder: '#aaa',
				},
			}}
		>
			<Select
				showSearch
				style={{ width: 300 }}
				placeholder='Select a POI'
				optionFilterProp='label'
				filterSort={(optionA, optionB) =>
					optionA.label === 'Select POI'
						? -1
						: optionB.label === 'Select POI'
						? 1
						: (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
				}
				options={poiOptions}
				value={poiData.selectedPOI.id}
				onChange={(e) => {
					dispatch(
						setSelectedPOI(
							poiData.poi.find((item) => item.id === e) || poiData.geofenceList.find((item) => item.id === e) || initialPOIDropDownState.selectedPOI
						)
					);
				}}
			/>
		</ConfigProvider>
	);
};
