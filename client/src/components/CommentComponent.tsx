import React from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '../allReducers';
import { formatCommentDateFunc } from '../formatDate';
import { profileImgFunc } from '../ProfileImg';
import { useSelector } from 'react-redux';
import { SystemState } from '../store/system/types';

export interface CommentComponentProps {
	username: string;
	firstname: string;
	lastname: string;
	gender: string;
	created_at_comment: string;
	comment_text: string;
	profile_img: string;
}

const CommentComponent: React.FC<CommentComponentProps> = (props) => {
	const state: SystemState = useSelector((state: RootState) => state.isLogged);
	const { username, profile_img, gender, created_at_comment, firstname, lastname, comment_text } = props;

	let path = `/profile/search/${username}`;

	if (username === state.username) {
		path = `/user/profile/${username}`;
	}

	return (
		<div className="post-comment">
			<div className="post-comment__container">
				<div className="post-comment__container__img">
					<Link to={path}>
						<img src={profileImgFunc(profile_img, gender, false)} alt="profileimg" />
					</Link>
				</div>
				<p>{formatCommentDateFunc(created_at_comment)}</p>
			</div>

			<div className="post-comment__content">
				<Link to={path}>
					<h2>{firstname + ' ' + lastname}</h2>
				</Link>
				<p>{comment_text}</p>
			</div>
		</div>
	);
};

export default CommentComponent;
