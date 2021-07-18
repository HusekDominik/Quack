import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../allReducers';
import { ChatState } from '../../store/chat/types';
import { SystemState } from '../../store/system/types';
import { chatMessagesDateFunc } from "../../formatDate";
export interface ChatMessagesInterface {
	id: string;
	sender_id: string | number;
	message_text: string;
	message_img: string[];
	message_created_at: string;
	timestamps: string;
	firstConversationID : string | number;
}
 
const ChatMessages: React.FC<ChatMessagesInterface> = (props) => {


	const state: SystemState = useSelector((state: RootState) => state.isLogged);
	const chatState: ChatState = useSelector((state: RootState) => state.isChat);
	const { sender_id, message_text, message_img, message_created_at, firstConversationID } = props;

	let conversationID = chatState.conversation.conversationID === 0 ? firstConversationID : chatState.conversation.conversationID;

	let prefixClass = 'chat-container__content__friends-content__main__text';	

	return ( 
		<div>
			<li title={chatMessagesDateFunc(message_created_at)} className={state.id === sender_id ? prefixClass + '__mine' : prefixClass + '__their' }>
				{ message_text && <p>{message_text}</p> }

				<div>
					{ message_img.length > 0 ? message_img.map((fileURL, index) => {
						return <img key={index} crossOrigin="anonymous" src={`http://localhost:8000/chat_uploads/conversation-${conversationID}/${fileURL}`} alt="file"></img>
					}) : ''}
				</div>
			</li>
		</div> 
	);
}
 
export default ChatMessages;