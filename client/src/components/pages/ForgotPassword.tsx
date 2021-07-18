import React, { useState } from 'react';
import axios from 'axios';

export interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
	const [ success, setSuccess ] = useState<string>('');
	const [ error, setError ] = useState<string>('');
	const [ email, setEmail ] = useState<string>('');
	const [ password, setPassword ] = useState<string>('');
	const [ confirmPassword, setConfirmPassword ] = useState<string>('');

	const sendForgotPassword = async (e): Promise<void> => {
		try {
			e.preventDefault();

			const sendData = {
				email,
				password,
				confirmPassword
			};

			if (!email && !password && !confirmPassword) {
				setError('Please fill all the inputs');
				return;
			}

			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
			};
			await axios.post('http://localhost:8000/forgotten/password', sendData, config);

			setSuccess('Confirm changes through email');
			setError('');
		} catch (error) {
			if (error.response) {
				setError(error.response.data.error);
				return;
			}
			setError('An error occurred');
		}
	};

	return (
		<div>
			{success && success}
			{error && error}
			<form action="" onSubmit={sendForgotPassword}>
				<input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} value={email} />
				<input
					type="password"
					placeholder="Create new password"
					onChange={(e) => setPassword(e.target.value)}
					value={password}
				/>
				<input
					type="password"
					placeholder="Confirm new password"
					onChange={(e) => setConfirmPassword(e.target.value)}
					value={confirmPassword}
				/>
				<button type="submit">Change password</button>
			</form>
		</div>
	);
};

export default ForgotPassword;
