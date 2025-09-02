'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datePicker.css';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import dayjs from 'dayjs';

const CustomDatePicker = ({
	dateRange,
	setDateRange,
	disabled,
	excludeDateIntervalsStartDate,
	excludeDateIntervalsEndDate,
	datePickerStyles,
	format = 'dd/MM/yyyy h:mm aa',
	showTimeSelect = true,
	backgroundColor,
}: {
	dateRange: Date[];
	setDateRange: (value: Date[]) => void;
	disabled?: boolean;
	excludeDateIntervalsStartDate?: { start: Date; end: Date }[];
	excludeDateIntervalsEndDate?: { start: Date; end: Date }[];
	datePickerStyles?: string;
	format?: string;
	showTimeSelect?: boolean;
	backgroundColor?: string;
}) => {
	const { userId } = useSelector((state: RootState) => state.auth);
	format =
		(Number(userId) === 5457 && format) || (Number(userId) === 78781 && format === 'dd/MM/yyyy h:mm aa')
			? 'dd/MM/yyyy HH:mm'
			: format === 'dd/MM/yyyy h:mm aa'
			? 'dd/MM/yyyy h:mm aa'
			: format;
	let timeFormat = Number(userId) === 5457 || Number(userId) === 78781 ? 'HH:mm' : 'h:mm aa';
	return (
		<div
			className={`flex rounded-md gap-2 ${
				backgroundColor ? backgroundColor : 'bg-white'
			} border-[#D9D9D9] border max-w-full w-full z-[99] relative font-sans`}
		>
			<div>
				<DatePicker
					selected={dateRange[0]}
					onChange={(date) => date && setDateRange([date, dateRange[1]])}
					showTimeSelect={showTimeSelect}
					placeholderText='Start Date'
					dateFormat={format}
					timeFormat={timeFormat}
					className={`${datePickerStyles} px-2 w-full outline-[#4FB090] outline-[0.5px] rounded-md font-sans ${
						backgroundColor ? backgroundColor : 'bg-white'
					}`}
					minDate={Number(userId) === 87101 ? dayjs('2025-01-15').toDate() : undefined}
					popperPlacement='bottom-start'
					timeIntervals={5}
					disabled={disabled ? disabled : false}
					excludeDateIntervals={excludeDateIntervalsStartDate && excludeDateIntervalsStartDate.length ? excludeDateIntervalsStartDate : []}
				>
					<div className='bg-white text-center font-semibold font-sans'>
						<button
							onClick={() => {
								setDateRange([new Date(), dateRange[1]]);
							}}
							className='border border-x-0 border-b-0 w-full pt-0.5 pb-1 hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-300'
						>
							Today
						</button>
					</div>
				</DatePicker>
			</div>
			<ArrowRightOutlined style={{ color: '#94a3b8' }} />
			<div>
				<DatePicker
					selected={dateRange[1]}
					onChange={(date) => date && setDateRange([dateRange[0], date])}
					showTimeSelect={showTimeSelect}
					placeholderText='End Date'
					dateFormat={format}
					minDate={Number(userId) === 87101 ? dayjs('2025-01-15').toDate() : undefined}
					timeIntervals={5}
					timeFormat={timeFormat}
					className={`${datePickerStyles} px-2 w-full outline-[#4FB090] outline-[0.5px] rounded-md font-sans ${
						backgroundColor ? backgroundColor : 'bg-white'
					}`}
					popperPlacement='bottom-end'
					disabled={disabled ? disabled : false}
					excludeDateIntervals={excludeDateIntervalsEndDate && excludeDateIntervalsEndDate.length ? excludeDateIntervalsEndDate : []}
				>
					<div className='bg-white text-center font-semibold'>
						<button
							onClick={() => {
								setDateRange([dateRange[0], new Date()]);
							}}
							className='border border-x-0 border-b-0 w-full pt-0.5 pb-1 hover:bg-neutral-100 active:bg-neutral-200 transition-colors duration-300'
						>
							Today
						</button>
					</div>
				</DatePicker>
			</div>
		</div>
	);
};

export default CustomDatePicker;
