'use client';

import { setCreatePoi } from '@/app/_globalRedux/dashboard/createPoi';
import { setIsLoadingScreenActive } from '@/app/_globalRedux/dashboard/mapSlice';
import { RootState } from '@/app/_globalRedux/store';
import { EditFilled, EditTwoTone } from '@ant-design/icons';
import { FloatButton } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const PolygonToggle = () => {
	const { isCreatePoi } = useSelector((state: RootState) => state.createPoi);
	const dispatch = useDispatch();
	return (
		<FloatButton
			onClick={() => {
				dispatch(setIsLoadingScreenActive(true));
				dispatch(setCreatePoi(!isCreatePoi));
				setTimeout(() => dispatch(setIsLoadingScreenActive(false)), 1);
			}}
			icon={isCreatePoi ? <EditFilled style={{ color: 'rgb(191,47,58)' }} /> : <EditTwoTone />}
			tooltip={isCreatePoi ? 'Stop Drawing POI' : 'Start Drawing POI'}
		></FloatButton>
	);
};
