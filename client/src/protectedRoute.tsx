import React, { useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { SystemState } from './store/system/types';
import { RootState } from './allReducers';
import Chat from './components/chat/Chat';

const ProtectedRoute = ({ component: Component, chat, navbar, ...rest }) => {
	const state: SystemState = useSelector((state: RootState) => state.isLogged);

	const dispatch = useDispatch();
	const localStorageItem: any = localStorage.getItem('quack-app-id');

	useEffect(
		() => {
			if (localStorageItem) {
				const parsedStorage: SystemState = JSON.parse(localStorageItem);
				dispatch({
					type: 'LOGGED_IN',
					payload: {
						id: parsedStorage.id,
						accessToken: parsedStorage.accessToken,
						username: parsedStorage.username,
						firstname: parsedStorage.firstname,
						lastname: parsedStorage.lastname,
						profileImg: parsedStorage.profileImg,
						gender: parsedStorage.gender,
						email: parsedStorage.email,
						isPrivate: parsedStorage.isPrivate,
						darkMode: parsedStorage.darkMode
					}
				});
			}
		},
		[ dispatch, state.isLogged, localStorageItem ]
	);

	useEffect(
		() => {
			if (state.darkMode) {
				document.body.classList.add('darkMode');
			}

			return () => {
				document.body.classList.remove('darkMode');
			};
		},
		[ state.darkMode ]
	);

	return (
		<Route
			{...rest}
			render={(props) => {
				console.log(props);
				return state.isLogged || localStorageItem ? (
					<React.Fragment>
						{navbar && <Navbar />}
						<Component {...props} />
						{chat && <Chat fullScreen={false}></Chat>}
					</React.Fragment>
				) : (
					<Redirect to={{ pathname: '/user/login' }} />
				);
			}}
		/>
	);
};

export default ProtectedRoute;
