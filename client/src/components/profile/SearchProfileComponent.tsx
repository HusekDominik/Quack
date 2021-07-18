import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../allReducers';
import { SearchedProfile, SystemState } from '../../store/system/types';
import axios from 'axios';
import ProfileComponent from './ProfileComponent';
import PostComponent from '../PostComponent';

export interface SearchedUserProps {
	match?;
}

const SearchedUser: React.FC<SearchedUserProps> = (props) => {
	const state: any = useSelector((state: RootState) => state.isLogged);

	const usernameParamVar = props.match.params.username;

	const [ userID, setUserID ] = useState<string>('');
	const [ userUsername, setUserUsername ] = useState<string>('');
	const [ userFirstname, setUserFirstname ] = useState<string>('');
	const [ userLastname, setUserLastname ] = useState<string>('');
	const [ userProfileImg, setUserProfileImg ] = useState<string>('');
	const [ userBackgroundImg, setUserBackgroundImg ] = useState<string>('');
	const [ userGender, setUserGender ] = useState<string>('');

	const [ hiddenProfile, setHiddenProfile ] = useState<boolean>(false);
	const [ friendshipStatus, setFriendshipStatus ] = useState<string | number>('');
	const [ loading, setLoading ] = useState(true);
	const [ isFetching, setIsFetching ] = useState(false);
	const [ posts, setPosts ] = useState<any>('');
	const [ firstFetching, setFirstFetching ] = useState<boolean>(true);
	const [ noPostLeft, setNoPostLeft ] = useState<boolean>(false);

	useEffect(
		() => {
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		},
		[ isFetching ]
	);

	function handleScroll(): void {
		if (window.innerHeight + document.documentElement.scrollTop + 30 < document.documentElement.offsetHeight)
			return;

		setIsFetching(true);
	}

	useEffect(
		() => {
			if (!isFetching && !firstFetching) return;
			if (noPostLeft) {
				setIsFetching(false);
				return;
			}
			const source = axios.CancelToken.source();
			const getData = async () => {
				try {
					if (state.accessToken) {
						const config = {
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${state.accessToken}`
							},
							cancelToken: source.token
						};

						let fetchPostsAmount = posts.length;

						const response = await axios.get(
							`http://localhost:8000/user/profile/search/${usernameParamVar}/${fetchPostsAmount}`,
							config
						);

						if (response.data.posts.length === 0) {
							setNoPostLeft(true);
						}

						if (response.data.hidePosts) {
							setHiddenProfile(true);
						}

						setUserID(response.data.user.id);
						setUserUsername(response.data.user.username);
						setUserFirstname(response.data.user.firstname);
						setUserLastname(response.data.user.lastname);
						setUserProfileImg(response.data.user.profile_img);
						setUserGender(response.data.user.gender);
						setUserBackgroundImg(response.data.user.profile_background_img);
						setPosts((oldArray) => [ ...oldArray, ...response.data.posts ]);
						setLoading(false);
						setFirstFetching(false);
						setIsFetching(false);
						setFriendshipStatus(response.data.friendStatus);
					}
				} catch (error) {
					if (axios.isCancel(error)) {
						console.log(error);
						return;
					}
					return;
				}
			};
			getData();

			return () => {
				source.cancel();
			};
		},
		[ isFetching, state.accessToken, firstFetching ]
	);

	return (
		<section className="searched-profile-page">
			{userGender && (friendshipStatus === 0 || friendshipStatus) ? (
				<ProfileComponent
					profile_img={userProfileImg ? userProfileImg : null}
					gender={userGender}
					firstname={userFirstname}
					lastname={userLastname}
					profileBackground={userBackgroundImg ? userBackgroundImg : null}
					id={userID}
					friendshipStatus={friendshipStatus}
				/>
			) : (
				''
			)}

			<React.Fragment>
				{loading && <div className="no-posts">Loading...</div>}
				{!loading &&
				posts.length === 0 &&
				!hiddenProfile && <div className="no-posts">Doesn't have any posts</div>}
				{hiddenProfile && <div className="no-posts">User has private profile, be friends to see his posts</div>}
				{posts &&
					userFirstname &&
					posts.map((post): JSX.Element => {
						return (
							<PostComponent
								key={'searchedProfilePosts' + post.post_id_main}
								username={userUsername}
								firstname={userFirstname}
								lastname={userLastname}
								gender={userGender}
								profile_img={userProfileImg}
								{...post}
							/>
						);
					})}
				{noPostLeft && !loading && !hiddenProfile && posts.length > 0 ? (
					<div className="no-posts">No posts left</div>
				) : (
					''
				)}
			</React.Fragment>
		</section>
	);
};

export default SearchedUser;
