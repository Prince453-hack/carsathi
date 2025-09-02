import { RootState } from '@/app/_globalRedux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setClusterToggle } from '@/app/_globalRedux/common/clusterSlice';
import { Dispatch, SetStateAction } from 'react';
import { FloatButton, Tooltip } from 'antd';
import ClusterOn from '@/app/_assets/svgs/map/cluster-on';
import ClusterOff from '@/app/_assets/svgs/map/cluster-off';

export const ClusterToggle = ({ setLoading }: { setLoading: Dispatch<SetStateAction<boolean>> }) => {
	const dispatch = useDispatch();
	const cluster = useSelector((state: RootState) => state.cluster);

	const onClickHandler = () => {
		setLoading(true);
		setTimeout(() => setLoading(false), 1000);
		dispatch(setClusterToggle());
	};

	return (
		<FloatButton
			onClick={onClickHandler}
			icon={cluster ? <ClusterOff /> : <ClusterOn />}
			tooltip={cluster ? 'Toggle Cluster Off' : 'Toggle Cluster On'}
		/>
	);
};
