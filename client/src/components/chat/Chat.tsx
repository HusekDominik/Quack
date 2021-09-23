import React, { useEffect, useRef, useState } from 'react';
import chatIcon from '../../images/chat.png';
import minimizeIcon from '../../images/minimize.png';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../allReducers';
import { SystemState } from '../../store/system/types';
import profileImgMale from '../../images/profile-Male.jpg';
import paperClip from '../../images/paper-clip.png';
import mp3Icon from '../../images/mp3-audio-file.png';
import { Link } from 'react-router-dom';
import mp4Icon from '../../images/mp4-video.png';
import sendButtonIcon from '../../images/messages.png';
import axios from 'axios';
import ChatUsers from './ChatUsers';
import { ChatState } from '../../store/chat/types';
import { profileImgFunc } from '../../ProfileImg';
import RenderChatMessage from './ChatMessages';
import closeBtn from '../../images/close.png';
import { io } from "socket.io-client";

export interface ChatProps {
	fullScreen: boolean
}

const Chat: React.FC<ChatProps> = (props: ChatProps) => {
	const state: SystemState = useSelector((state: RootState) => state.isLogged);
	const chatState: ChatState = useSelector((state: RootState) =>  state.isChat);

	const messageEndRef = useRef<any>('');


	const [loading, setLoading ] = useState(true);

	const chatContainer: any = React.createRef();
	const chatContent: any = React.createRef();
	const [ image, setImage ] = useState<string[]>([]);
	const [ imageURL, setImageURL ] = useState<any[]>([]);
	const [ error, setError ] = useState<string>();
	const [chatIDState, setChatIDState] = useState<number>(0);
	const [loadingMoreMessages, setLoadingMoreMessages] = useState<boolean>(false);

	const [ currentChatUser, setCurrentChatUser ] = useState<string>();
	const [conversations, setConversations] = useState<any>([]);
	const [skipFetchedUsers, setSkipFetchedUsers] = useState<number>(0);
	const [fetchingMoreMessages, setFetchingMoreMessages] = useState<boolean>(false);
	const [noMoreMessages, setNoMoreMessages] = useState<boolean>(false);

	const [arrivalMessage, setArrivalMessage] = useState<any>(null);
	const [chatMessages, setChatMessages] = useState<number>(0);
	const [messageText, setMessageText] = useState('');

	const socket = useRef<any>(null);

	const dispatch = useDispatch();

	const minimizeChat = () => {
		chatContainer.current.classList.toggle('active');
		chatContent.current.classList.toggle('open');
	};

	useEffect(() => {
		socket.current = io("ws://localhost:8000");
		socket.current.on("getMessage", data => {

		})
	}, [])

	useEffect(() => {
		if(!arrivalMessage) return;
		dispatch({type: 'ADD_CHAT_MESSAGE', payload: arrivalMessage})
	}, [arrivalMessage])

	useEffect(() => {
		if(!state.id) return;
		
		socket.current.on("welcome", message => {
			console.log(message);
		})
		socket.current.emit("addUser", state.id);
		socket.current.on("getUsers", (users) => {
			console.log(users, "connected users")
		})
	}, [state])


	useEffect(() => {
		const source = axios.CancelToken.source();

		const callAsyncFunc = async() => {
			try {
				if(state.id){
					const config = {

					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${state.accessToken}`
					},
					cancelToken: source.token
				}

					const conversations : any = await axios.get(`http://localhost:8000/conversation/get/${state.id}/${skipFetchedUsers}`, config);

					console.log(conversations.data.conversations[0]);

					if(conversations.data.conversations.length > 0){
						setConversations((prev) => [...prev, ...conversations.data.conversations]);
					}
				}				
				
			}
			catch(error){
				if(axios.isCancel(error)){
					return;
				}
				console.log(error);
			}
		}

		callAsyncFunc();

		return () => {
			source.cancel();
		}
	}, [state.id, state.accessToken]);


	useEffect(() => {
		const source = axios.CancelToken.source();	
		setLoading(true);
		const fetchMessagesAsync = async() => {
			try {
				
				if(chatState.conversation.conversationID > 0 || conversations[0]?.conversationID){
					
					let chatID = chatState.conversation.conversationID;

					if(chatID === 0){
						chatID = conversations[0].conversationID;
					}

					if(chatID === chatIDState){
						setLoading(false);
						return;
					}

					const config = {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${state.accessToken}`
							
						},
						cancelToken: source.token
					}

					const response = await axios.get(`http://localhost:8000/message/first/messages/${chatID}`, config);

					
					response.data.messages.length < 20 ? setNoMoreMessages(true) : setNoMoreMessages(false);
					setChatIDState(chatID);
					setChatMessages(response.data.messages.length);
					dispatch({type: 'GET_FIRST_MESSAGES', payload: response.data.messages});
					setLoading(false);
				}
			}
			catch(error){
				if(axios.isCancel(error)){
					return;
				}
				console.log(error);
				return;
			}
		}
		fetchMessagesAsync();
		return () => {
			source.cancel();
		}
	}, [chatState.conversation, state.accessToken, conversations]);

	
	useEffect(() => {
		const source = axios.CancelToken.source();
		const fetchMoreMessages = async() => {
			try {
				if(fetchingMoreMessages && !noMoreMessages){

					const config = {

						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${state.accessToken}`
							
						},
						cancelToken: source.token
					}

					let chatID = chatState.conversation.conversationID;

					if(chatID === 0){
						chatID = conversations[0].conversationID;
					}

					const response = await axios.get(`http://localhost:8000/message/get/${chatID}/${chatMessages}`, config);

					setChatMessages((prev: number) => prev + response.data.messages.length);
					setFetchingMoreMessages(false);
					dispatch({type: 'GET_CHAT_MESSAGES', payload: response.data.messages})

					if(response.data.messages.length < 15){
						setNoMoreMessages(true);
					}

					setLoadingMoreMessages(false);
				}
				
			}
			catch(error){
				if(axios.isCancel(error)){
					return;
				}
				console.log(error);
			}
		}
	
		fetchMoreMessages();

		return () => {
			source.cancel();
		}
	}, [fetchingMoreMessages, state.accessToken])

	useEffect(() => {
		console.log(chatMessages);
		
		//	scrollToBottomFunc();
	}, [chatMessages])

	const chatScrollToTop = (e) => {
		
		if(e.target.scrollTop === 0 && !noMoreMessages){
			console.log("fetch more");
			setLoadingMoreMessages(true);
			setFetchingMoreMessages(true);
		}
	}


	const scrollToBottomFunc = () => {
		messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
	}

	const discardPostImg = (id) => {
		imageURL.splice(id, 1);
		image.splice(id, 1);

		setImageURL((prev) => prev.filter((img) => img != id));
		setImage((prev) => prev.filter((img) => img != id));
	};

	const firstLoadedUser = () => {
		if(chatState.conversation.conversationName === '' && chatState.conversation.conversationID === 0){
			return (
				<React.Fragment>
					<div>
						<Link to={`/profile/search/${conversations[0].user.username}`}>
							<img src={profileImgFunc(conversations[0]?.user.profile_img, conversations[0]?.user.gender, false)} alt="profile-pic" />
						</Link>
					
					</div>
					<span> {`${conversations[0].user.firstname} ${conversations[0].user.lastname}`}</span>
				</React.Fragment>
			)
		}
		else {
			return ( 
				<React.Fragment>
					<div>
						<Link to={`/profile/search/${chatState.conversation.conversationUsername}`}>	
							<img src={profileImgFunc(chatState.conversation.conversationImg, chatState.conversation.conversationGender, false)} alt="profile-pic" />
						</Link>
					</div>
					<span> {chatState.conversation.conversationName}</span>
				</React.Fragment>
			)
		}
	}

	
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

	

	const sendMessage = async(e) => {
		try {
			e.preventDefault();
			
			const config = {
				headers: {
					Authorization: `Bearer ${state.accessToken}`
				}
			};
			let sendFormData;


			let conversationID = chatState.conversation.conversationID;

			if(conversationID === 0){
				conversationID = conversations[0].conversationID
			}


			if (!image && !messageText) {
				return;
			}


			sendFormData = new FormData();
			for (const file of image) {
				sendFormData.append('chat_file', file);
			}
			if (messageText) {
				sendFormData.append('messageText', messageText);
			}

			sendFormData.append('conversationID', conversationID);
			sendFormData.append('senderID', state.id)

			const response = await axios.post(`http://localhost:8000/message/add`, sendFormData, config);


			//socket.current.emit("sendMessage", { senderID: state.id, receiverID:  })
			dispatch({type: 'ADD_CHAT_MESSAGE', payload: response.data.message});
			setImageURL([]);
			setImage([]);
			setMessageText('');
		}
		catch(error){
			console.log(error);
			
		}
	}
	return (
		<div className={props.fullScreen ? 'chat-container full' : 'chat-container'}ref={chatContainer}>
			<div className="chat-container__header">
				<span>
					<img src={chatIcon} alt="chat" /> {state.firstname + ' ' + state.lastname}
				</span>
				{!props.fullScreen && 
				<button type="button" onClick={() => minimizeChat()}>
					<img src={minimizeIcon} alt="minimize" />
				</button>}
			</div>
			<div className="chat-container__content" ref={chatContent}>
				<div className="chat-container__content__current">
					{conversations.length > 0 && firstLoadedUser()}
					<div className="chat-container__content__current__menu">
						menu
					</div>
					
				</div>
				<div className="chat-container__content__friends-content">
					<ul className="chat-container__content__friends-content__friends-menu">
						{ conversations && conversations.map((conversation) => {
							return <ChatUsers key={conversation.conversationID} {...conversation}></ChatUsers>
						})}
					</ul>
					<div className="chat-container__content__friends-content__main">
						<div className="chat-container__content__friends-content__main__text" onScroll={chatScrollToTop}>
							{loadingMoreMessages ? <p style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem'}}>Loading...</p> : ''}
							
							{chatState.messages.length > 0 && conversations[0] ? chatState.messages.map((message: any) => {
								 return <RenderChatMessage firstConversationID={conversations[0].conversationID} key={`${message.id}`} {...message}></RenderChatMessage>
							}) : ''}
							
							{loading ? <p style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem'}}>Loading...</p> : ''}
							{chatMessages === 0 && !loading ? <p style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem'}}>You're now connected on Quack!</p> : ''}
							<div ref={messageEndRef}></div>
						</div>
						<div className="chat-container__content__friends-content__main__send-container">
							<div className="chat-container__content__friends-content__main__send-container__files">
							{imageURL &&
									imageURL.map((image, index) => {
										return (
											<div key={index} className="chat-container__content__friends-content__main__send-container__files__img">
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
							<form onSubmit={sendMessage}  method="POST" encType="multipart/form-data" className='chat-container__content__friends-content__main__send-container__form'>
								<div className="chat-container__content__friends-content__main__send-container__form__upload">
									<button type="button">
										<img src={paperClip} alt="upload" />
									</button>
									<input type="file" multiple onChange={(e) => selectPostImage(e)} />
								</div>
								<input onChange={(e) => setMessageText(e.target.value)} value={messageText} type="text" placeholder="Type a message..." />
								<button className="send" type="submit">
									<img src={sendButtonIcon} alt="send" />
								</button>
							</form>
						</div>
					</div>
					{props.fullScreen && 
					
					<div className='chat-container__content__friends-content__right-panel'>
						<h2>Online users:</h2>
						<ul>dada</ul>
					</div>
					
					}
				</div>
			</div>
		</div>
	);
};

export default Chat;
