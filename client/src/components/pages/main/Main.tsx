import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../allReducers';
import { SystemState } from '../../../store/system/types';
import { profileImgFunc } from '../../../ProfileImg';
import uploadImgIcon from '../../../images/photo n video.png';
import mp4Icon from '../../../images/mp4-video.png';
import mp3Icon from '../../../images/mp3-audio-file.png';
import closeBtn from '../../../images/close.png';
import sendIcon from '../../../images/send.png';
import { Link } from 'react-router-dom';
import PostComponent from '../../PostComponent';

export interface MainProps {}

const Main: React.FC<MainProps> = () => {
	const isLoggedState: any = useSelector<RootState>((state: RootState) => state.isLogged);
	const { username, accessToken, gender, profileImg } = isLoggedState;
	const [ success, setSuccess ] = useState<string>('');
	const [ error, setError ] = useState<string>('');
	const [ description, setDescription ] = useState<string>('');
	const [ image, setImage ] = useState<string[]>([]);
	const [ imageURL, setImageURL ] = useState<any[]>([]);

	const [ isFetching, setIsFetching ] = useState(false);
	const [ posts, setPosts ] = useState<any>('');
	const [ loading, setLoading ] = useState(true);
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
			let source = axios.CancelToken.source();

			if (!isFetching && !firstFetching) return;
			if (noPostLeft) {
				setIsFetching(false);
				return;
			}
			const getData = async () => {
				try {
					if (isLoggedState.accessToken) {
						const config = {
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${isLoggedState.accessToken}`
							},
							cancelToken: source.token
						};

						let skipAmount = posts.length;

						const response = await axios.get(`http://localhost:8000/post/get/all/${skipAmount}`, config);

						if (response.data.posts.length === 0) {
							setNoPostLeft(true);
						}

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
		[ isFetching, isLoggedState.accessToken, firstFetching ]
	);

	const createPostFunc = async (e: any): Promise<void> => {
		try {
			e.preventDefault();

			const config = {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			};

			let sendFormData;

			if (!image && !description) {
				return;
			}

			sendFormData = new FormData();
			for (const file of image) {
				sendFormData.append('images', file);
			}
			if (description) {
				sendFormData.append('description', description);
			}

			await axios.post(`http://localhost:8000/post/add/multiple`, sendFormData, config);

			setError('');
			setSuccess('You have successfuly created a post');
			setDescription('');
			setImageURL([]);
			setImage([]);
		} catch (error) {
			if (error.response) {
				setError(error.response.data.error);
				return;
			}
			setError('An error ocurred');
			return;
		}
	};

	const discardPostImg = (id) => {
		imageURL.splice(id, 1);
		image.splice(id, 1);

		setImageURL((prev) => prev.filter((img) => img != id));
		setImage((prev) => prev.filter((img) => img != id));
	};

	const selectPostImage = async (e: any) => {
		try {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onloadend = () => {
					if (file.type.includes('audio')) {
						setImageURL((oldArray) => [ ...oldArray, { url: mp3Icon, title: file.name } ]);
					} else if (file.type.includes('video')) {
						setImageURL((oldArray) => [ ...oldArray, { url: mp4Icon, title: file.name } ]);
					} else {
						setImageURL((oldArray) => [ ...oldArray, { url: reader.result, title: file.name } ]);
					}
				};
				reader.readAsDataURL(file);
			}
			setImage((oldArray) => [ ...oldArray, file ]);
		} catch (error) {
			setError('An Error ocurred while selecting image');
			return;
		}
	};

	return (
		<section className="main-page-container">
			<div className="main-content middle-container">
				<div className="main-content__create-post">
					<form action="" onSubmit={createPostFunc} method="POST" encType="multipart/form-data">
						<div className="create-post-first-section">
							<Link to={`/user/profile/${username}`}>
								{(gender || profileImg) && (
									<div className="profile-img">
										<img src={profileImgFunc(profileImg, gender, false)} alt="profileImg" />
									</div>
								)}
							</Link>
							<textarea
								cols={3}
								rows={2}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="What's on your mind?"
								value={description}
								spellCheck={true}
							/>
						</div>
						<div className="create-post-second-section">
							<div className="create-post-second-section__post-img">
								{imageURL &&
									imageURL.map((image, index) => {
										return (
											<div key={index} className="create-post-second-section__post-img__img">
												<div className="close-btn">
													<button type="button" onClick={() => discardPostImg(index)}>
														<img src={closeBtn} alt="close" />
													</button>
												</div>
												<img
													className="uploading-img"
													src={image.url}
													title={image.title}
													alt="post-img"
												/>
											</div>
										);
									})}
							</div>
							<div>
								<div className="icon loadFile-wrapper">
									<button type="button">
										<img src={uploadImgIcon} alt="upload" />
									</button>
									<input type="file" multiple onChange={(e) => selectPostImage(e)} />
								</div>
								<button type="submit">
									<div className="icon">
										<img src={sendIcon} alt="send" />
									</div>
								</button>
							</div>
						</div>
					</form>
				</div>
				<React.Fragment>
					{loading && <div className="no-posts">Loading...</div>}
					{!loading &&
						posts.length === 0 &&
						'No posts were found, try to make some friends & see their posts!'}
					{posts &&
						posts.map((post): JSX.Element => {
							return <PostComponent key={'mainPostsID' + post.post_id_main} {...post} />;
						})}
				</React.Fragment>
				{isFetching && !noPostLeft ? <div className="no-posts">Fetching more posts</div> : ''}
				{noPostLeft && posts.length !== 0 ? <div className="no-posts">No posts left</div> : ''}
			</div>
		</section>
	);
};

export default Main;
