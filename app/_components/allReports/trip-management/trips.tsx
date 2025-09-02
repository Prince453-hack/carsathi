import React from 'react';
import { TripList } from './index';
import { ViewContext } from './tripReportAndPlanningToggle';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import { useGetTripVehiclesQuery } from '@/app/_globalRedux/services/trackingDashboard';
import CustomTableN, { DownloadReportTs } from '../../common/CustomTableN';
import { downloadTripReport, getTripsColumns } from './getTripsColumns';

export const Trips = () => {
	const { groupId, userId } = useSelector((state: RootState) => state.auth);

	const tripParams = {
		userId,
		token: groupId,
		startDate: moment().subtract(15, 'days').startOf('date').format('YYYY-MM-DD HH:mm'),
		endDate: moment().format('YYYY-MM-DD HH:mm'),
		tripStatus: 'On Trip',
		tripStatusBatch: 'On Trip',
	};

	const { isLoading: isTripLoading, data: tripHistory } = useGetTripVehiclesQuery(tripParams, {
		skip: !groupId || !userId,
	});

	const [downloadReport, setDownloadReport] = React.useState<DownloadReportTs | undefined>(undefined);

	const activeView = React.useContext(ViewContext);
	return (
		<div className='flex flex-col gap-4 py-4 w-full font-proxima text-xs'>
			{activeView === 'TABLE' ? (
				<CustomTableN
					columns={getTripsColumns({ data: tripHistory ? tripHistory : undefined })}
					data={tripHistory && tripHistory.list && tripHistory.list.length > 0 ? tripHistory.list : []}
					loading={isTripLoading}
					onDownloadBtnClick={() => {
						downloadTripReport({ data: tripHistory, setDownloadReport });
					}}
					downloadReport={downloadReport}
					setDownloadReport={setDownloadReport}
					width='200%'
					height='max-h-[60vh]'
					fontSize='12px'
				/>
			) : (
				<TripList type='planning' tripData={tripHistory?.list} isLoading={isTripLoading} />
			)}
		</div>
	);
};
