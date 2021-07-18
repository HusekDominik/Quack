import express from 'express';
import cors from 'cors';
import { Server, Socket } from "socket.io";
import http from 'http';

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: `http://localhost:3000` }));
app.use('/uploads', express.static('uploads')); // když bude něco s /uploads tak to nahraje folder uploads
//app.use("/chat_uploads", express.static("chat_uploads"));
app.use("/chat_uploads", require("./routes/private-files"));

app.use('/user', require('./routes/user-route'));
app.use('/user/friends', require('./routes/friends'));
app.use('/email', require('./routes/email-route'));
app.use('/about/profile', require('./routes/aboutProfile'));
app.use('/forgotten', require('./routes/password-route'));
app.use('/post', require('./routes/post-route'));
app.use('/conversation', require("./routes/conversations"));
app.use("/message", require("./routes/message"));
app.use('/account', require('./routes/account'));


//////////////////////////////////////////// SOCKETS
const server = http.createServer(app);

const options = {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"]
	}
}
const io = new Server(server, options);

interface User {
	userID: string | number;
	socketID: string;
}
let users: User[] = [];

const addUserFunction = (userID: string | number, socketID: string): void => {
	// jestli už tam náhodou user neni -> po refreshu stránky aby se tam nedal znovu. 
	const findUser = users.some(user => user.userID === userID);
	if (findUser) return;
	users.push({ userID, socketID });
}
const removeUserFunction = (socketID: string): void => {
	users = users.filter((user) => user.socketID !== socketID);
}

const getUser = (userID: string | number) => {
	return users.find(user => user.userID === userID);
}

io.on('connection', (socket: Socket) => {

	// take userID and socketID from user :)
	socket.on("addUser", (userID: string | number) => {
		addUserFunction(userID, socket.id);
		io.emit("getUsers", users);
	})

	socket.on("sendMessage", ({ senderID, receiverID, text }) => {
		const user: any = getUser(receiverID);
		io.to(user?.socketID).emit("getMessage", {
			senderID,
			text
		})
	})

	//when disconnect
	socket.on('disconnect', () => {
		removeUserFunction(socket.id);
	});
});
//////////////////////////////////////////// SOCKETS

const PORT: number = parseInt(<string>process.env.PORT) || 5000;

server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
