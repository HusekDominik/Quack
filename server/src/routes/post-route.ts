import * as express from "express"
import multer from 'multer';
import path from 'path';
import protectedByToken from '../token/getAcessToken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database/connect';

import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
	destination: './uploads/',
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
 * @keyword GET - POSTS MAIN PAGE
 * @description gets all posts on MAIN PAGE (by friends)
 * @route post
 * @param skipAmount - checks how many posts are already rendered (skips the amount)
 */

router.get('/get/all/:skipAmount', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		let userID = req.user.id;

		const usersIDs: number[] = [];

		const skipAmount = req.params.skipAmount;

		const friends = await pool.query(
			'SELECT user_one_id, user_two_id FROM relationships WHERE (user_one_id = $1 OR user_two_id = $2) AND friendship_status = $3',
			[userID, userID, 'Accepted']
		);

		for (let i = 0; i < friends.rows.length; i++) {
			if (friends.rows[i].user_one_id === req.user.id) {
				usersIDs.push(friends.rows[i].user_two_id);
			} else {
				usersIDs.push(friends.rows[i].user_one_id);
			}
		}

		const users = await pool.query(
			'SELECT username, firstname, lastname, gender, profile_img, profile_background_img, author_id, description, image, posts.id AS post_id_main, posts.createdat FROM users JOIN posts ON author_id = users.id WHERE users.id = ANY($1) ORDER BY posts.createdat DESC LIMIT $2 OFFSET $3',
			[usersIDs, 5, skipAmount]
		);

		return res.status(200).json({
			posts: users.rows
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

/**
 * @keyword POST - POSTS CREATE
 * @description CAN CREATE POSTS ON MAIN PAGE
 * @route post
 */

router.post(
	'/add/multiple',
	protectedByToken,
	uploadMultiple.array('images', 5),
	async (req: any, res: express.Response): Promise<express.Response> => {
		try {
			let { description } = req.body;

			if (!description && req.files.length === 0) {
				return res.status(400);
			}

			const userID = req.user.id;
			const uploadedImg = req.files;


			if (!description) {
				description = null;
			}

			const onlyPath = uploadedImg.map((element) => element.path);

			await pool.query('INSERT INTO posts(author_id, description, image) VALUES ($1, $2, $3)', [
				userID,
				description,
				onlyPath
			]);

			return res.status(200).json({
				success: true
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				error: 'Server error'
			});
		}
	}
);

/**
 * @keyword DELETE - DELETE POSTS
 * @description DELETES CREATED POSTS (doesn't work currently)
 * @route post
 */

router.delete('/delete/:postID', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const postID = req.params.postID;

		const deletingUser = await pool.query('DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING image', [
			postID,
			req.user.id
		]);

		if (deletingUser.rows[0].image.length > 0) {
			for (let i = 0; i < deletingUser.rows[0].image.length; i++) {
				fs.unlink(deletingUser.rows[0].image[i], (err) => {
					if (err) return;
				});
			}
		}

		return res.status(200).json({
			success: true
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

/**
 * @keyword PUT - LIKE POSTS
 * @description CAN LIKE / UNLIKE POSTS
 * @route post
 * @param id - post ID
 */

router.put('/like/post/:id', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const postID = req.params.id;

		const userID = req.user.id;

		const checkIfExists = await pool.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [
			postID,
			userID
		]);

		if (!checkIfExists.rows[0]) {
			await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postID, userID]);
		} else if (checkIfExists.rows[0]) {
			await pool.query('DELETE FROM post_Likes WHERE user_id = $1 AND post_id = $2', [userID, postID]);
		}
		const postLikes = await pool.query('SELECT COUNT(*) FROM post_likes WHERE post_id = $1', [postID]);

		return res.status(200).json({
			likes: postLikes.rows[0].count
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false
		});
	}
});

/**
 * @keyword POST - COMMENT POSTS
 * @description CAN CREATE COMMENT 
 * @route post
 * @param id - POST ID
 */

router.post('/create/comment/:id', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const postID = req.params.id;

		const userID = req.user.id;

		const { commentText } = req.body;

		const comment = await pool.query(
			'INSERT INTO comments (comment_author_id, post_recipient_id, parent_comment, comment_text) VALUES ($1, $2, $3, $4) RETURNING comments.id AS comment_id, comment_author_id, post_recipient_id, parent_comment, comment_text, created_at_comment',
			[userID, postID, null, commentText]
		);

		const user = await pool.query(
			'SELECT id,  username, firstname, lastname, gender, profile_img FROM users WHERE users.id = $1',
			[userID]
		);

		const userComment = comment.rows.map((item, i) => Object.assign({}, item, user.rows[i]));

		return res.status(200).json({
			comment: userComment
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false
		});
	}
});

/**
 * @keyword GET COMMENT POSTS
 * @description GETS POST COMMENTS BUT ALSO POST LIKES (COMMENT LIKES IN PROGRESS)
 * @route post
 * @param id - POST ID
 */

router.get('/get/comments/:id/:skipAmount', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const postID = req.params.id;
		const skipAmount = req.params.skipAmount;

		let isLikedByMe = false;

		const postComments: any = await pool.query(
			'SELECT comments.id AS comment_id, post_recipient_id, username, firstname, lastname, profile_img, comment_text, gender, created_at_comment FROM comments JOIN users ON comment_author_id = users.id WHERE post_recipient_id = $1 ORDER BY comments.created_at_comment DESC LIMIT $2 OFFSET $3',
			[postID, 3, skipAmount]
		);

		const postCommentsAllAmount = await pool.query('SELECT COUNT(*) FROM comments WHERE post_recipient_id = $1', [
			postID
		]);

		const postLikes = await pool.query('SELECT COUNT(*) FROM post_likes WHERE post_id = $1', [postID]);
		const isLiked = await pool.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [
			postID,
			req.user.id
		]);

		if (isLiked.rows[0]) {
			isLikedByMe = true;
		}

		return res.status(200).json({
			comments: postComments.rows,
			postLikes: postLikes.rows[0].count,
			commentAmount: postCommentsAllAmount.rows[0].count,
			isLiked: isLikedByMe
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false
		});
	}
});

export = router;
