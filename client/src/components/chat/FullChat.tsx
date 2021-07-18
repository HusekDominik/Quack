import React from 'react';

import Chat from './Chat';

export interface FullChatProps {
	
}
 
const FullChat: React.FC<FullChatProps> = () => {
	return ( 
		<Chat fullScreen={true}></Chat>
	 );
}
 
export default FullChat;