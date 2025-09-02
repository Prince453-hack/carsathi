'use client';

import React from 'react';
import { Tabs } from 'antd';
import { Trips, PlannedTrips, TripHeader } from './index';

import ListAndTableViewToggle from './listAndTableViewToggle';

export const ViewContext = React.createContext<'LIST' | 'TABLE'>('LIST');

export const TripReportAndPlanningToggle = () => {
	const [activeView, setActiveView] = React.useState<'LIST' | 'TABLE'>('LIST');
	return (
		<ViewContext.Provider value={activeView}>
			<div className='py-4 relative'>
				<TripHeader />
				<ListAndTableViewToggle setActiveView={setActiveView} />

				<Tabs
					defaultActiveKey='1'
					items={[
						{
							label: 'Trips',
							key: 'trips',
							children: <Trips />,
						},
						{
							label: 'Planned Trips',
							key: 'planned trips',
							children: <PlannedTrips />,
						},
					]}
				/>
			</div>
		</ViewContext.Provider>
	);
};
