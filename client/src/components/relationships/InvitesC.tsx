import React, { useState } from 'react';
import { RootState } from '../../allReducers';
import { SearchedProfile, SystemState } from '../../store/system/types';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatCommentDateFunc } from '../../formatDate';
import { profileImgFunc } from '../../ProfileImg';

export interface InvitesCProps extends SearchedProfile {
	created_at_relationship: string;
	user_main_id: number;
}

const InvitesC: React.FC<InvitesCProps> = (props: InvitesCProps) => {
	const { username, firstname, lastname, profileImg, user_main_id, gender, created_at_relationship } = props;
	const [ requestAction, setRequestAction ] = useState<string>('');

	const state: any = useSelector((state: RootState) => state.isLogged);

	const acceptFriendRequest = async (id: number): Promise<void> => {
		try {
			const confing = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			const data = {
				profileID: id
			};

			await axios.put('http://localhost:8000/user/friends/accept', data, confing);

			setRequestAction('accepted');
		} catch (error) {
			console.log(error);
			return;
		}
	};

	const declineFriendRequest = async (id: number): Promise<void> => {
		try {
			const confing = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			await axios.delete(`http://localhost:8000/user/friends/decline/${id}`, confing);

			setRequestAction('declined');
		} catch (error) {
			console.log(error);
			return;
		}
	};

	const contentRenderFunc = () => {
		if (requestAction === 'accepted') {
			return <span className="friend-request__status">Accepted</span>;
		} else if (requestAction === 'declined') {
			return <span className="friend-request__status">Declined</span>;
		} else {
			return (
				<React.Fragment>
					<button className="accept-button" type="button" onClick={() => acceptFriendRequest(user_main_id)}>
						Accept
					</button>
					<button className="decline-button" type="button" onClick={() => declineFriendRequest(user_main_id)}>
						Decline
					</button>
				</React.Fragment>
			);
		}
	};

	return (
		<li className="friend-request">
			<div className="friend-request__left">
				<div className="friend-request__left__notification-img">
					<Link to={`/profile/search/${username}`}>
						<img src={profileImgFunc(profileImg, gender, false)} alt="profileimg" />
					</Link>
					<span className="friend-request__left__notification-img__createdat">
						{formatCommentDateFunc(created_at_relationship)}
					</span>
				</div>
			</div>

			<span className="friend-request__name">{firstname + ' ' + lastname + ' '}</span>

			{contentRenderFunc()}
		</li>
	);
};

export default InvitesC;
