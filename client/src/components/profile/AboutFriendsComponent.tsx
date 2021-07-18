import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../allReducers';

import { profileImgFunc } from '../../ProfileImg';
import { SystemState } from '../../store/system/types';

export interface AboutFriendsComponentProps {
	userID: number;
}

const AboutFriendsComponent: React.FC<AboutFriendsComponentProps> = (props) => {
	const { userID } = props;

	const state: any = useSelector<SystemState>((state: any) => state.isLogged);
	const [ friends, setFriends ] = useState([]);
	const [ loading, setLoading ] = useState(true);

	useEffect(
		() => {
			const source = axios.CancelToken.source();

			if (!state.id) {
				return;
			}

			const fetchData = async () => {
				try {
					const config = {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${state.accessToken}`
						},
						cancelToken: source.token
					};

					let url = `http://localhost:8000/about/profile/friends/${userID}`;

					if (userID === parseInt(state.id)) {
						url = `http://localhost:8000/user/friends/get/friends`;
					}

					const response = await axios.get(url, config);
					setLoading(false);

					setFriends(response.data.friends);
				} catch (error) {
					if (axios.isCancel(error)) {
						return;
					}
				}
			};
			fetchData();

			return () => {
				source.cancel();
			};
		},
		[ userID, state.id, state.accessToken ]
	);

	return (
		<React.Fragment>
			<ul className="profile-about-component__container__friend-menu">
				{friends &&
					friends.map((friend: any) => {
						let profilePath = `/profile/search/${friend.username}`;

						if (friend.username === state.username) {
							profilePath = `/user/profile/${friend.username}`;
						}

						return (
							<li className="friend-request" key={friend.id}>
								<div className="friend-request__left">
									<div className="friend-request__left__notification-img">
										<Link to={profilePath}>
											<img
												src={profileImgFunc(friend.profileImg, friend.gender, false)}
												alt="profileimg"
											/>
										</Link>
									</div>
									<span className="friend-request__name">
										{friend.firstname + ' ' + friend.lastname + ' '}
									</span>
								</div>
							</li>
						);
					})}
			</ul>
			{!loading && friends && friends.length < 1 && <div className="no-posts">Doesn't have any friends</div>}
		</React.Fragment>
	);
};

export default AboutFriendsComponent;
