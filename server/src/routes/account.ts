import * as express from 'express';
import pool from '../database/connect';
import protectedByToken from '../token/getAcessToken';
import argon2 from 'argon2';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
	destination: './uploads/',
	filename: function(_, file, callback) {
		callback(null, file.fieldname + Date.now() + uuidv4() + path.extname(file.originalname));
	}
});

const uploadSingle: any = multer({
	storage: storage,
	fileFilter: function(_, file, callback) {
		let ext = path.extname(file.originalname).toLowerCase();

		if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
			return callback(new Error('Only images are allowed'));
		}
		callback(null, true);
	}
});

router.put(
	'/change/profile/img',
	protectedByToken,
	uploadSingle.single('profile-img'),
	async (req: any, res: express.Response): Promise<express.Response> => {
		try {
			const sellectProfile = await pool.query('SELECT profile_img FROM users WHERE users.id = $1', [
				req.user.id
			]);

			if (sellectProfile.rows[0].profile_img) {
				fs.unlink(sellectProfile.rows[0].profile_img, (err) => {
					if (err) return;
				});
			}

			const updatedProfile = await pool.query(
				'UPDATE users SET profile_img = $1, updatedat = now() WHERE users.id = $2 RETURNING profile_img',
				[ req.file.path, req.user.id ]
			);

			return res.status(200).json({
				imagePath: updatedProfile.rows[0].profile_img
			});
		} catch (error) {
			return res.status(500).json({
				error: 'Server error'
			});
		}
	}
);

router.put(
	'/change/profile/background',
	protectedByToken,
	uploadSingle.single('profile-background'),
	async (req: any, res: express.Response): Promise<express.Response> => {
		try {
			const sellectProfile = await pool.query('SELECT profile_background_img FROM users WHERE users.id = $1', [
				req.user.id
			]);

			if (sellectProfile.rows[0].profile_background_img) {
				fs.unlink(sellectProfile.rows[0].profile_background_img, (err) => {
					if (err) return;
				});
			}

			const updatedProfile = await pool.query(
				'UPDATE users SET profile_background_img = $1, updatedat = now() WHERE users.id = $2 RETURNING profile_background_img',
				[ req.file.path, req.user.id ]
			);

			return res.status(200).json({
				imagePath: updatedProfile.rows[0].profile_background_img
			});
		} catch (error) {
			return res.status(500).json({
				error: 'Server error'
			});
		}
	}
);

router.put('/user', protectedByToken, async (req: any, res: express.Response) => {
	try {
		const { username, firstname, lastname, email, gender } = req.body;

		const usernameT = username.trim();
		const firstnameT = firstname.trim();
		const lastnameT = lastname.trim();
		const emailT = email.trim();

		if (usernameT.length < 5) {
			return res.status(401).json({
				error: 'Username is too short'
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

		const checkIfEmailExists = await pool.query('SELECT id, email, username FROM users WHERE email = $1', [
			emailT
		]);

		if (checkIfEmailExists.rows.length > 0) {
			if (checkIfEmailExists.rows[0].email === emailT && checkIfEmailExists.rows[0].id !== req.user.id) {
				return res.status(401).json({
					error: 'E-mail already exists'
				});
			}
		}

		const checkIfUsernameExists = await pool.query('SELECT id, email, username FROM users WHERE username = $1', [
			usernameT
		]);

		if (checkIfUsernameExists.rows.length > 0) {
			if (
				checkIfUsernameExists.rows[0].username === usernameT &&
				checkIfUsernameExists.rows[0].id !== req.user.id
			) {
				return res.status(401).json({
					error: 'Username already exists'
				});
			}
		}

		const user = await pool.query(
			'UPDATE users SET username = $1, firstname = $2, lastname = $3, email = $4, gender = $5, updatedat = now() WHERE users.id = $6 RETURNING username, firstname, lastname, email, gender',
			[ usernameT, firstnameT, lastnameT, emailT, gender, req.user.id ]
		);

		return res.status(200).json({
			data: user.rows[0]
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

router.put('/change/password', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const { oldPassword, newPassword, confirmPassword } = req.body;

		const passwordT = newPassword.trim();
		const confirmPasswordT = confirmPassword.trim();
		const oldPasswordT = oldPassword.trim();

		if (passwordT.length <= 5) {
			return res.status(401).json({
				error: 'Choose stronger password'
			});
		}

		if (passwordT !== confirmPasswordT) {
			return res.status(401).json({
				error: "Password doesn't match"
			});
		}

		const userOLD = await pool.query('SELECT password FROM users WHERE users.id = $1', [ req.user.id ]);

		const verifiedPassword = await argon2.verify(userOLD.rows[0].password, oldPasswordT);

		if (!verifiedPassword) {
			return res.status(404).json({
				error: "Old password doesn't match"
			});
		}

		const hashedPassword = await argon2.hash(passwordT);

		await pool.query('UPDATE users SET password = $1, updatedat = now()  WHERE users.id = $2', [
			hashedPassword,
			req.user.id
		]);

		return res.status(200).json({
			success: 'Password was successfuly changed'
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

router.put('/change/privacy', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const userID = req.user.id;

		const { isPrivate } = req.body;

		await pool.query('UPDATE users SET private_profile = $1, updatedat = now() WHERE users.id = $2', [
			isPrivate,
			userID
		]);

		return res.status(200).json({
			success: 'Privacy settings was successfuly changed'
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

router.put('/change/mode', protectedByToken, async (req: any, res: express.Response): Promise<express.Response> => {
	try {
		const userID = req.user.id;

		const { darkMode } = req.body;

		const updatedUser = await pool.query(
			'UPDATE users SET dark_mode = $1, updatedat = now() WHERE users.id = $2 RETURNING dark_mode',
			[ darkMode, userID ]
		);

		return res.status(200).json({
			success: 'Dark mode options has changed',
			darkMode: updatedUser.rows[0].dark_mode
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Server error'
		});
	}
});

export = router;
