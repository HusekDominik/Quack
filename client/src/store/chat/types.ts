export const CHAT_OPEN = 'CHAT_OPEN';
export const CHAT_CLOSE = 'CHAT_CLOSE';
export const CHANGE_CURRENT_CHAT = 'CHANGE_CURRENT_CHAT';
export const GET_CHAT_MESSAGES = 'GET_CHAT_MESSAGES';
export const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';
export const GET_FIRST_MESSAGES = 'GET_FIRST_MESSAGES';

export interface ChatState {
	isActive: boolean;
	conversation: CurrentChatState;
	messages: Message[];
}

export interface Message {
	id: any;
	user: string;
	message: string;
	timestamp: number;
}

interface chatOpenAction {
	type: typeof CHAT_OPEN;
	payload: Message;
}

interface chatCloseAction {
	type: typeof CHAT_CLOSE;
}

export interface CurrentChatState {
	conversationID: number
	conversationName: string;
	conversationImg: string;
	conversationGender: string;
	conversationUsername: string;

}

interface ChangeConversationAction {
	type: typeof CHANGE_CURRENT_CHAT;
	payload: CurrentChatState;
}

interface getMessagesAction {
	type: typeof GET_CHAT_MESSAGES;
	payload: Message[];
}
interface getFirstMessagesAction {
	type: typeof GET_FIRST_MESSAGES;
	payload: Message[]
}

interface addMessagesAction {
	type: typeof ADD_CHAT_MESSAGE;
	payload: Message[];
}

export type ChatActionTypes = chatOpenAction | chatCloseAction | ChangeConversationAction | getMessagesAction | addMessagesAction | getFirstMessagesAction;
