import React, { useState } from 'react';
import axios from 'axios';
import { RootState } from '../../allReducers';
import { SystemState } from '../../store/system/types';
import { useSelector } from 'react-redux';
import profileIcon from '../../images/user.png';
import AboutInfoComponent from './AboutInfoComponent';
import AboutFilesComponent from './AboutFilesComponent';
import AboutFriendsComponent from './AboutFriendsComponent';

export interface AboutProfileComponentProps {
	userID: any;
	friendshipStatus: string | null | number | undefined;
}

const AboutProfileComponent: React.FC<AboutProfileComponentProps> = (props: AboutProfileComponentProps) => {
	const { friendshipStatus, userID } = props;

	const [ checkRenderID, setCheckRenderID ] = useState<number>(0);
	const isLoggedState: any = useSelector<RootState>((state: RootState) => state.isLogged);
	const [ friendshipStatusS, setFriendshipStatusS ] = useState<string | number | null | undefined>(friendshipStatus);

	const checkFriendshipStatusFunc = (status) => {
		let stringStatus: string;
		switch (status) {
			case 0:
				stringStatus = 'Add Friend';
				break;
			case 'Accepted':
				stringStatus = 'Friends';
				break;
			case 'Pending':
				stringStatus = 'Pending';
				break;
			case 'Requested':
				stringStatus = 'Requested';
				break;
			default:
				stringStatus = 'error';
		}
		return stringStatus;
	};

	const areFriends = () => {
		if (checkFriendshipStatusFunc(friendshipStatus) === 'Add Friend') {
			return <b>+</b>;
		}
	};

	const addFriend = async () => {
		try {
			const sendData = {
				profileID: userID
			};

			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${isLoggedState.accessToken}`
				}
			};

			await axios.post('http://localhost:8000/user/friends/add', sendData, config);

			setFriendshipStatusS('Requested');
		} catch (error) {
			console.log(error);
			return;
		}
	};

	const renderComponentContent = (id: number) => {
		switch (id) {
			case 0:
				return <AboutInfoComponent userID={userID} />;
			case 1:
				return <AboutFriendsComponent userID={userID} />;

			case 2:
				return <AboutFilesComponent userID={userID} />;
			default:
				return <AboutInfoComponent userID={userID} />;
		}
	};

	return (
		<React.Fragment>
			<div className="profile-about-component">
				<div>
					<button
						onClick={() => setCheckRenderID(0)}
						className={checkRenderID === 0 ? 'active' : ''}
						type="button"
					>
						<h1>About</h1>
					</button>
					<button
						onClick={() => setCheckRenderID(1)}
						className={checkRenderID === 1 ? 'active' : ''}
						type="button"
					>
						<h1>Friends</h1>
					</button>
					<button
						onClick={() => setCheckRenderID(2)}
						className={checkRenderID === 2 ? 'active' : ''}
						type="button"
					>
						<h1>Shared</h1>
					</button>
				</div>
				{isLoggedState.id !== userID && (
					<div className="profile-about-component__relationship">
						<button
							className="profile-about-component__relationship__button"
							onClick={() => addFriend()}
							disabled={checkFriendshipStatusFunc(friendshipStatusS) !== 'Add Friend'}
							type="submit"
						>
							{areFriends()}
							<img src={profileIcon} alt="profile" />
							{checkFriendshipStatusFunc(friendshipStatusS)}
						</button>
					</div>
				)}
			</div>
			<div className="profile-about-component__container">{renderComponentContent(checkRenderID)}</div>
		</React.Fragment>
	);
};

export default AboutProfileComponent;
