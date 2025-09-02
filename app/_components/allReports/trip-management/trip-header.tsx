'use client';

import React from 'react';
import { Form } from '../../dashboard/trip';
import { Button } from 'antd';
import { setCreateTripOrTripPlanningActive } from '@/app/_globalRedux/dashboard/createTripOrTripPlanningActive';
import { useDispatch } from 'react-redux';
import { MultipleTripUpload } from './multipleTripUpload';

export const TripHeader = () => {
	const dispatch = useDispatch();

	return (
		<div>
			<p className='text-3xl font-bold mb-2'>Trip Management</p>
			<div className='flex gap-4 justify-end items-center mb-4'>
				<MultipleTripUpload />

				<div className='flex gap-2'>
					<Button type='primary' onClick={() => dispatch(setCreateTripOrTripPlanningActive({ type: 'create-trip' }))}>
						Create Trip
					</Button>
					<Button type='primary' onClick={() => dispatch(setCreateTripOrTripPlanningActive({ type: 'trip-planning' }))}>
						{' '}
						Plan Trip
					</Button>
				</div>
			</div>
			<Form />
		</div>
	);
};
