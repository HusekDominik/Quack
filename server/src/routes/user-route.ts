import * as express from 'express';
import pool from '../database/connect';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { sendVerifyEmailFunc } from '../config/nodemailer';
import accessTokenFunc from '../token/generateAcessToken';
import protectedByToken from '../token/getAcessToken';

const router = express.Router();

/**
 * @keyword POST - REGISTER
 * @description creates new user account
 * @route user
 */
router.post('/register', async (req: express.Request, res: express.Response) => {
	try {
		const { username, firstname, lastname, email, password, gender } = req.body;

		const usernameT = username.trim();
		const firstnameT = firstname.trim();
		const lastnameT = lastname.trim();
		const emailT = email.trim();
		const passwordT = password.trim();

		if (usernameT.length < 5) {
			return res.status(401).json({
				error: 'Username is too short'
			});
		}

		if (passwordT.length <= 5) {
			return res.status(401).json({
				error: 'Choose stronger password'
			});
		}

		if (usernameT.length >= 50) {
			return res.status(401).json({
				error: 'Username is too long, choose shorter'
			});
		}
		if (firstnameT.length >= 50) {
			return res.status(401).json({
				error: 'Firstname is too long, choose shorter'
			});
		}
		if (lastnameT.length >= 50) {
			return res.status(401).json({
				error: 'Lastname is too long, choose shorter'
			});
		}

		if (passwordT.length >= 100) {
			return res.status(401).json({
				error: 'Password is too long, choose shorter'
			});
		}

		const usernameExists = await pool.query('SELECT * FROM users WHERE username = $1', [ usernameT ]);

		if (usernameExists.rows[0]) {
			return res.status(401).json({
				error: 'Username is already taken'
			});
		}

		const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [ emailT ]);

		if (emailExists.rows[0]) {
			return res.status(401).json({
				error: 'Email already exists'
			});
		}

		const hashedPassword = await argon2.hash(passwordT);

		if (!hashedPassword) {
			return res.status(400).json({
				error: 'An error ocurred password'
			});
		}

		const registerUser = await pool.query(
			'INSERT INTO users(username, firstname, lastname, email, password, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[ usernameT, firstnameT, lastnameT, emailT, hashedPassword, gender ]
		);

		await pool.query(
			'INSERT INTO notifications(user_id, requester_id, notification_status, notification_description) VALUES ($1, $2, $3, $4)',
			[ registerUser.rows[0].id, null, 0, 'Welcome on Quack!' ]
		);

		if (!registerUser) {
			return res.status(500).json({
				error: 'Server error'
			});
		}
		const EMAIL_TOKEN = jwt.sign({ id: registerUser.rows[0].id }, process.env.EMAIL_SECRET!, { expiresIn: '300m' });

		sendVerifyEmailFunc(EMAIL_TOKEN, registerUser.rows[0].email);

		return res.status(200).json({
			data: 'Please, verify your email in order to log in'
		});
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			error: 'An Error Ocurred',
			errorhandle: error
		});
	}
});

/**
 * @keyword POST - LOGIN
 * @description loggs user in 
 * @route user
 */
router.post('/login', async (req: express.Request, res: express.Response) => {
	try {
		const { email, password } = req.body;

		const userExists = await pool.query(
			'SELECT id, username, firstname, is_verified, lastname, password, profile_img, email, gender, dark_mode, private_profile FROM users WHERE email = $1',
			[ email ]
		);

		if (!userExists.rows[0]) {
			return res.status(401).json({
				error: "Email doesn't exist"
			});
		}

		const unHashedPassword = await argon2.verify(userExists.rows[0].password, password);

		if (!unHashedPassword) {
			return res.status(401).json({
				error: "Password doesn't match"
			});
		}

		// if (!userExists.rows[0].is_verified) {
		// 	return res.status(401).json({
		// 		error: 'Please, verify email first'
		// 	});
		// }

		const userInfo = {
			id: userExists.rows[0].id
		};

		const acessToken = accessTokenFunc(userInfo);

		return res.status(200).json({
			success: true,
			accessToken: acessToken,
			id: userExists.rows[0].id,
			username: userExists.rows[0].username,
			firstname: userExists.rows[0].firstname,
			lastname: userExists.rows[0].lastname,
			profileImg: userExists.rows[0].profile_img,
			gender: userExists.rows[0].gender,
			email: userExists.rows[0].email,
			isPrivate: userExists.rows[0].private_profile,
			darkMode: userExists.rows[0].dark_mode
		});
	} catch (error) {
		return res.status(401).json({
			error: 'An unknown error ocurred'
		});
	}
});

/**
 * @keyword GET - SEARCHBAR
 * @description finds users through user's input in searchbar
 * @route user
 * @limit 5
 */
router.get('/profile/:username', protectedByToken, async (req: express.Request, res: express.Response) => {
	try {
		const username = req.params.username;

		const user = await pool.query(
			'SELECT id, username, firstname, lastname, email, gender, profile_img FROM users WHERE username ILIKE $1 LIMIT 5',
			[ username + '%' ]
		);

		if (!user.rows[0]) {
			return res.status(200).json({
				user: []
			});
		}

		return res.status(200).json({
			user: user.rows
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error
		});
	}
});

/**
 * @keyword GET - SEARCHED USER PROFILE
 * @description gets information about searched user while being on his profile
 * @route user
 */
router.get('/profile/search/:username/:skipAmount', protectedByToken, async (req: any, res: express.Response) => {
	try {
		const username = req.params.username;

		const skipAmount = req.params.skipAmount;

		const user = await pool.query(
			'SELECT id, username, firstname, lastname, email, gender, profile_img, profile_background_img, private_profile FROM users WHERE username = $1',
			[ username ]
		);

		let userWithSmallID = req.user.id;
		let userWithBigID = user.rows[0].id;

		if (req.user.id > user.rows[0].id) {
			userWithSmallID = user.rows[0].id;
			userWithBigID = req.user.id;
		}

		const posts = await pool.query(
			'SELECT id AS post_id_main, author_id, description, image, createdat FROM posts WHERE author_id = $1 ORDER BY createdat DESC LIMIT $2 OFFSET $3',
			[ user.rows[0].id, 5, skipAmount ]
		);

		const friendship = await pool.query(
			'SELECT user_one_id, user_two_id, action_user_id, friendship_status FROM relationships WHERE user_one_id = $1 AND user_two_id = $2',
			[ userWithSmallID, userWithBigID ]
		);

		let friendship_status;

		if (!friendship.rows[0]) {
			friendship_status = 0;
		} else {
			friendship_status = friendship.rows[0].friendship_status;
		}

		if (friendship_status === 'Pending' && req.user.id === friendship.rows[0].action_user_id) {
			friendship_status = 'Requested';
		}

		if (user.rows[0].private_profile === true && friendship_status !== 'Accepted') {
			return res.json({
				user: user.rows[0],
				posts: [],
				friendStatus: friendship_status,
				hidePosts: true
			});
		}

		if (!user.rows[0]) {
			return res.status(200).json({
				user: [],
				posts: [],
				friendStatus: null
			});
		}

		return res.status(200).json({
			user: user.rows[0],
			posts: posts.rows,
			friendStatus: friendship_status
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error
		});
	}
});

/**
 * @keyword GET - MAIN PROFILE
 * @description get information about current logged in user, excluding information stored in localstorage (while being on profile page)
 * @route user
 */
router.get('/get/main/:skipAmount', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const userID = req.user.id;

		const skipAmount = req.params.skipAmount;

		const user = await pool.query(
			'SELECT id, username, firstname, lastname, email, gender, profile_img, profile_background_img FROM users WHERE id = $1',
			[ userID ]
		);

		const posts = await pool.query(
			'SELECT id AS post_id_main, author_id, image, description, createdat FROM posts WHERE author_id = $1 ORDER BY createdat DESC LIMIT $2 OFFSET $3',
			[ userID, 5, skipAmount ]
		);

		return res.status(200).json({
			user: user.rows,
			posts: posts.rows
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

/**
 * @keyword GET - SEARCHBAR ALL
 * @description GETS ALL USERS based ON MATCHING username
 * @route user
 */
router.get('/profiles/:username', protectedByToken, async (req: express.Request, res: express.Response) => {
	try {
		const username = req.params.username;

		const user = await pool.query(
			'SELECT id, username, firstname, lastname, email, gender, profile_img FROM users WHERE username ILIKE $1',
			[ username + '%' ]
		);

		if (!user.rows) {
			return res.status(200).json({
				user: []
			});
		}

		return res.status(200).json({
			user: user.rows
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: error
		});
	}
});

/**
 * @keyword GET - notifications
 * @description gets all notifications everytime we refresh page (navbar)
 * @route user
 */

router.get('/get/notifications', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const userID = req.user.id;

		const notifications = await pool.query('SELECT * FROM notifications WHERE user_id = $1', [ userID ]);

		const allUsersIDS: any = [];

		for (let i = 0; i < notifications.rows.length; i++) {
			if (notifications.rows[i].requester_id) {
				const requesterID = notifications.rows[i].requester_id;

				allUsersIDS.push(requesterID);
			}
		}

		const notificationsL = await pool.query(
			'SELECT * FROM notifications WHERE notification_Status = $1 AND user_id = $2 ORDER BY notification_created_at DESC',
			[ 0, userID ]
		);

		const userNotifications = await pool.query(
			'SELECT users.id AS user_main_id, username, firstname, lastname, email, gender, profile_img, notification_status, notification_created_at, notifications.id AS notification_main_id  FROM users JOIN notifications ON requester_id = users.id  WHERE requester_id = ANY($1) AND user_id = $2 ORDER BY notification_created_at DESC',
			[ allUsersIDS, userID ]
		);

		const allNotifications = [ ...notificationsL.rows, ...userNotifications.rows ];

		return res.status(200).json({
			notifications: allNotifications
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

/**
 * @keyword DELETE - notifications
 * @description DELETE all notifications
 * @route user
 */

router.delete('/delete/notifications', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const userID = req.user.id;

		await pool.query('DELETE FROM notifications WHERE user_id = $1', [ userID ]);

		return res.status(200).json({
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

/**
 * @keyword GET - notifications / friend Requests Amount
 * @description gets all amount of requests & notifications (only amount) ON REFRESH
 * @route user
 */

router.get('/get/notifications/requests', protectedByToken, async (req: any, res: express.Response): Promise<
	express.Response
> => {
	try {
		const userID = req.user.id;

		const notifications = await pool.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1', [ userID ]);

		const requests = await pool.query(
			'SELECT COUNT(*) FROM relationships WHERE (user_one_id = $1 OR user_two_id = $2) AND friendship_status = $3 AND action_user_id != $4',
			[ userID, userID, 'Pending', userID ]
		);

		return res.status(200).json({
			notificationsAmount: notifications.rows[0].count,
			friendRequestsAmount: requests.rows[0].count
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

export = router;
