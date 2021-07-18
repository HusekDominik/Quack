import {
	LOGGED_IN,
	LOGGED_OUT,
	CHANGE_PROFILE_PIC,
	SystemState,
	SystemActionTypes,
	ChangedProfilePic,
	UPDATE_PROFILE_ACCOUNT,
	UpdatedProfileAccount,
	UPDATE_PROFILE_PRIVACY,
	UpdatedProfilePrivacy
} from './types';

const isLogged = (user: SystemState): SystemActionTypes => {
	return {
		type: LOGGED_IN,
		payload: user
	};
};
const isLoggedOut = (): SystemActionTypes => {
	return {
		type: LOGGED_OUT
	};
};

const changedProfilePic = (profileImg: ChangedProfilePic): SystemActionTypes => {
	return {
		type: CHANGE_PROFILE_PIC,
		payload: profileImg
	};
};

const updateProfileAccount = (user: UpdatedProfileAccount): SystemActionTypes => {
	return {
		type: UPDATE_PROFILE_ACCOUNT,
		payload: user
	};
};

const updateProfilePrivacy = (isPrivate: UpdatedProfilePrivacy): SystemActionTypes => {
	return {
		type: UPDATE_PROFILE_PRIVACY,
		payload: isPrivate
	};
};

export { isLogged, isLoggedOut, changedProfilePic, updateProfileAccount, updateProfilePrivacy };
