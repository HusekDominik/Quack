import * as express from "express";
import pool from "../database/connect";
import protectedByToken from '../token/getAcessToken'

const router = express.Router();

/**
 * @keyword POST - creates new conversation
 * @description creates new conversation between users
 * @route /conversation/create
 *
 */

router.post("/create", protectedByToken, async (req, res: express.Response): Promise<express.Response> => {
	try {
		const { senderID, receiverID } = req.body;

		await pool.query("INSERT INTO conversation (receiver_id, sender_id) VALUES ($1, $2)", [receiverID, senderID]);


		return res.status(200).json({
			success: true
		})
	}

	catch (error) {
		console.log(error);
		return res.status(500).json({ error })
	}
})

/**
 * @keyword GET - Gets all conversations
 * @description Gets all conversations of logged user
 * @route /conversation/get
 * @param userID - user's ID
 *
 */

router.get("/get/:userID/:skip", protectedByToken, async (req, res: express.Response): Promise<express.Response> => {
	try {

		const userID = req.params.userID;
		const skip = req.params.skip;

		const conversationsArray: any = [];
		const usersArray: any = [];

		const conversations = await pool.query("SELECT id as conversation_id, receiver_id, sender_id, updated_at FROM conversation WHERE receiver_id = $1 OR sender_id = $1 ORDER BY updated_at DESC LIMIT 20 OFFSET $2", [userID, skip]);

		console.log(conversations.rows, "KONVERZACEEEEEEEEEE");

		if (!conversations.rows) {
			return res.status(200).json({
				conversation: ''
			})
		}



		for (let i = 0; i < conversations.rows.length; i++) {

			const conversation = conversations.rows[i];

			if (conversation.receiver_id === parseInt(userID)) {
				conversationsArray.push({ conversationID: conversation.conversation_id, user: conversation.sender_id });
				usersArray.push(conversation.sender_id);
			}
			else if (conversation.sender_id === parseInt(userID)) {
				conversationsArray.push({ conversationID: conversation.conversation_id, user: conversation.receiver_id });
				usersArray.push(conversation.receiver_id);

			}
		}


		const users = await pool.query("SELECT id, username, firstname, lastname, profile_img, gender FROM users WHERE id = ANY($1)", [usersArray]);


		for (let x = 0; x < conversationsArray.length; x++) {

			for (let z = 0; z < users.rows.length; z++) {

				if (conversationsArray[x].user === users.rows[z].id) {
					conversationsArray[x].user = users.rows[z];
				}
			}
		}



		return res.status(200).json({
			conversations: conversationsArray
		})
	}
	catch (error) {
		console.log(error);
		return res.status(500).json(error);
	}

})

export = router;