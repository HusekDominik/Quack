import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SearchedProfile, SystemState } from '../../../store/system/types';
import { RootState } from '../../../allReducers';
import axios from 'axios';
import InvitesC from '../../relationships/InvitesC';

export interface RelationshipProps {
	users: SearchedProfile;
	created_at_relationship: string;
}

const Relationship: React.FC<RelationshipProps> = () => {
	const [ users, setUsers ] = useState<any>([]);
	const [ loading, setLoading ] = useState<boolean>(true);
	const state: any = useSelector<SystemState>((state: any) => state.isLogged);

	useEffect(
		() => {
			const source = axios.CancelToken.source();
			if (state.accessToken) {
				const getUsers = async () => {
					try {
						const config = {
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${state.accessToken}`
							},
							cancelToken: source.token
						};

						const response = await axios.get<RelationshipProps>(
							'http://localhost:8000/user/friends/get/requested/all',
							config
						);

						setUsers(response.data.users);
						setLoading(false);
					} catch (error) {
						return;
					}
				};
				getUsers();
			}
			return () => {
				source.cancel();
			};
		},
		[ state.accessToken ]
	);

	return (
		<section className="relationship-page">
			<div className="relationship-page__container">
				<h4>Friend requests</h4>
				{loading ? <div className="no-posts">Loading...</div> : ''}
				{!loading && users.length === 0 ? (
					<div className="no-posts">You don't have any friend requests</div>
				) : (
					''
				)}
				<ul>
					{users &&
						users.map((user): JSX.Element => {
							return <InvitesC key={user.user_main_id} {...user} />;
						})}
				</ul>
			</div>
		</section>
	);
};

export default Relationship;
