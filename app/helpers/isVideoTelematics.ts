export const isVideoTelematics = (userId: number, parentUser: number): string | null => {
	if (userId === 3151 || parentUser === 3151) {
		return '1817905475755495424';
	} else if (userId === 81707 || parentUser == 81707) {
		return '1785167746249023488';
	} else {
		return null;
	}
};
