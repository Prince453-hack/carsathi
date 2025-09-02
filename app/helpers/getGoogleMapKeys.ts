const getGoogleApiKey = () => {
	const newDate = new Date();
	const day = newDate.getDate();
	const hours = newDate.getHours();

	if (day >= 1 && day <= 2) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_1;
	} else if (day >= 3 && day <= 4) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_2;
	} else if (day >= 5 && day <= 6) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_3;
	} else if (day >= 7 && day <= 8) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_4;
	} else if (day >= 9 && day <= 10) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_5;
	} else if (day >= 11 && day <= 12) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_6;
	} else if (day >= 13 && day <= 14) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_7;
	} else if (day >= 15 && day <= 16) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_8;
	} else if (day >= 17 && day <= 18) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_9;
	} else if (day >= 19 && day <= 20) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_10;
	} else if (day >= 21 && day <= 22) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_11;
	} else if (day >= 23 && day <= 24) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_12;
	} else if (day >= 25 && day <= 26) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_13;
	} else if (day >= 27 && day <= 28) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_14;
	} else if (day == 29) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_8;
	} else if (day == 30) {
		return process.env.NEXT_PUBLIC_GOOGLE_KEY_13;
	} else if (day == 31) {
		if (hours < 13) {
			return process.env.NEXT_PUBLIC_GOOGLE_KEY_9;
		} else {
			return process.env.NEXT_PUBLIC_GOOGLE_KEY_10;
		}
	}
};

export default getGoogleApiKey;
