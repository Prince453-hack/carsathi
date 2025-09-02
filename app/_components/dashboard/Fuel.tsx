'use client';

import { VehicleData } from '@/app/_globalRedux/services/types/getListVehiclesmobTypes';
import fuelGreen from '@/public/assets/svgs/common/fuel_green.svg';
import fuelRed from '@/public/assets/svgs/common/fuel_red.svg';
import { Tooltip } from 'antd';
import Image from 'next/image';
import React from 'react';

export const Fuel = ({ data }: { data: VehicleData }) => {
	return (
		<>
			{data.gpsDtl.fuel && data.gpsDtl.fuel < 100 ? (
				<Tooltip title='Fuel Percentage' mouseEnterDelay={1}>
					<div className='flex items-center gap-2 border border-neutral-200 rounded-full px-2 py-1'>
						<div className='w-[14px] h-[14px]'>
							{data.gpsDtl.fuel > 50 ? <Image src={fuelGreen} alt='fuel green' /> : <Image src={fuelRed} alt='fuel red' />}
						</div>
						<div>
							<p className='font-semibold text-xs text-neutral-600'>{data.gpsDtl.fuel?.toFixed(0)}%</p>
						</div>
					</div>
				</Tooltip>
			) : null}
		</>
	);
};
