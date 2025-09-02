'use client';

import { RootState } from '@/app/_globalRedux/store';
import { getAlphabetsFirstChr } from '@/app/helpers/stringManipulation';
import { Skeleton } from 'antd';
import { useSelector } from 'react-redux';

export const VehicleDateOverview = ({ travelTime, distance, stoppedTime }: { travelTime: string; distance: string; stoppedTime: string }) => {
	const { extra } = useSelector((state: RootState) => state.auth);
	const isGetPathWithDateDiagnosticLoading = useSelector((state: RootState) =>
		Object.values(state.allTripApi.queries).some((query) => query && query.endpointName === 'getpathwithDateDaignostic' && query.status === 'pending')
	);
	const isApmTotalKmLoading = useSelector((state: RootState) => state.isApmTotalKmmLoading);

	return (
		<div className='text-sm'>
			<div className='flex justify-between'>
				<div className='flex items-center justify-center flex-col border w-full h-24 border-x-0'>
					<h3 className=' relative bottom-1.5'>Running Time</h3>
					{isGetPathWithDateDiagnosticLoading || isApmTotalKmLoading ? (
						<Skeleton.Button active={true} size='small' className='mt-0.5 h-[20px]' />
					) : (
						<p className='font-semibold mt-0.5'>{getAlphabetsFirstChr(travelTime)}</p>
					)}
				</div>
				<div className='flex items-center justify-center flex-col border w-full h-24'>
					<h3 className=' relative bottom-1'>Total Distance</h3>
					{isGetPathWithDateDiagnosticLoading || isApmTotalKmLoading ? (
						<Skeleton.Button active={true} size='small' className='mt-0.5 h-[20px]' />
					) : (
						<p className='font-semibold mt-0.5'>
							{Number(extra) === 0 || isNaN(Number(extra))
								? Number(distance.split(' ')[0])
								: (Number(distance.split(' ')[0]) + (Number(distance.split(' ')[0]) * Number(extra)) / 100)?.toFixed(0)}{' '}
							KM
						</p>
					)}
				</div>
				<div className='flex items-center justify-center flex-col border w-full h-24 border-x-0'>
					<h3 className=' relative bottom-1'>Stopped Time</h3>
					{isGetPathWithDateDiagnosticLoading || isApmTotalKmLoading ? (
						<Skeleton.Button active={true} size='small' className='mt-0.5 h-[20px]' />
					) : (
						<p className='font-semibold mt-0.5'>{getAlphabetsFirstChr(stoppedTime)}</p>
					)}
				</div>
			</div>
		</div>
	);
};
