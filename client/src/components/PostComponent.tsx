import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileImgFunc } from '../ProfileImg';
import ColorThief from 'color-thief';
import { useSelector } from 'react-redux';
import heart from '../images/heart.png';
import comment from '../images/comment.png';
import writeComment from '../images/write.png';
import threeDots from '../images/dots.png';
import { useState } from 'react';
import { Slide } from 'react-slideshow-image';
import axios from 'axios';
import { RootState } from '../allReducers';
import { SystemState } from '../store/system/types';
import { formatDateFunc } from '../formatDate';
import CommentComponent from './CommentComponent';
import onClickOutside from './onClickOutside';

export interface PostComponentProps {
	post_id_main: string | number;
	user_id: string | number;
	firstname: string;
	username: string;
	lastname: string;
	email: string;
	author_id: string | number;
	gender: string;
	profile_img: string | null;
	createdat: string;
	likes: number;
	image: null | string | string[];
	description: String;
	deletePostFunction: Function;
}

const slideShowProperties = {
	autoplay: false,
	canSwipe: false
};

const PostComponent: React.FC<PostComponentProps> = (props: PostComponentProps) => {
	const state: any = useSelector((state: RootState) => state.isLogged);
	const commentMenuRef: any = React.createRef();
	const postMenu: any = React.createRef();
	const userPost: any = React.createRef();
	const aboutPostRef: any = React.createRef();

	const {
		post_id_main,
		user_id,
		username,
		firstname,
		author_id,
		lastname,
		profile_img,
		gender,
		createdat,
		description,
		image,
		likes,
		deletePostFunction
	} = props;

	const [ likeAmount, setLikeAmount ] = useState<any>(likes);
	const [ commentText, setCommentText ] = useState<any>('');
	const [ createdComments, setCreatedComments ] = useState<any>([]);
	const [ isLikedByMePost, setIsLikedByMePost ] = useState<boolean>(false);
	const [ areMoreComments, setAreMoreComments ] = useState<boolean>(true);
	const [ allCommentsLength, setAllcommendsLength ] = useState<number>(0);
	const [ commentAmount, setCommentAmount ] = useState<number>(0);
	const [ isMenuOpen, setMenuOpen ] = useState<boolean>(false);

	let profilePath = `/profile/search/${username}`;

	if (username === state.username) {
		profilePath = `/user/profile/${username}`;
	}

	useEffect(() => {
		const source = axios.CancelToken.source();
		const fetchComments = async () => {
			try {
				const config = {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${state.accessToken}`
					},
					cancelToken: source.token
				};

				const response = await axios.get(
					`http://localhost:8000/post/get/comments/${post_id_main}/${allCommentsLength}`,
					config
				);

				const data = response.data.comments;

				setCreatedComments(response.data.comments);

				if (data[1]) {
					setCreatedComments([ data[0], data[1] ]);
				}
				setCommentAmount(parseInt(response.data.commentAmount));
				setAllcommendsLength(response.data.comments.length);
				setLikeAmount(response.data.postLikes);
				setIsLikedByMePost(response.data.isLiked);
			} catch (error) {
				if (axios.isCancel(error)) {
					return;
				} else {
					return;
				}
			}
		};
		fetchComments();
		return () => {
			source.cancel();
		};
	}, []);

	onClickOutside(postMenu, () => setMenuOpen(false));

	const postCommentFunction = async (e) => {
		try {
			e.preventDefault();

			if (!commentText) {
				return;
			}

			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			const data = {
				commentText: commentText
			};

			const response = await axios.post(
				`http://localhost:8000/post/create/comment/${post_id_main}`,
				data,
				config
			);

			setCommentText('');
			setCreatedComments((prevArray) => [ ...prevArray, ...response.data.comment ]);

			setCommentAmount((prev) => prev + 1);
		} catch (error) {
			return;
		}
	};

	const likePostFunction = async (id) => {
		try {
			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			const likesObject = {
				likes: likes
			};

			const response = await axios.put(`http://localhost:8000/post/like/post/${id}`, likesObject, config);

			setLikeAmount(response.data.likes);
			setIsLikedByMePost((prev) => !prev);
		} catch (error) {
			return;
		}
	};

	const fetchMoreComments = async () => {
		try {
			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			const response = await axios.get(
				`http://localhost:8000/post/get/comments/${post_id_main}/${allCommentsLength - 1}`,
				config
			);

			if (response.data.comments.length < 3) {
				setAreMoreComments(false);
			}

			setCreatedComments((prev) => [ ...prev, ...response.data.comments ]);

			setAllcommendsLength((prev) => prev + response.data.comments.length);
			setLikeAmount(response.data.postLikes);
			setIsLikedByMePost(response.data.isLiked);
		} catch (error) {
			return;
		}
	};

	const showCommentMenu = () => {
		commentMenuRef.current.classList.toggle('active');
		aboutPostRef.current.classList.toggle('active');
	};

	const renderPostImgs = (images) => {
		if (images.length > 1) {
			return (
				<Slide easing="ease" {...slideShowProperties}>
					{images.map((img, index) => {
						return (
							<div className="each-slide" key={'post-image' + index}>
								<div className="user-post__post-img">{renderBasedOnSufix(img)}</div>
							</div>
						);
					})}
				</Slide>
			);
		} else if (images.length === 1) {
			return <div className="user-post__post-img">{renderBasedOnSufix(images[0])}</div>;
		} else {
			return '';
		}
	};

	const hidePostFunction = () => {
		userPost.current.style.display = 'none';
	};

	const renderBasedOnSufix = (img) => {
		const sufix = img.slice(img.indexOf('.')).toLowerCase();

		if (sufix === '.jpg' || sufix === '.jpeg' || sufix === '.png' || sufix === '.gif') {
			return (
				<img
					crossOrigin="anonymous"
					src={`http://localhost:8000/${img}`}
					alt="post"
					onLoad={(e) => {
						const image = e.target as HTMLImageElement;

						if (!image.parentElement) return;

						if (sufix === '.png') {
							image.parentElement.style.backgroundColor = '#fff';
							return;
						}
						const colorThief = new ColorThief();
						const result = colorThief.getColor(image, 40);
						image.parentElement.style.backgroundColor = `rgb(${result[0]}, ${result[1]}, ${result[2]} )`;
					}}
				/>
			);
		} else if (sufix === '.mp3') {
			return (
				<audio src={`http://localhost:8000/${img}`} controls>
					<source src={`http://localhost:8000/${img}`} type="audio/mpeg" />
				</audio>
			);
		} else if (sufix === '.mp4') {
			return <video src={`http://localhost:8000/${img}`} controls />;
		} else {
			return 'Error';
		}
	};

	return (
		<div ref={userPost} className="user-post middle-container">
			<div className="user-post__top">
				<div className="user-post__top__post-author">
					<Link className="user-post__top__post-author__link" to={profilePath}>
						<div className="user-post__top__post-author__link__img">
							<img src={profileImgFunc(profile_img, gender, false)} alt="profile" />
						</div>
					</Link>
					<div className="user-post__top__post-author__name">
						<h4>{firstname + ' ' + lastname}</h4>
						<p>{formatDateFunc(createdat)}</p>
					</div>
					<div className="user-post__top__post-author__menu-container">
						<img src={threeDots} alt="dots" onClick={() => setMenuOpen(true)} />
						{isMenuOpen && (
							<ul ref={postMenu}>
								<li>
									<button type="button" onClick={() => hidePostFunction()}>
										Hide
									</button>
								</li>
								{state.id === author_id && deletePostFunction ? (
									<li>
										<button type="button" onClick={() => deletePostFunction('post', post_id_main)}>
											Delete
										</button>
									</li>
								) : (
									''
								)}
							</ul>
						)}
					</div>
				</div>
				{description && (
					<div className="user-post__description">
						<p>{description}</p>
					</div>
				)}
			</div>
			{renderPostImgs(image)}
			<div ref={aboutPostRef} className="user-post__about-post">
				<div className="user-post__about-post__likes">
					<button
						className={isLikedByMePost ? 'liked' : ''}
						type="button"
						onClick={() => likePostFunction(post_id_main)}
					>
						<img src={heart} alt="heart" />
						<span>{likeAmount}</span>
					</button>
				</div>
				<div className="user-post__about-post__amount">
					<img src={comment} alt="comment" />
					<span> {commentAmount} Comments</span>
				</div>
				<button onClick={() => showCommentMenu()} className="user-post__about-post__comment">
					<img src={writeComment} alt="write" /> <span>Comment</span>
				</button>
			</div>
			<div className="user-post__comments-post">
				{createdComments &&
					createdComments.map((comment: any) => {
						return <CommentComponent key={comment.comment_id} {...comment} />;
					})}
				{allCommentsLength > 2 && areMoreComments ? (
					<div className="more-comments">
						<button className="more-comments__btn" type="button" onClick={() => fetchMoreComments()}>
							Show more comments
						</button>
					</div>
				) : (
					''
				)}
			</div>
			<div ref={commentMenuRef} className="user-post__comment-section">
				<form action="" onSubmit={postCommentFunction}>
					<textarea
						name=""
						id=""
						onChange={(e) => setCommentText(e.target.value)}
						cols={30}
						rows={10}
						placeholder="Write a comment..."
						spellCheck={true}
						value={commentText}
					/>
					<button type="submit">Send</button>
				</form>
			</div>
		</div>
	);
};

export default PostComponent;
