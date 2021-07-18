const profileImgFunc = (imgPath: string | null | undefined, gender: string, creatingIMG: boolean): string => {
	if (!imgPath) {
		let defaultImgPath;
		if (gender === 'Other') {
			defaultImgPath = require(`./images/profile-${gender}.png`);
			return defaultImgPath.default;
		} else {
			defaultImgPath = require(`./images/profile-${gender}.jpg`);

			return defaultImgPath.default;
		}
	}
	if (creatingIMG) {
		return imgPath;
	}

	return `http://localhost:8000/${imgPath}`;
};

const profileImgBackgroundFunc = (backgoundImgPath: string | null | undefined, creaingIMG: boolean): string => {
	let path;

	if (!backgoundImgPath) {
		path = require('./images/profile-background.jpg');

		return path.default;
	}
	backgoundImgPath = backgoundImgPath.replace(/\\/g, '/');

	if (creaingIMG) {
		return backgoundImgPath;
	}

	return `http://localhost:8000/${backgoundImgPath}`;
};
export { profileImgFunc, profileImgBackgroundFunc };
