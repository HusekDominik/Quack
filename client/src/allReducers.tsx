import { combineReducers } from 'redux';
import isLoggedReducer from './store/system/reducerLoggedIn';
import isChatReducer from './store/chat/reducerChat';

const allReducers = combineReducers({
	isLogged: isLoggedReducer,
	isChat: isChatReducer
});

export type RootState = ReturnType<typeof allReducers>;
export default allReducers;
