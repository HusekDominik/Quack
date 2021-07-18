import jwt from 'jsonwebtoken';

const accessToken = (user: object) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET! /*, { expiresIn: '1000m' }*/);
};
export = accessToken;
