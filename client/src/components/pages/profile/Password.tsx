import React from 'react';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { RootState } from '../../../allReducers';
import { SystemState } from '../../../store/system/types';
import axios from 'axios';
import Account from '../../AccountComponent';
import AccountComponent from '../../AccountComponent';

export interface PasswordProps {
	success: string;
}

const Password: React.FC<PasswordProps> = () => {
	const [ oldPassword, setOldPassword ] = useState<string>('');
	const [ newPassword, setNewPassword ] = useState<string>('');
	const [ confirmPassword, setConfirmPassword ] = useState<string>('');
	const [ success, setSuccess ] = useState<string>('');
	const [ error, setError ] = useState<string>('');
	const state: SystemState = useSelector((state: RootState) => state.isLogged);

	const submitNewPassword = async (e) => {
		try {
			e.preventDefault();

			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			if (newPassword !== confirmPassword) {
				setError("Password doesn't match");
				return;
			}

			const sendData = {
				oldPassword,
				newPassword,
				confirmPassword
			};

			const response = await axios.put<PasswordProps>(
				'http://localhost:8000/account/change/password',
				sendData,
				config
			);
			setSuccess(response.data.success);
			setError('');
		} catch (error) {
			if (error.response) {
				setError(error.response.data.error);
				return;
			}
			setError('An Error occurred, try again');
		}
	};

	return (
		<section className="account-page">
			<div className="account-page__container">
				<AccountComponent />
				<div className="account-page__container__content">
					<div className="account-page__container__content__password">
						<h4>Password edit</h4>
						{success && <div className="no-posts">{success}</div>}
						{error && <div className="no-posts">{error}</div>}
						<form action="" onSubmit={submitNewPassword}>
							<span>
								<label htmlFor="oldPassword">Old password</label>
								<input
									type="password"
									onChange={(e) => setOldPassword(e.target.value)}
									value={oldPassword}
									id="oldPassword"
								/>
							</span>

							<span>
								<label htmlFor="newPassword">New password</label>
								<input
									type="password"
									placeholder="New password"
									onChange={(e) => setNewPassword(e.target.value)}
									value={newPassword}
									id="newPassword"
								/>
							</span>
							<span>
								<label htmlFor="confirmPassword">Confirm Password</label>
								<input
									type="password"
									placeholder="Confirm new password"
									onChange={(e) => setConfirmPassword(e.target.value)}
									value={confirmPassword}
									id="confirmPassword"
								/>
							</span>

							<div className="button-container">
								<button
									type="submit"
									disabled={confirmPassword === '' || newPassword === '' || oldPassword === ''}
									className="password-btn"
								>
									Submit
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Password;
