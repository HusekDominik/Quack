import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../allReducers';
import { SystemState } from '../../../store/system/types';
import AccountComponent from '../../AccountComponent';

export interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
	const isLoggedState: any = useSelector<RootState>((state: RootState) => state.isLogged);

	const dispatch: any = useDispatch();

	const [ isChecked, setIsChecked ] = useState<boolean>(isLoggedState.isPrivate);
	const [ isLoading, setIsLoading ] = useState<boolean>(true);

	useEffect(
		() => {
			if (isLoggedState.id && isLoading) {
				setIsChecked(isLoggedState.isPrivate);
				setIsLoading(false);
				return;
			}
		},
		[ isLoggedState.username, isLoading ]
	);

	const setPrivateAccount = async (e) => {
		try {
			e.preventDefault();

			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${isLoggedState.accessToken}`
				}
			};

			const data = {
				isPrivate: isChecked
			};

			await axios.put('http://localhost:8000/account/change/privacy', data, config);

			const localStorageItem: any = localStorage.getItem('quack-app-id');

			if (localStorageItem) {
				const localStorageData: SystemState = JSON.parse(localStorageItem);

				const newObject: SystemState = localStorageData;

				newObject.isPrivate = isChecked;

				localStorage.setItem('quack-app-id', JSON.stringify(newObject));

				dispatch({
					type: 'UPDATE_PROFILE_PRIVACY',
					payload: {
						isPrivate: isChecked
					}
				});
			}
		} catch (error) {
			console.log(error);
			return;
		}
	};

	const resetValues = (): void => {
		setIsChecked(isLoggedState.isPrivate);
	};

	return (
		<section className="account-page">
			<div className="account-page__container">
				<AccountComponent />
				<div className="account-page__container__content">
					<div className="account-page__container__content__settings">
						<h4>Private Account</h4>
						<form action="" onSubmit={setPrivateAccount}>
							<input type="checkbox" checked={isChecked} onChange={() => setIsChecked((prev) => !prev)} />
							<div className="button-container">
								<button disabled={isLoggedState.isPrivate === isChecked} type="submit">
									Submit
								</button>
								<button
									disabled={isLoggedState.isPrivate === isChecked}
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

export default Settings;
