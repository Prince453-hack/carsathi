'use client';

import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import { RootState } from '@/app/_globalRedux/store';
import PowerDisconnectedIcon from '@/public/assets/svgs/common/power-disconnected.svg';
import { Tooltip } from 'antd';
import Image from 'next/image';
import { useSelector } from 'react-redux';

export const PowerDisconnected = ({ data }: { data: VehicleData }) => {
	const { accessLabel } = useSelector((state: RootState) => state.auth);

	return (
		<>
			<>
				{data.gpsDtl.ismainpoerconnected == '0' && accessLabel !== 4 ? (
					<Tooltip title='Power Disconnected' mouseEnterDelay={1}>
						<div className='w-[16px] h-[16px]'>
							<Image src={PowerDisconnectedIcon} alt='power disconnected' />
						</div>
					</Tooltip>
				) : null}
			</>
		</>
	);
};
