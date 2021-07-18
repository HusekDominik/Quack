import * as express from 'express';
import pool from '../database/connect';
import jwt from 'jsonwebtoken';
import { sendVerifyEmailFunc } from '../config/nodemailer';

const router = express.Router();
/**
 * @keyword GET - Confirm registered user
 * @description confirm registered user - user can now log in
 * @route /email
 *
 */
router.get('/confirmation/:token', async (req: express.Request, res: express.Response) => {
	try {
		const token: any = jwt.verify(req.params.token, process.env.EMAIL_SECRET!);

		if (!token) {
			return res.status(401).json({
				error: 'Token expired, try sending a new one'
			});
		}
		const { id } = token;
		await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [ id ]);

		return res.redirect('http://localhost:3000/user/login');
	} catch (error) {
		return res.status(401).json({
			error: 'An error occurred, try sending new token'
		});
	}
});
/**
 * @keyword GET - RESEND TOKEN
 * @description resends email token to verify.
 * @route /email
 *
 */
router.post('/resend/token', async (req: express.Request, res: express.Response): Promise<express.Response> => {
	try {
		const { email } = req.body;

		const userExists = await pool.query('SELECT id, email FROM users WHERE email = $1', [ email ]);

		if (!userExists.rows[0]) {
			return res.status(400).json({
				error: "Email doesn't exist"
			});
		}

		const id = userExists.rows[0].id;

		const token = jwt.sign({ id }, process.env.EMAIL_SECRET!, { expiresIn: '300m' });

		sendVerifyEmailFunc(token, userExists.rows[0].email);

		return res.status(200).json({
			data: 'Check your email, confirm'
		});
	} catch (error) {
		console.log(error);
		return res.status(401).json({
			error: 'An error occurred, try clicking again'
		});
	}
});

export = router;
