import { ChatActionTypes, ChatState, CHAT_CLOSE, CHAT_OPEN, Message, CHANGE_CURRENT_CHAT, CurrentChatState, GET_CHAT_MESSAGES, ADD_CHAT_MESSAGE } from './types';

const isOpenChat = (messages: Message): ChatActionTypes => {
	return {
		type: CHAT_OPEN,
		payload: messages
	};
};
const isClosedChat = (): ChatActionTypes => {
	return {
		type: CHAT_CLOSE
	};
};

const changeChat = (conversation: CurrentChatState): ChatActionTypes => {
	return {
		type: CHANGE_CURRENT_CHAT,
		payload: conversation
	}
}

const getMessages = (messages: Message[]): ChatActionTypes => {
	return {
		type: GET_CHAT_MESSAGES,
		payload: messages
	}
}

const getFirstMessages = (messages: Message[]): ChatActionTypes => {
	return {
		type: GET_CHAT_MESSAGES,
		payload: messages
	}
}

const addMessage = (message: Message[]): ChatActionTypes => {
	return {
		type: ADD_CHAT_MESSAGE,
		payload: message
	}
}

export { isOpenChat, isClosedChat, changeChat, getMessages, addMessage, getFirstMessages };
