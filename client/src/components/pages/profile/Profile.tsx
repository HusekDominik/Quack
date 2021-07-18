import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '../../../allReducers';
import { SystemState } from '../../../store/system/types';
import { useSelector } from 'react-redux';
import PostComponent from '../../PostComponent';
import ProfileComponent from '../../profile/ProfileComponent';
import DeleteModal from '../../DeleteModal';

export interface ProfileProps {}

const Profile: React.FC<ProfileProps> = () => {
	const state: any = useSelector((state: RootState) => state.isLogged);

	const [ loading, setLoading ] = useState(true);
	const [ user, setUser ] = useState([]);
	const [ isFetching, setIsFetching ] = useState(false);
	const [ posts, setPosts ] = useState<any>('');
	const [ firstFetching, setFirstFetching ] = useState<boolean>(true);
	const [ noPostLeft, setNoPostLeft ] = useState<boolean>(false);

	const [ deleteModal, setDeleteModal ] = useState<boolean>(false);
	const [ modalID, setModalID ] = useState<string | number>('');
	const [ modalName, setModalName ] = useState<string>('');

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
			const source = axios.CancelToken.source();
			if (!isFetching && !firstFetching) return;
			if (noPostLeft) {
				setIsFetching(false);
				return;
			}
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
							`http://localhost:8000/user/get/main/${fetchPostsAmount}`,
							config
						);

						if (response.data.posts.length === 0) {
							setNoPostLeft(true);
						}

						setUser(response.data.user);
						setPosts((oldArray) => [ ...oldArray, ...response.data.posts ]);
						setLoading(false);
						setFirstFetching(false);
						setIsFetching(false);
					}
				} catch (error) {
					return;
				}
			};
			getData();
			return () => {
				source.cancel();
			};
		},
		[ isFetching, state.accessToken, firstFetching, noPostLeft, posts.length ]
	);

	const deletePost = async (id) => {
		try {
			document.body.style.overflowY = 'scroll';
			setDeleteModal(false);

			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			await axios.delete(`http://localhost:8000/post/delete/${id}`, config);

			setPosts((prev) => prev.filter((post) => post.post_id_main !== id));
		} catch (error) {
			return;
		}
	};

	const openDeleteModal = (modalName: string, modalID: string | number): void => {
		setDeleteModal(true);
		setModalName(modalName);
		setModalID(modalID);
		document.body.style.overflow = 'hidden';
	};

	const closeDeletModal = (): void => {
		setDeleteModal(false);
		document.body.style.overflowY = 'scroll';
	};

	return (
		<section className="main-profile-page searched-profile-page">
			{user &&
				user.map((user: any, index) => {
					return (
						<ProfileComponent
							key={index}
							id={user.id}
							profile_img={user.profile_img}
							gender={user.gender}
							firstname={user.firstname}
							lastname={user.lastname}
							profileBackground={user.profile_background_img}
							friendshipStatus={null}
						/>
					);
				})}

			<React.Fragment>
				{loading && <div className="no-posts">Loading...</div>}
				{!loading && posts.length === 0 && <div className="no-posts">Doesn't have any posts</div>}
				{posts &&
					posts.map((post, index): JSX.Element => {
						return (
							<PostComponent
								key={index}
								username={state.username}
								firstname={state.firstname}
								lastname={state.lastname}
								gender={state.gender}
								profile_img={state.profileImg}
								deletePostFunction={openDeleteModal}
								{...post}
							/>
						);
					})}
			</React.Fragment>
			{deleteModal && (
				<DeleteModal
					modalName={modalName}
					modalID={modalID}
					modalDeleteAction={deletePost}
					modalCloseAction={closeDeletModal}
				/>
			)}
		</section>
	);
};

export default Profile;
