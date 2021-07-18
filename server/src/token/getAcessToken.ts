import jwt from 'jsonwebtoken';

const getAccessToken = async (req, res, next) => {
	try {
		const header = req.headers['authorization'];

		if (!header) {
			return res.status(401).json({
				error: 'Unauthorized'
			});
		}
		const getAccessToken = header && header.split(' ')[1];
		const user = jwt.verify(getAccessToken, process.env.ACCESS_TOKEN_SECRET!);

		if (!user) {
			return res.status(401).json({
				error: 'Unauthorized'
			});
		}
		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({
			error: 'Unauthorized'
		});
	}
};
export = getAccessToken;
