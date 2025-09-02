import PoiIcon from '@/app/_assets/svgs/map/poi-icon';
import { setIsLoadingScreenActive } from '@/app/_globalRedux/dashboard/mapSlice';
import { initialPOIDropDownState, setGeoFence, setPoiData } from '@/app/_globalRedux/dashboard/poiSlice';
import { RootState } from '@/app/_globalRedux/store';
import { CheckCircleFilled } from '@ant-design/icons';
import { FloatButton } from 'antd';
import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const PoiToggle = ({ checked, setChecked }: { checked: string; setChecked: React.Dispatch<React.SetStateAction<string>> }) => {
	const dispatch = useDispatch();
	const { userId, parentUser } = useSelector((state: RootState) => state.auth);

	const displayPOIOnMap = async () => {
		if (checked === 'POI') {
			dispatch(setPoiData(initialPOIDropDownState));
			dispatch(setGeoFence(initialPOIDropDownState));
			setChecked('loading');
		} else {
			var res = await axios.get(process.env.NEXT_PUBLIC_DASH_URL + `/getAllPoiList?userid=${userId}&puserid=${parentUser}`);
			dispatch(setPoiData({ poi: res.data.list }));
			dispatch(setGeoFence({ geofenceList: res.data.geofenceList }));
			setChecked('POI');
		}
		dispatch(setIsLoadingScreenActive(true));

		setTimeout(() => dispatch(setIsLoadingScreenActive(false)), 1);
	};

	return (
		<>
			<FloatButton
				tooltip='Toggle POI'
				icon={<PoiIcon />}
				onClick={async () => {
					await displayPOIOnMap();
				}}
			>
				{checked ? (
					<>
						<CheckCircleFilled className='absolute z-30 top-0 -right-1 text-primary-green' twoToneColor='#478C81' color='#478C81' />
					</>
				) : null}
			</FloatButton>
		</>
	);
};
