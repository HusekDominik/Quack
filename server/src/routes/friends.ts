import * as express from 'express';
import pool from '../database/connect';
import protectedByToken from '../token/getAcessToken';

const router = express.Router();

/**
 * @keyword POST - ADD USER
 * @description Request adding user & sends notification to other user that someone want's to add him
 * @route /user/friends
 *
 */

router.post('/add', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const { profileID } = req.body;

		let userWithSmallID = req.user.id;
		let userWithBigID = profileID;

		if (req.user.id > profileID) {
			userWithSmallID = profileID;
			userWithBigID = req.user.id;
		}

		await pool.query(
			'INSERT INTO relationships (user_one_id, user_two_id, friendship_status, action_user_id) VALUES ($1, $2, $3, $4)',
			[ userWithSmallID, userWithBigID, 'Pending', req.user.id ]
		);

		await pool.query('INSERT INTO notifications (user_id, requester_id, notification_status) VALUES ($1, $2, $3)', [
			profileID,
			req.user.id,
			1
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
});

/**
 * @keyword PUT - ACCEPT FRIEND REQUEST
 * @description accepts friend request
 * @route /user/friends
 *
 */

router.put('/accept', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const { profileID } = req.body;

		let userWithSmallID = req.user.id;
		let userWithBigID = profileID;

		if (req.user.id > profileID) {
			userWithSmallID = profileID;
			userWithBigID = req.user.id;
		}

		await pool.query(
			'UPDATE relationships SET friendship_status = $1, action_user_id = $2 WHERE user_one_id = $3 AND user_two_id = $4',
			[ 'Accepted', req.user.id, userWithSmallID, userWithBigID ]
		);

		await pool.query('INSERT INTO notifications (user_id, requester_id, notification_status) VALUES ($1, $2, $3)', [
			profileID,
			req.user.id,
			2
		]);

		await pool.query("INSERT INTO conversation (receiver_id, sender_id) VALUES ($1, $2)", [req.user.id, profileID]);

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
 * @keyword DELETE - DELETES FRIEND REQUEST
 * @description Declines user's friend request
 * @route /user/friends
 * @param userID - user's ID (to know which user is getting declined)
 *
 */

router.delete('/decline/:userID', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const profileID = req.params.userID;

		let userWithSmallID = req.user.id;
		let userWithBigID = req.params.userID;

		if (req.user.id > profileID) {
			userWithSmallID = profileID;
			userWithBigID = req.user.id;
		}

		await pool.query('DELETE FROM relationships WHERE user_one_id = $1 AND user_two_id = $2', [
			userWithSmallID,
			userWithBigID
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
});

/**
 * @keyword PUT - BLOCK USER
 * @description blocks user
 * @route /user/friends
 * 
 */

router.put('/blocked', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const { profileID } = req.body;

		let userWithSmallID = req.user.id;
		let userWithBigID = profileID;

		if (req.user.id > profileID) {
			userWithSmallID = profileID;
			userWithBigID = req.user.id;
		}

		await pool.query(
			'UPDATE relationships SET friendship_status = $1, action_user_id = $2 WHERE user_one_id = $3 AND user_two_id = $4',
			[ 'Blocked', req.user.id, userWithSmallID, userWithBigID ]
		);

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
 * @keyword DELETE - REMOVE FRIEND
 * @description Removes friend from friendlist
 * @route /user/friends
 *
 */

router.delete('/remove', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const { profileID } = req.body;

		let userWithSmallID = req.user.id;
		let userWithBigID = profileID;

		if (req.user.id > profileID) {
			userWithSmallID = profileID;
			userWithBigID = req.user.id;
		}

		await pool.query('DELETE FROM relationships WHERE user_one_id = $1 AND user_two_id = $2', [
			userWithSmallID,
			userWithBigID
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
});

/**
 * @keyword GET - GET ALL FRIENDS
 * @description gets all
 * @route /user/friends
 *
 */

router.get('/get/friends', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		let userID = req.user.id;
		const usersIDs: number[] = [];

		const friends = await pool.query(
			'SELECT user_one_id, user_two_id FROM relationships WHERE (user_one_id = $1 OR user_two_id = $2) AND friendship_status = $3',
			[ userID, userID, 'Accepted' ]
		);

		const users = friends.rows;

		for (let i = 0; i < users.length; i++) {
			if (users[i].user_one_id === req.user.id) {
				usersIDs.push(users[i].user_two_id);
			} else {
				usersIDs.push(users[i].user_one_id);
			}
		}

		const foundUsers = await pool.query(
			'SELECT id, username, firstname, lastname, email, profile_img, gender FROM users WHERE id = ANY($1)',
			[ usersIDs ]
		);

		return res.status(200).json({
			friends: foundUsers.rows
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

/**
 * @keyword GET - GET ALL FRIENDS REQUESTS
 * @description gets all users that requested adding us
 * @route /user/friends
 *
 */

router.get('/get/requested/all', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		let userID = req.user.id;
		const usersIDs: number[] = [];

		const requests = await pool.query(
			'SELECT user_one_id, user_two_id FROM relationships WHERE (user_one_id = $1 OR user_two_id = $2) AND friendship_status = $3 AND action_user_id != $4 ORDER BY createdat DESC',
			[ userID, userID, 'Pending', userID ]
		);

		const users = requests.rows;

		for (let i = 0; i < users.length; i++) {
			if (users[i].user_one_id === req.user.id) {
				usersIDs.push(users[i].user_two_id);
			} else {
				usersIDs.push(users[i].user_one_id);
			}
		}

		if (usersIDs.length === 0) {
			return res.status(200).json({
				users: []
			});
		}

		const foundUsers = await pool.query(
			'SELECT users.id AS user_main_id, username, firstname, lastname, email, profile_img, gender, relationships.createdat AS created_at_relationship FROM users JOIN relationships ON users.id = action_user_id  WHERE action_user_id = ANY($1) AND (user_one_id = $2 OR user_two_id = $3) ORDER BY relationships.createdat DESC',
			[ usersIDs, userID, userID ]
		);

		return res.status(200).json({
			users: foundUsers.rows
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

/**
 * @keyword GET - GET LIMITED FRIEND REQUESTS
 * @description gets newest friend requests - limited by PARAMETER "amount"
 * @route /user/friends
 * @param amount - number of limited friend requests
 *
 */
router.get('/get/requested/:amount', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		let userID = req.user.id;
		const amount = req.params.amount;
		const usersIDs: number[] = [];

		const requests = await pool.query(
			'SELECT user_one_id, user_two_id FROM relationships WHERE (user_one_id = $1 OR user_two_id = $2) AND friendship_status = $3 AND action_user_id != $4 ORDER BY createdat DESC LIMIT $5',
			[ userID, userID, 'Pending', userID, amount ]
		);

		const users = requests.rows;

		for (let i = 0; i < users.length; i++) {
			if (users[i].user_one_id === req.user.id) {
				usersIDs.push(users[i].user_two_id);
			} else {
				usersIDs.push(users[i].user_one_id);
			}
		}

		if (usersIDs.length === 0) {
			return res.status(200).json({
				users: []
			});
		}

		const foundUsers = await pool.query(
			'SELECT users.id AS user_main_id, username, firstname, lastname, email, profile_img, gender, relationships.createdat AS created_at_relationship FROM users JOIN relationships ON users.id = action_user_id  WHERE action_user_id = ANY($1) AND (user_one_id = $2 OR user_two_id = $3) ORDER BY relationships.createdat DESC',
			[ usersIDs, userID, userID ]
		);

		return res.status(200).json({
			users: foundUsers.rows
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

export = router;
