'use client';

import React from 'react';
import { TripReportAndPlanningToggle } from './index';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import { TripReport } from './tripReport';

export const View = () => {
	const { userId, parentUser } = useSelector((state: RootState) => state.auth);

	return (
		<div className='flex flex-col gap-4 px-4 py-4 w-full font-proxima'>
			{Number(userId) === 87162 || Number(parentUser) === 87162 ? <TripReport /> : <TripReportAndPlanningToggle />}
		</div>
	);
};
