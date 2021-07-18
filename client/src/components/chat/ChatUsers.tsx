import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../allReducers';
import { profileImgFunc } from '../../ProfileImg';
import { ChatState } from '../../store/chat/types';
export interface ChatUsersInterface {
	conversationID: number;
	user: {
		id: number;
		username: string;
		firstname: string;
		lastname: string;
		profile_img: string;
		gender: string;


	}
}
 
const ChatUsers: React.FC<ChatUsersInterface> = (props) => {
	const dispatch = useDispatch();

	const chat: ChatState = useSelector((state: RootState) => state.isChat);


	const {conversationID, user} = props;

	const getIDFunc = (conversationID: number) => {
		const conversationName = `${user.firstname} ${user.lastname}`;
		if(conversationID === chat.conversation.conversationID) return;
		dispatch({type: 'CHANGE_CURRENT_CHAT', payload: {conversationID, conversationUsername: user.username, conversationName, conversationImg: user.profile_img, conversationGender: user.gender} });


	}

	return ( 
		<li onClick={() => getIDFunc(conversationID)}>
			<div>
				<img src={profileImgFunc(user.profile_img, user.gender, false)} alt="user" />
			</div>
			<span>
				{`${user.firstname} ${user.lastname}`}
			</span>
		</li>
	);
}
 
export default ChatUsers;