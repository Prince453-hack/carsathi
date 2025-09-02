import React, { useEffect, useState } from 'react';

import CustomTableN, { DownloadReportTs } from '../../common/CustomTableN';
import { downloadTripReport, getTripsColumns2 } from './getTripColumns2';
import { VehicleAllocationReportModal } from '../vehicle-allocation-report/vehicle-allocation-report-modal';
import { useLazyAddTripEndQuery } from '@/app/_globalRedux/services/gtrac_newtracking';
import { Button, DatePicker, Input, Modal } from 'antd';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/_globalRedux/store';

export const TripReportTable = ({
	refetch,
	isLoading,
	tripHistory,
	setIsRefetchLoading,
}: {
	refetch: any;
	isLoading: boolean;
	tripHistory: PlannedTrips[] | undefined;
	setIsRefetchLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { userId, groupId, parentUser: puserId, extra } = useSelector((state: RootState) => state.auth);
	const [addTripEnd] = useLazyAddTripEndQuery();

	const [tripEndModal, setTripEndModal] = React.useState<PlannedTrips | undefined>();
	const [downloadReport, setDownloadReport] = React.useState<DownloadReportTs | undefined>(undefined);
	const [selectectedData, setSelectedData] = useState<any>(null);

	const [tripEnddate, seTripEndtDate] = useState<undefined | dayjs.Dayjs>(undefined);
	const [tripEndRemark, setTripEndRemark] = useState<string>('');

	return (
		<div className='flex flex-col gap-4 py-4 w-full font-proxima text-xs'>
			<VehicleAllocationReportModal selectedData={selectectedData} setSelectedData={setSelectedData} />
			<CustomTableN
				columns={getTripsColumns2({ data: tripHistory ? tripHistory : undefined, setSelectedData, setTripEndModal })}
				data={tripHistory && tripHistory && tripHistory.length > 0 ? tripHistory : []}
				loading={isLoading}
				onDownloadBtnClick={() => {
					downloadTripReport({ data: tripHistory, setDownloadReport });
				}}
				downloadReport={downloadReport}
				setDownloadReport={setDownloadReport}
				height={'h-[calc(100vh-250px)]'}
				fontSize='12px'
			/>

			<Modal
				open={tripEndModal?.id ? true : false}
				onCancel={() => setTripEndModal(undefined)}
				footer={null}
				title={`End Trip: (${tripEndModal?.id})`}
			>
				<div className='flex flex-col gap-4'>
					<DatePicker format='Do MMMM, YYYY HH:mm' size='large' showTime value={tripEnddate} onChange={(e) => seTripEndtDate(e)} />
					<Input placeholder='Remark' value={tripEndRemark} onChange={(e) => setTripEndRemark(e.target.value)} className='h-10' />

					<div className='flex justify-end gap-2'>
						<Button
							onClick={() => {
								setTripEndModal(undefined);
								seTripEndtDate(undefined);
								setTripEndRemark('');
							}}
						>
							Cancel
						</Button>
						<Button
							type='primary'
							onClick={() => {
								if (!tripEnddate || !tripEndRemark || tripEndModal === undefined) return;
								setIsRefetchLoading(true);
								addTripEnd({
									tripEndId: `${tripEndModal.id}`,
									tripEndDate: tripEnddate.format('YYYY-MM-DD HH:mm'),
									tripEndGroupId: `${tripEndModal.sys_service_id}`,
									tripEndLorryNo: `${tripEndModal.lorry_no}`,
									tripEndRemark: tripEndRemark,
									userId,
									token: groupId,
									puserId,
									extra,
								}).then(() => refetch());

								setTripEndModal(undefined);
								seTripEndtDate(undefined);
								setTripEndRemark('');
								setIsRefetchLoading(false);
							}}
						>
							Save
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};
