import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import { SystemState } from '../../../store/system/types';
import BackArrowImg from '../../../images/back-arrow.png';

export interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
	const dispatch = useDispatch();

	const loginRegisterContainer: any = React.createRef();
	const forgottenPasswordContainer: any = React.createRef();

	const [ loginEmail, setLoginEmail ] = useState<string>('');
	const [ loginPassword, setLoginPassword ] = useState<string>('');
	const [ loginError, setLoginError ] = useState<string>('');
	const [ isRedirect, setIsRedirect ] = useState<boolean>(false);

	const [ registerUsername, setRegisterUsername ] = useState<string>('');
	const [ registerFirstname, setRegisterFirstname ] = useState<string>('');
	const [ registerLastname, setRegisterLastname ] = useState<string>('');
	const [ registerEmail, setRegisterEmail ] = useState<string>('');
	const [ registerPassword, setRegisterPassword ] = useState<string>('');
	const [ registerConfirmPassword, setRegisterConfirmPassword ] = useState<string>('');
	const [ registerGender, setRegisterGender ] = useState<string>('');
	const [ registerError, setRegisterError ] = useState<string>('');
	const [ registerSuccess, setRegisterSuccess ] = useState<string>('');
	const [ highlightButton, setHighlightButton ] = useState<any>('');

	const [ forgottenSuccess, setForgottenSuccess ] = useState<string>('');
	const [ forgottenError, setForgottenError ] = useState<string>('');
	const [ forgottenEmail, setForgottenEmail ] = useState<string>('');
	const [ forgottenPassword, setForgottenPassword ] = useState<string>('');
	const [ forgottenConfirmPassword, setForgottenConfirmPassword ] = useState<string>('');

	const sendLogin = async (e: any): Promise<void> => {
		try {
			e.preventDefault();

			const data = { email: loginEmail, password: loginPassword };

			if (!loginEmail && !loginPassword) {
				setLoginError('Please fill all the inputs');
				return;
			}

			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
			};

			const response = await axios.post<SystemState>('http://localhost:8000/user/login', data, config);

			dispatch({
				type: 'LOGGED_IN',
				payload: {
					accessToken: response.data.accessToken,
					id: response.data.id,
					username: response.data.username,
					profileImg: response.data.profileImg,
					gender: response.data.gender,
					email: response.data.email,
					isPrivate: response.data.isPrivate,
					darkMode: response.data.darkMode
				}
			});

			localStorage.setItem(
				'quack-app-id',
				JSON.stringify({
					accessToken: response.data.accessToken,
					id: response.data.id,
					username: response.data.username,
					firstname: response.data.firstname,
					lastname: response.data.lastname,
					email: response.data.email,
					profileImg: response.data.profileImg,
					gender: response.data.gender,
					isPrivate: response.data.isPrivate,
					darkMode: response.data.darkMode
				})
			);

			setIsRedirect(true);
		} catch (error) {
			if (error.response) {
				setLoginError(error.response.data.error);
				return;
			}

			setLoginError('An error ocurred');
			return;
		}
	};
	const sendRegister = async (e: any): Promise<void> => {
		try {
			e.preventDefault();

			if (
				!registerUsername &&
				!registerFirstname &&
				!registerLastname &&
				!registerEmail &&
				!registerPassword &&
				!registerConfirmPassword &&
				!registerGender
			) {
				setRegisterError('Please fill all the inputs');
				return;
			}

			if (registerPassword !== registerConfirmPassword) {
				setRegisterError("Password doesn't match");
				return;
			}

			const data = {
				username: registerUsername,
				firstname: registerFirstname,
				lastname: registerLastname,
				email: registerEmail,
				password: registerPassword,
				gender: registerGender
			};

			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
			};

			const response = await axios.post('http://localhost:8000/user/register', data, config);

			setRegisterSuccess(response.data.data);
			setRegisterError('');
		} catch (error) {
			if (error.response) {
				setRegisterError(error.response.data.error);
				return;
			}
			setRegisterError('An Error ocurred');
			return;
		}
	};

	const rightPanelActive = (): void => {
		if (loginError) {
			setTimeout(() => {
				setLoginError('');
			}, 1000);
		}
		loginRegisterContainer.current.classList.add('right-panel-active');
	};

	const rightPanelInactive = (): void => {
		if (registerError) {
			setTimeout(() => {
				setRegisterError('');
			}, 1000);
		}
		loginRegisterContainer.current.classList.remove('right-panel-active');
	};

	const checkGender = (elementTarget) => {
		if (highlightButton) {
			highlightButton.classList.remove('active-button');
			setHighlightButton('');
		}

		setHighlightButton(elementTarget);

		elementTarget.classList.add('active-button');

		setRegisterGender(elementTarget.getAttribute('value'));
	};

	const sendForgotPassword = async (e): Promise<void> => {
		try {
			e.preventDefault();

			const sendData = {
				email: forgottenEmail,
				password: forgottenPassword,
				confirmPassword: forgottenConfirmPassword
			};

			if (!forgottenEmail && !forgottenPassword && !forgottenConfirmPassword) {
				setForgottenError('Please fill all the inputs');
				return;
			}

			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
			};
			await axios.post('http://localhost:8000/forgotten/password', sendData, config);

			setForgottenSuccess('Confirm changes through email');
			setForgottenError('');
		} catch (error) {
			if (error.response) {
				setForgottenError(error.response.data.error);
				return;
			}
			setForgottenError('An error occurred');
		}
	};

	const resendEmailVerification = async (): Promise<void> => {
		try {
			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
			};

			const data = {
				email: loginEmail
			};

			await axios.post(`http://localhost:8000/email/resend/token`, data, config);

			setLoginError('Confirm changes through email');
		} catch (error) {
			if (error.response) {
				setLoginError(error.response.data.error);
				return;
			}
			setLoginError('An error occurred');
		}
	};

	const openforgottenPasswordPanel = (): void => {
		forgottenPasswordContainer.current.classList.add('active');
	};

	const closeForgottenPasswordPanel = (): void => {
		forgottenPasswordContainer.current.classList.remove('active');
	};

	return (
		<div className="login-register-page">
			<div className="container-login-register" ref={loginRegisterContainer}>
				<div className="form-container sign-up-container">
					<form action="" onSubmit={sendRegister}>
						<h1>Create account</h1>
						{registerError && registerError}
						{registerSuccess && registerSuccess}
						<input
							type="text"
							placeholder="Username"
							onChange={(e) => setRegisterUsername(e.target.value)}
						/>
						<div className="fullname-div">
							<input
								type="text"
								placeholder="First name"
								onChange={(e) => setRegisterFirstname(e.target.value)}
							/>
							<input
								type="text"
								placeholder="Last name"
								onChange={(e) => setRegisterLastname(e.target.value)}
							/>
						</div>
						<input
							type="email"
							placeholder="Email adress"
							onChange={(e) => setRegisterEmail(e.target.value)}
						/>
						<input
							type="password"
							placeholder="Password"
							onChange={(e) => setRegisterPassword(e.target.value)}
						/>
						<input
							type="password"
							placeholder="Confirm password"
							onChange={(e) => setRegisterConfirmPassword(e.target.value)}
						/>
						<div className="sign-up-buttons">
							<button className="male" type="button" value="Male" onClick={(e) => checkGender(e.target)}>
								Male
							</button>
							<button
								className="female"
								type="button"
								value="Female"
								onClick={(e) => checkGender(e.target)}
							>
								Female
							</button>
							<button
								className="other"
								type="button"
								value="Other"
								onClick={(e) => checkGender(e.target)}
							>
								Other
							</button>
						</div>
						<button type="submit">Sign Up</button>
					</form>
					<Link to="/user/login">Already have an account?</Link>
				</div>
				<div className="form-container sign-in-container">
					<form action="" onSubmit={sendLogin}>
						<h1>Log in</h1>
						{loginError && loginError}
						<input
							type="email"
							placeholder="Email"
							onChange={(e) => setLoginEmail(e.target.value)}
							value={loginEmail}
						/>
						<input
							type="password"
							placeholder="Password"
							onChange={(e) => setLoginPassword(e.target.value)}
							value={loginPassword}
						/>
						<div className="forgotten-password">
							<button type="button" onClick={() => openforgottenPasswordPanel()}>
								I forgot my password.
							</button>
						</div>
						<button type="submit">Sign In</button>
						{loginError === 'Please, verify email first' && (
							<div
								className="resend-email-verification"
								style={{ textAlign: 'center', marginTop: '0.1rem' }}
							>
								<button
									onClick={() => resendEmailVerification()}
									type="button"
									style={{ marginLeft: '0rem' }}
								>
									Resend email verification
								</button>
							</div>
						)}
					</form>
					{isRedirect && <Redirect to="/" />}
				</div>
				<div className="form-container forgotten-password-container" ref={forgottenPasswordContainer}>
					<form action="" onSubmit={sendForgotPassword}>
						<h1>Forgotten password</h1>
						{forgottenError && forgottenError}
						{forgottenSuccess && forgottenSuccess}
						<input
							type="email"
							placeholder="email"
							onChange={(e) => setForgottenEmail(e.target.value)}
							value={forgottenEmail}
						/>
						<input
							type="password"
							placeholder="Create new password"
							onChange={(e) => setForgottenPassword(e.target.value)}
							value={forgottenPassword}
						/>
						<input
							type="password"
							placeholder="Confirm new password"
							onChange={(e) => setForgottenConfirmPassword(e.target.value)}
							value={forgottenConfirmPassword}
						/>
						<button type="submit">Change password</button>
						<button type="button" onClick={() => closeForgottenPasswordPanel()}>
							<img src={BackArrowImg} alt="back-arrow" />
						</button>
					</form>
				</div>
				<div className="overlay-container">
					<div className="overlay">
						<div className="overlay-panel overlay-left">
							<h1>Welcome on Quack!</h1>
							<p>Please enter your personal data to complete the registration.</p>
							<p>If you already have an account, hurry up and sign in!</p>
							<button className="ghost" id="signIn" onClick={() => rightPanelInactive()}>
								Sign In
							</button>
						</div>
						<div className="overlay-panel overlay-right">
							<h1>Welcome back!</h1>
							<p>Please enter your personal data to log into Quack.</p>
							<p>If you don't have an account yet, hurry up and sign up!</p>
							<button className="ghost" id="signUp" onClick={() => rightPanelActive()}>
								Sign Up
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
