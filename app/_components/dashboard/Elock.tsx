'use client';

import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { RootState } from '@/app/_globalRedux/store';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

export const Elock = ({ data }: { data: VehicleData }) => {
	const { userId, groupId, accessLabel } = useSelector((state: RootState) => state.auth);

	const isElockVehicle = accessLabel === 6;

	const handleElockClick = () => {
		const url = `https://gtrac.in/trackingyatayaat/reports/load_search_data_with_reports_react.php?action=search_with_reports&vehicle_Number=${data.vId}&CtrlId=${data.controllermergeId}&ParentId=1&UserName=htpl&sys_group_id_parent=1&sys_group_id=${groupId}&UserId=${userId}`;
		window.open(url);
	};

	return (
		<>
			{isElockVehicle && (
				<>
					{data.gpsDtl.acState === 'Off' ? (
						<Tooltip title='E-Lock Locked' mouseEnterDelay={1}>
							<div onClick={handleElockClick}>
								<LockOutlined style={{ fontSize: '20px', color: '#478C83' }} />
							</div>
						</Tooltip>
					) : data.gpsDtl.acState === 'On' ? (
						<Tooltip title='E-Lock Unlocked' mouseEnterDelay={1}>
							<div onClick={handleElockClick}>
								<UnlockOutlined style={{ fontSize: '20px', color: '#BF2E39' }} />
							</div>
						</Tooltip>
					) : null}
				</>
			)}
		</>
	);
};
