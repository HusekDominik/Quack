import { ChatState, ChatActionTypes, CHAT_CLOSE, CHAT_OPEN, CHANGE_CURRENT_CHAT, GET_CHAT_MESSAGES, ADD_CHAT_MESSAGE, GET_FIRST_MESSAGES } from './types';

const initialState: ChatState = {
	isActive: false,
	conversation: {
		conversationID: 0,
		conversationName: '',
		conversationImg: '',
		conversationGender: '',
		conversationUsername: ''
	},
	messages: [],

};

const isChatIn = (state = initialState, action: ChatActionTypes) => {
	switch (action.type) {
		case CHAT_OPEN:
			return {
				...state,
				isActive: true,
				messages: action.payload.message
			};

		case CHAT_CLOSE:
			return {
				...state,
				isActive: false
			};
		case CHANGE_CURRENT_CHAT:
			return {
				...state,
				conversation: {
					conversationID: action.payload.conversationID,
					conversationName: action.payload.conversationName,
					conversationImg: action.payload.conversationImg,
					conversationGender: action.payload.conversationGender,
					conversationUsername: action.payload.conversationUsername
				},
				messages: []
			}

		case GET_CHAT_MESSAGES:
			return {
				...state,
				messages: [...action.payload, ...state.messages]
			}

		case GET_FIRST_MESSAGES:
			return {
				...state,
				messages: action.payload
			}

		case ADD_CHAT_MESSAGE:
			return {
				...state,
				messages: [...state.messages, ...action.payload]

			}

		default:
			return state;
	}
};

export default isChatIn;
