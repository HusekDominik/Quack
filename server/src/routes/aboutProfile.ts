import * as express from 'express';
import protectedByToken from '../token/getAcessToken';
import pool from '../database/connect';

const router = express.Router();

router.get('/about/:userID', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const aboutProfile = await pool.query('SELECT * FROM users WHERE users.id = $1', [ req.params.userID ]);

		return res.status(200).json({
			data: aboutProfile.rows[0]
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'An error occurred'
		});
	}
});

router.get('/files/:userID', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const userID = req.params.userID;

		const userPhotos = await pool.query(
			'SELECT id AS post_id_main, image FROM posts WHERE author_id = $1 ORDER BY createdat DESC',
			[ userID ]
		);

		return res.status(200).json({
			photos: userPhotos.rows
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'An error occurred'
		});
	}
});

router.get('/friends/:userID', protectedByToken, async (req: any, res: express.Response) => {
	try {
		let userID = req.params.userID;
		const usersIDs: number[] = [];

		const friends = await pool.query(
			'SELECT user_one_id, user_two_id FROM relationships WHERE (user_one_id = $1 OR user_two_id = $2) AND friendship_status = $3',
			[ userID, userID, 'Accepted' ]
		);

		const users = friends.rows;

		for (let i = 0; i < users.length; i++) {
			if (users[i].user_one_id === userID) {
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
		return res.status(500).json({
			error: 'An error occurred'
		});
	}
});

export = router;
