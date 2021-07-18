import * as express from 'express';
import pool from '../database/connect';
import { sendNewPasswordFunc } from '../config/nodemailer';
import argon2 from 'argon2';

const router = express.Router();

/**
 * @keyword POST - PASSWORD
 * @description creates new password (on login page) send verification through email
 * @route forgotten
 */

router.post('/password', async (req: express.Request, res: express.Response): Promise<express.Response> => {
	try {
		const { email, password, confirmPassword } = req.body;

		const emailT = email.trim();
		const passwordT = password.trim();
		const confirmPasswordT = confirmPassword.trim();

		if (passwordT !== confirmPasswordT) {
			return res.status(400).json({
				error: "Password doesn't match"
			});
		}

		const user = await pool.query('SELECT * FROM users WHERE email = $1', [ emailT ]);

		if (!user.rows[0]) {
			return res.json(400).json({
				error: "Email doesn't exist"
			});
		}

		const hashedPassword = await argon2.hash(passwordT);

		const passwordWithoutSlashes = hashedPassword.replace(/\//g, 'slash');

		sendNewPasswordFunc(user.rows[0].username, passwordWithoutSlashes, emailT);

		return res.status(200).json({
			data: 'Confirm changes via email'
		});
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			error: 'An Error ocurred'
		});
	}
});

/**
 * @keyword GET - PASSWORD
 * @description EMAIL LINK TO CLICK ON TO CONFIRM PASSWORD CHANGE
 * @route forgotten
 * @param username - UNIQUE username - verification to know which user password should be changed
 * @param password - new password
 */

router.get('/password/:username/:password', async (req: express.Request, res: express.Response) => {
	try {
		const username = req.params.username;
		const hashedPassword = req.params.password;
		const password = hashedPassword.replace(/slash/g, '/');

		await pool.query('UPDATE users SET password = $1, updatedat = now() WHERE username = $2', [
			password,
			username
		]);

		return res.redirect('http://localhost:3000/user/login');
	} catch (error) {
		console.log(error);

		return res.status(400).json({
			error: 'An Error occurred'
		});
	}
});

export = router;
