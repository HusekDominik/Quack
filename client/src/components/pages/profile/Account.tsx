import React, { useEffect, useRef, useState } from 'react';
import { RootState } from '../../../allReducers';
import { useSelector, useDispatch } from 'react-redux';
import { SystemState } from '../../../store/system/types';
import AccountComponent from '../../AccountComponent';
import { profileImgFunc } from '../../../ProfileImg';
import axios from 'axios';

export interface AccountProps {}

const Account: React.FC<AccountProps> = () => {
	const isLoggedState: any = useSelector<RootState>((state: RootState) => state.isLogged);
	const dispatch: any = useDispatch();

	const [ userUsername, setUserUsername ] = useState<string>('');
	const [ userFirstname, setUserFirstname ] = useState<string>('');
	const [ userLastname, setUserLastname ] = useState<string>('');
	const [ userEmail, setUserEmail ] = useState<string>('');
	const [ userGender, setUserGender ] = useState<string>('');
	const [ highlightButton, setHighlightButton ] = useState<any>('');
	const [ error, setError ] = useState<string>('');

	const maleButtonRef: any = useRef(null);
	const femaleButtonRef: any = useRef(null);
	const otherButtonRef: any = useRef(null);

	useEffect(
		() => {
			checkButtonStatus(isLoggedState.gender);
			setUserUsername(isLoggedState.username);
			setUserFirstname(isLoggedState.firstname);
			setUserLastname(isLoggedState.lastname);
			setUserGender(isLoggedState.gender);
			setUserEmail(isLoggedState.email);
		},
		[ isLoggedState.gender ]
	);

	const checkGender = (elementTarget) => {
		if (highlightButton) {
			highlightButton.classList.remove('active-button');
			setHighlightButton('');
		}
		setHighlightButton(elementTarget);

		elementTarget.classList.add('active-button');

		setUserGender(elementTarget.getAttribute('value'));
	};

	const checkButtonStatus = (gender: string) => {
		if (maleButtonRef.current === null && femaleButtonRef.current === null && otherButtonRef.current === null) {
			return;
		}

		if (highlightButton) {
			highlightButton.classList.remove('active-button');
			setHighlightButton('');
		}

		if (gender === maleButtonRef.current.value) {
			setHighlightButton(maleButtonRef.current);
			maleButtonRef.current.classList.add('active-button');
		} else if (gender === femaleButtonRef.current.value) {
			setHighlightButton(femaleButtonRef.current);
			femaleButtonRef.current.classList.add('active-button');
		} else if (gender === otherButtonRef.current.value) {
			setHighlightButton(otherButtonRef.current);
			otherButtonRef.current.classList.add('active-button');
		}
	};

	const updateProfileForm = async (e) => {
		try {
			e.preventDefault();

			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${isLoggedState.accessToken}`
				}
			};

			const data = {
				username: userUsername,
				firstname: userFirstname,
				lastname: userLastname,
				email: userEmail,
				gender: userGender
			};

			const response = await axios.put('http://localhost:8000/account/user', data, config);

			const localStorageItem: any = localStorage.getItem('quack-app-id');

			if (localStorageItem) {
				const localStorageData: SystemState = JSON.parse(localStorageItem);

				const newObject: SystemState = localStorageData;

				newObject.username = response.data.data.username;
				newObject.firstname = response.data.data.firstname;
				newObject.lastname = response.data.data.lastname;
				newObject.email = response.data.data.email;
				newObject.gender = response.data.data.gender;

				localStorage.setItem('quack-app-id', JSON.stringify(newObject));

				dispatch({
					type: 'UPDATE_PROFILE_ACCOUNT',
					payload: {
						username: response.data.data.username,
						firstname: response.data.data.firstname,
						lastname: response.data.data.lastname,
						email: response.data.data.email,
						gender: response.data.data.gender
					}
				});
			}
		} catch (error) {
			if (error.response.status === 401) {
				console.log(error.response.data.error);
				setError(error.response.data.error);
			}
			console.log(error);
			return;
		}
	};

	const resetValues = (): void => {
		checkButtonStatus(isLoggedState.gender);
		setUserUsername(isLoggedState.username);
		setUserFirstname(isLoggedState.firstname);
		setUserLastname(isLoggedState.lastname);
		setUserGender(isLoggedState.gender);
		setUserEmail(isLoggedState.email);
	};

	return (
		<section className="account-page">
			<div className="account-page__container">
				<AccountComponent />
				<div className="account-page__container__content">
					<div className="account-page__container__content__profile">
						<div className="account-page__container__content__profile__img-name">
							{isLoggedState.gender && (
								<img
									src={profileImgFunc(isLoggedState.profileImg, isLoggedState.gender, false)}
									alt="profileimg"
								/>
							)}
							<h4>{isLoggedState.firstname + ' ' + isLoggedState.lastname}</h4>
						</div>
						<form action="" onSubmit={updateProfileForm}>
							{error && <div className="error">{error}</div>}
							<span>
								<label htmlFor="username">Username</label>
								<input
									type="text"
									id="username"
									value={userUsername}
									onChange={(e) => setUserUsername(e.target.value)}
								/>
							</span>
							<span>
								<label htmlFor="firstname">Firstname</label>
								<input
									type="text"
									id="firstname"
									value={userFirstname}
									onChange={(e) => setUserFirstname(e.target.value)}
								/>
							</span>
							<span>
								<label htmlFor="lastname">Lastname</label>
								<input
									type="text"
									id="lastname"
									value={userLastname}
									onChange={(e) => setUserLastname(e.target.value)}
								/>
							</span>
							<span>
								<label htmlFor="email">E-mail adress</label>
								<input
									type="text"
									id="email"
									value={userEmail}
									onChange={(e) => setUserEmail(e.target.value)}
								/>
							</span>
							<div className="account-gender-container">
								<span>Gender</span>
								<div className="account-gender-buttons">
									<button
										className="male"
										type="button"
										value="Male"
										onClick={(e) => checkGender(e.target)}
										ref={maleButtonRef}
									>
										Male
									</button>
									<button
										className="female"
										type="button"
										value="Female"
										onClick={(e) => checkGender(e.target)}
										ref={femaleButtonRef}
									>
										Female
									</button>
									<button
										className="other"
										type="button"
										value="Other"
										onClick={(e) => checkGender(e.target)}
										ref={otherButtonRef}
									>
										Other
									</button>
								</div>
							</div>
							<div className="button-container">
								<button
									disabled={
										userFirstname === isLoggedState.firstname &&
										userLastname === isLoggedState.lastname &&
										userEmail === isLoggedState.email &&
										userGender === isLoggedState.gender &&
										userUsername === isLoggedState.username
									}
									type="submit"
								>
									Submit
								</button>
								<button
									disabled={
										userFirstname === isLoggedState.firstname &&
										userLastname === isLoggedState.lastname &&
										userEmail === isLoggedState.email &&
										userGender === isLoggedState.gender &&
										userUsername === isLoggedState.username
									}
									type="button"
									onClick={() => resetValues()}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Account;
