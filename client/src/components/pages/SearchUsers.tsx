import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../allReducers';
import { SystemState } from '../../store/system/types';

export interface SearchUsersProps {}

const SearchUsers: React.FC<SearchUsersProps> = (props: any) => {
	const paramsUsername = props.match.params.username;

	const state: SystemState = useSelector((state: RootState) => state.isLogged);
	const [ error, setError ] = useState<string | boolean>('');
	const [ loading, setLoading ] = useState<boolean>(false);
	const [ foundUsers, setFoundUsers ] = useState<any>([]);

	useEffect(
		() => {
			const callAsyncFunc = async () => {
				try {
					if (paramsUsername.length !== 0 && state.accessToken) {
						const config = {
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${state.accessToken}`
							}
						};
						const response = await axios.get(
							`http://localhost:8000/user/profiles/${paramsUsername}`,
							config
						);
						if (response.data.user.length === 0) {
							setError('No user was found');
						}
						setFoundUsers(response.data.user);
					}
					setLoading(false);
				} catch (error) {
					setError(false);
					return;
				}
			};
			callAsyncFunc();
			return () => {
				setError('');
			};
		},
		[ paramsUsername, state.accessToken ]
	);

	return (
		<div className="searched-users-page">
			<p>dada</p>
		</div>
	);
};

export default SearchUsers;
