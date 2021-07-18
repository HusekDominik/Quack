export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const CHANGE_MODE = 'CHANGE_MODE';
export const CHANGE_PROFILE_PIC = 'CHANGE_PROFILE_PIC';
export const UPDATE_PROFILE_ACCOUNT = 'UPDATE_PROFILE_ACCOUNT';
export const UPDATE_PROFILE_PRIVACY = 'UPDATE_PROFILE_PRIVACY';

export interface SystemState {
	id: string;
	isLogged: boolean;
	accessToken: string;
	username: string;
	firstname: string;
	lastname: string;
	profileImg: string;
	email: string;
	gender: string;
	isPrivate: boolean;
	darkMode: boolean;
}

export interface SearchedProfile {
	id: number;
	username: string;
	email: string;
	firstname: string;
	lastname: string;
	profileImg: string;
	gender: string;
	posts: any[];
	profileBackground: string | null;
	// createdat?: string,
	// updatedat?: string
}

export interface ChangedProfilePic {
	profileImg: string;
}

export interface UpdatedProfileAccount {
	username: string;
	email: string;
	firstname: string;
	lastname: string;
	gender: string;
}

export interface UpdatedProfilePrivacy {
	isPrivate: boolean;
}

interface UpdatedProfileAccountAction {
	type: typeof UPDATE_PROFILE_ACCOUNT;
	payload: UpdatedProfileAccount;
}

interface LoggedInAction {
	type: typeof LOGGED_IN;
	payload: SystemState;
}

interface updatedDarkMode {
	darkMode: boolean;
}

interface ChangeModeAction {
	type: typeof CHANGE_MODE;
	payload: updatedDarkMode;
}

interface LoggedOutAction {
	type: typeof LOGGED_OUT;
}

interface UpdateProfilePrivacyAction {
	type: typeof UPDATE_PROFILE_PRIVACY;
	payload: UpdatedProfilePrivacy;
}

interface changedProfilePicAction {
	type: typeof CHANGE_PROFILE_PIC;
	payload: ChangedProfilePic;
}

export type SystemActionTypes =
	| LoggedInAction
	| LoggedOutAction
	| changedProfilePicAction
	| UpdateProfilePrivacyAction
	| ChangeModeAction
	| UpdatedProfileAccountAction;
