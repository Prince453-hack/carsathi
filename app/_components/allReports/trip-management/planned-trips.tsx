import React from 'react';
import { TripList } from './index';
import { ViewContext } from './tripReportAndPlanningToggle';
import { useGetPlannedVehiclesQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';
import moment from 'moment';
import CustomTableN, { DownloadReportTs } from '../../common/CustomTableN';
import { getTripsColumns } from './getTripsColumns';

export const PlannedTrips = () => {
	const { groupId, userId } = useSelector((state: RootState) => state.auth);

	const tripParams = {
		userId,
		token: groupId,
		startDate: moment().subtract(15, 'days').startOf('date').format('YYYY-MM-DD HH:mm'),
		endDate: moment().format('YYYY-MM-DD HH:mm'),
		tripStatus: 'On Trip',
		tripStatusBatch: 'On Trip',
	};

	const { isLoading: isPlannedTripLoading, data: plannedTripData } = useGetPlannedVehiclesQuery(tripParams, {
		skip: !groupId || !userId,
	});

	const activeView = React.useContext(ViewContext);
	const [downloadReport, setDownloadReport] = React.useState<DownloadReportTs | undefined>(undefined);
	return (
		<div className='flex flex-col gap-4 py-4 w-full font-proxima text-xs'>
			{activeView === 'TABLE' ? (
				<CustomTableN
					columns={getTripsColumns({ data: plannedTripData ? plannedTripData : undefined })}
					data={plannedTripData && plannedTripData.list && plannedTripData.list.length > 0 ? plannedTripData.list : []}
					loading={isPlannedTripLoading}
					onDownloadBtnClick={() => {}}
					downloadReport={undefined}
					setDownloadReport={setDownloadReport}
					width='200%'
					height='max-h-[60vh]'
					fontSize='12px'
				/>
			) : (
				<TripList type='planning' tripData={plannedTripData?.list} isLoading={isPlannedTripLoading} />
			)}
		</div>
	);
};
