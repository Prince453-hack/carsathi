'use client';

import { setDriverInfoIndex } from '@/app/_globalRedux/dashboard/optionsSlice';
import { useLazyUpdateDriverDataQuery } from '@/app/_globalRedux/services/trackingDashboard';
import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { RootState } from '@/app/_globalRedux/store';
import { CopyFilled, EditFilled, EyeFilled, UserAddOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const DriverInfo = ({ vehicleData }: { vehicleData: VehicleData }) => {
	const { driverInfoIndex } = useSelector((state: RootState) => state.vehicleOverviewOptions);
	const [isEditOrCreate, setIsEditOrCreate] = useState(false);
	const { groupId } = useSelector((state: RootState) => state.auth);
	const [promiseLoading, setPromiseLoading] = useState(false);
	const dispatch = useDispatch();

	const [triggerUpdateDriverData, { isLoading }] = useLazyUpdateDriverDataQuery();

	const onFinish = (e: any) => {
		triggerUpdateDriverData({
			sysServiceId: `${vehicleData.vId}`,
			groupId: Number(groupId),
			driverName: e['driver-name'],
			driverNumber: e['driver-number'],
		});
	};

	useEffect(
		() => {
			if (isLoading) {
				setPromiseLoading(true);
			} else {
				setPromiseLoading(false);
				dispatch(setDriverInfoIndex(-1));
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isLoading]
	);
	return (
		<>
			{driverInfoIndex === vehicleData.vId ? (
				<Modal title='Driver Info' open={driverInfoIndex !== -1} onCancel={() => dispatch(setDriverInfoIndex(-1))} width={400} footer={null}>
					<Form
						onFinish={(e) => onFinish(e)}
						style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '15px' }}
						className='select-none'
					>
						{isEditOrCreate ? (
							<div className='font-bold text-sm text-neutral-800 flex flex-col gap-2 mt-3 overflow-clip rounded-lg'>
								<div className='p-4 pb-3 flex flex-col gap-2'>
									<div className='grid grid-cols-3 gap-2 items-center'>
										<div>Name :</div>
										<div className='col-span-2'>
											<Form.Item noStyle rules={[{ type: 'string' }]} name='driver-name'>
												<Input
													styles={{
														input: {
															background: '#F2F5F3',
															fontWeight: 400,
														},
													}}
													placeholder={
														vehicleData.drivers.driverName && vehicleData.drivers.driverName !== 'NA'
															? vehicleData.drivers.driverName
															: "Enter Driver's Name"
													}
												/>
											</Form.Item>
										</div>

										<div>Phone No :</div>
										<div className='col-span-2'>
											<Form.Item noStyle rules={[{ type: 'string' }]} name='driver-number'>
												<Input
													styles={{
														input: {
															background: '#F2F5F3',
															fontWeight: 400,
														},
													}}
													placeholder={
														vehicleData.drivers.phoneNumber && vehicleData.drivers.phoneNumber !== 'NA'
															? vehicleData.drivers.phoneNumber
															: "Enter Driver's Number"
													}
												/>
											</Form.Item>
										</div>
									</div>
								</div>
							</div>
						) : (
							<>
								{(vehicleData.drivers.driverName && vehicleData.drivers.driverName !== 'NA') ||
								(vehicleData.drivers.phoneNumber !== 'NA' && vehicleData.drivers.phoneNumber) ? (
									<div className='font-bold text-sm text-neutral-800 flex flex-col gap-2 mt-3 overflow-clip rounded-lg'>
										<div className='bg-neutral-green p-4 pb-3'>
											<Typography.Text
												copyable={{
													text: `Driver Name: ${vehicleData.drivers.driverName}\nPhone Number: ${vehicleData.drivers.phoneNumber}`,
													icon: <CopyFilled style={{ color: 'rgb(38,38,38)' }} />,
												}}
											>
												<p>
													Name: <span className='font-medium'>{vehicleData.drivers.driverName}</span>
												</p>
												<p className='inline-block w-[calc(100%-30px)]'>
													Phone Number: <span className='font-medium'>{vehicleData.drivers.phoneNumber}</span>
												</p>
											</Typography.Text>
										</div>
									</div>
								) : (
									<div className='text-sm font-normal text-neutral-800 flex flex-col gap-2 mt-3 overflow-clip rounded-lg'>
										<div
											className='bg-neutral-green p-4 pb-[18px] text-center hover:text-primary-green transition-colors duration-300 cursor-pointer'
											onClick={() => setIsEditOrCreate(true)}
										>
											<div className='w-full flex items-center justify-center'>
												<UserAddOutlined className='text-3xl my-2' />
											</div>
											Add Driver
										</div>
									</div>
								)}
							</>
						)}
						{(vehicleData.drivers.driverName && vehicleData.drivers.driverName !== 'NA') ||
						(vehicleData.drivers.phoneNumber !== 'NA' && vehicleData.drivers.phoneNumber) ? (
							<div
								className='p-1 w-fit absolute bottom-6  border-2 border-gray-800 rounded-full flex items-center justify-center mt-4'
								onClick={() => setIsEditOrCreate((prev) => !prev)}
							>
								{isEditOrCreate ? <EditFilled /> : <EyeFilled />}
							</div>
						) : null}

						<div className='flex gap-2 justify-end mt-6'>
							<Form.Item noStyle>
								<Button type='primary' htmlType='submit' loading={promiseLoading}>
									Submit
								</Button>
							</Form.Item>
							<Form.Item noStyle>
								<Button onClick={() => dispatch(setDriverInfoIndex(-1))}>Cancel</Button>
							</Form.Item>
						</div>
					</Form>
				</Modal>
			) : null}
		</>
	);
};
