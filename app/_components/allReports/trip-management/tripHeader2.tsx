'use client';
import React, { useState } from 'react';
import CustomDatePicker from '../../common/datePicker';
import { Button } from 'antd';

export const TripHeader2 = ({
	customDateRange,
	setCustomDateRange,
	refetch,
	setIsRefetchLoading,
	isLoading,
}: {
	customDateRange: Date[];
	setCustomDateRange: (e: Date[]) => void;
	setIsRefetchLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refetch: any;
	isLoading: boolean;
}) => {
	return (
		<div className='flex justify-between items-center'>
			<p className='text-3xl font-bold mb-2'>Trip Report</p>
			<div className='w-[420px] max-w-[420px] flex gap-2 items-center'>
				<CustomDatePicker
					dateRange={customDateRange}
					setDateRange={(e) => {
						setCustomDateRange(e);
					}}
					datePickerStyles='h-[32px]  max-h-[32px]'
					disabled={isLoading}
				/>
				<Button
					onClick={() => {
						setIsRefetchLoading(true);
						refetch().then(() => setIsRefetchLoading(false));
					}}
					type='primary'
					loading={isLoading}
				>
					Submit
				</Button>
			</div>
		</div>
	);
};
