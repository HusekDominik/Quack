import {
	LOGGED_IN,
	CHANGE_PROFILE_PIC,
	LOGGED_OUT,
	SystemState,
	SystemActionTypes,
	UPDATE_PROFILE_ACCOUNT,
	UPDATE_PROFILE_PRIVACY,
	CHANGE_MODE
} from './types';

const initialState: SystemState = {
	isLogged: false,
	accessToken: '',
	id: '',
	username: '',
	firstname: '',
	email: '',
	lastname: '',
	profileImg: '',
	gender: '',
	isPrivate: false,
	darkMode: false
};

const isLoggedIn = (state = initialState, action: SystemActionTypes): SystemState => {
	switch (action.type) {
		case LOGGED_IN:
			return {
				isLogged: true,
				accessToken: action.payload.accessToken,
				id: action.payload.id,
				username: action.payload.username,
				firstname: action.payload.firstname,
				lastname: action.payload.lastname,
				email: action.payload.email,
				profileImg: action.payload.profileImg,
				gender: action.payload.gender,
				isPrivate: action.payload.isPrivate,
				darkMode: action.payload.darkMode
			};
		case LOGGED_OUT:
			return {
				isLogged: false,
				accessToken: '',
				id: '',
				username: '',
				firstname: '',
				lastname: '',
				email: '',
				profileImg: '',
				gender: '',
				isPrivate: false,
				darkMode: false
			};
		case CHANGE_PROFILE_PIC:
			return {
				...state,
				profileImg: action.payload.profileImg
			};

		case UPDATE_PROFILE_PRIVACY:
			return {
				...state,
				isPrivate: action.payload.isPrivate
			};

		case UPDATE_PROFILE_ACCOUNT:
			return {
				...state,
				username: action.payload.username,
				firstname: action.payload.firstname,
				lastname: action.payload.lastname,
				email: action.payload.email,
				gender: action.payload.gender
			};
		case CHANGE_MODE:
			return {
				...state,
				darkMode: action.payload.darkMode
			};

		default:
			return state;
	}
};

export default isLoggedIn;
