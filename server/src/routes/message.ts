import * as express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../database/connect";
import protectedByToken from '../token/getAcessToken';
import { v4 as uuidv4 } from 'uuid';
import redisClient from "../redis/client";

const MESSAGES_EXPIRATION = 3600;

const router = express.Router();

const storage = multer.diskStorage({
	destination: './temp_uploads/',
	filename: function (_, file, callback) {
		callback(null, file.fieldname + Date.now() + uuidv4() + path.extname(file.originalname));
	}
});

const uploadMultiple: any = multer({
	storage: storage,
	fileFilter: function (_, file, callback) {
		let ext = path.extname(file.originalname).toLowerCase();

		if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.mp3' && ext !== '.mp4' && ext !== '.jpeg') {
			return callback(new Error('Invalid format'));
		}
		callback(null, true);
	}
});

/**
 * @keyword POST - ADDS new message
 * @description adds new message into conversation
 * @route /message/add
 *
 */

router.post("/add", protectedByToken, uploadMultiple.array('chat_file', 10), async (req: any, res: express.Response): Promise<express.Response> => {
	try {

		let { conversationID, senderID, messageText } = req.body;

		if (!messageText && req.files.length === 0) {
			return res.status(400);
		}

		const uploadedImg = req.files;


		if (!messageText) {
			messageText = null;
		}

		console.log(uploadedImg);
		const onlyPath = uploadedImg.map((element) => element.filename);

		if (req.files.length > 0) {


			const conversationFolder = path.join(__dirname, `../../chat_uploads/conversation-${conversationID}`);

			if (!fs.existsSync(conversationFolder)) {
				fs.mkdir(conversationFolder, (error) => {
					if (error) throw error;
				});

			}

			for (let i = 0; i < req.files.length; i++) {
				try {
					fs.renameSync(path.join(__dirname, `../../temp_uploads/${req.files[i].filename}`), `${conversationFolder}/${req.files[i].filename}`);
				}
				catch (error) {
					console.log(error);
					throw error;
				}


			}
		}

		await pool.query("UPDATE conversation SET updated_at = now() WHERE id = $1", [conversationID]);
		const message = await pool.query("INSERT INTO chat_message(conversation_id, sender_id, message_text, message_img) VALUES ($1, $2, $3, $4) RETURNING *", [conversationID, senderID, messageText, onlyPath]);


		redisClient.llen(`messages-${conversationID}`, (error, number) => {
			if (error) console.error(error);
			if (number === 20) redisClient.rpop(`messages-${conversationID}`);
		})

		redisClient.lpush(`messages-${conversationID}`, JSON.stringify(message.rows));
		return res.status(200).json({
			message: message.rows

		})
	}
	catch (error) {
		console.log(error);
		return res.status(500).json({
			error
		})
	}
})


/**
 * @keyword GET - FETCH MORE MESSAGES
 * @description fetches more messages from conversation
 * @route /message/get/
 * @param conversationID = "conversationID to which we are going to fetch more messages"
 * @param skipAmount = "amount of how many messages we already have - so we skip them"
 */

router.get("/get/:conversationID/:skipAmount", protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {

		const conversationID = req.params.conversationID;

		const messages = await pool.query("SELECT * FROM chat_message WHERE conversation_id = $1 ORDER BY message_created_at DESC LIMIT 15 OFFSET $2", [conversationID, req.params.skipAmount]);

		const correctOrderMessages = messages.rows.reverse();

		return res.status(200).json({
			messages: correctOrderMessages
		})
	}
	catch (error) {
		console.log(error);
		return res.status(500).json({
			error
		})
	}
})


/**
 * @keyword GET - FETCH FIRST MESSAGES
 * @description fetches first 20 messages from conversation
 * @route /message/first/messages/
 * @param conversationID = "conversationID to which we are going to fetch more messages"
 */

router.get("/first/messages/:conversationID", protectedByToken, async (req: any, res: express.Response) => {
	try {
		const conversationID = req.params.conversationID;

		redisClient.lrange(`messages-${conversationID}`, 0, -1, async (error, data: any) => {
			if (error) return res.status(500).send('Error');

			console.log(data);
			if (data.length > 0) {
				return res.status(200).json({
					messages: JSON.parse(data[0])
				})
			}
			else {

				const messages = await pool.query("SELECT * FROM chat_message WHERE conversation_id = $1 ORDER BY message_created_at DESC LIMIT 20", [conversationID]);

				const correctOrderMessages = messages.rows.reverse();

				console.log(messages.rows);

				redisClient.lpush(`messages-${conversationID}`, JSON.stringify(correctOrderMessages));

				return res.status(200).json({
					messages: correctOrderMessages
				})
			}

		})

	}
	catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Server error'
		})
	}
})
export = router;

