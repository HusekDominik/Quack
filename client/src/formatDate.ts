import moment from 'moment';

const formatDateFunc = (date: string): string => {
	const d = new Date(date);
	const currentTime = new Date();

	const timeFromNow = moment(d).fromNow();

	const diffTime = moment(currentTime).diff(moment(d), 'days');

	if (diffTime > 7) {
		const data = moment(d).format('LLL'); // February 26, 2021 2:11 PM

		const dateArray = data.split(' ');

		return `${dateArray[0]} ${dateArray[1]} ${dateArray[3]}  ${dateArray[4]}`;
	}

	return timeFromNow;
};

const formatCommentDateFunc = (date: string): string => {
	const d = new Date(date);

	let timeFromNow = moment(d).fromNow();

	if (parseInt(timeFromNow).toString().length === 2) {
		timeFromNow = timeFromNow.substr(0, 6);
	} else {
		timeFromNow = timeFromNow.substr(0, 5);

		if (timeFromNow === 'a day') {
			return '1 d';
		} else if (timeFromNow === 'a few') {
			return '0 min';
		} else if (timeFromNow === 'a min') {
			return '1 min';
		} else if (timeFromNow === 'an ho') {
			return '1 h';
		} else if (timeFromNow === 'a wee') {
			return '1 w';
		}
		else if (timeFromNow === "a mon") {
			return "1 mon";
		}
		else if (timeFromNow === 'a yea') {
			return '1 y';
		}
	}

	return timeFromNow;
};

const chatMessagesDateFunc = (date: string): string => {
	const d = new Date(date);
	const currentTIme = new Date();

	const difference = (currentTIme.getTime() - d.getTime());

	const dayInMilliseconds = 86400000;

	const hours = d.getHours();
	const minutes = "0" + d.getMinutes();

	if (difference < dayInMilliseconds) {
		return hours + ':' + minutes.substr(-2);

	}

	const weekInMilliseconds = 604800000;
	const day = moment(d).format('dddd');

	if (difference > dayInMilliseconds && difference < weekInMilliseconds) {
		return day + " " + hours + ':' + minutes.substr(-2);
	}

	return moment(d).format('lll');

}
export { formatDateFunc, formatCommentDateFunc, chatMessagesDateFunc };
