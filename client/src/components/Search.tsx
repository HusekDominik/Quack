import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../allReducers';
import { SearchedProfile, SystemState } from '../store/system/types';
import { profileImgFunc } from '../ProfileImg';

const Search: React.FC<any> = (props) => {
	const state: any = useSelector((state: RootState) => state.isLogged);
	const { username, firstname, lastname, gender, profile_img } = props;

	let path = `/profile/search/${username}`;

	if (username === state.username) {
		path = `/user/profile/${username}`;
	}

	return (
		<li>
			<Link to={path}>
				<div className="searched-user-navbar">
					<div className="searched-user-navbar__img">
						<img src={profileImgFunc(profile_img, gender, false)} alt="profile-img" />
					</div>
					<div>
						<h3>{username}</h3>
						<p>{firstname + ' ' + lastname}</p>
					</div>
				</div>
			</Link>
		</li>
	);
};

export default Search;
