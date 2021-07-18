import React, { useState } from 'react';
import { RootState } from '../../allReducers';
import { profileImgFunc, profileImgBackgroundFunc } from '../../ProfileImg';
import { SystemState } from '../../store/system/types';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import AboutProfileComponent from './AboutProfileComponent';
import cameraBackground from '../../images/camera-background.png';

export interface ProfileComponentProps {
	id?: string | Number;
	profile_img?: string | null;
	gender: any;
	firstname?: string;
	lastname?: string;
	profileBackground?: string | null;
	friendshipStatus?: number | string | null | undefined;
}

const ProfileComponent: React.FC<ProfileComponentProps> = (props: ProfileComponentProps) => {
	const isLoggedState: any = useSelector<RootState>((state: RootState) => state.isLogged);
	let { profile_img, gender, firstname, lastname, profileBackground, id, friendshipStatus } = props;

	const dispatch: any = useDispatch();

	const [ error, setError ] = useState<string>('');

	const [ creatingIMG, setCreatingIMG ] = useState<boolean>(false);
	const [ image, setImage ] = useState<any>();
	const [ imageURL, setImageURL ] = useState<any>(profile_img);

	const [ creatingBackgroundIMG, setCreatingBackgroundIMG ] = useState<boolean>(false);
	const [ backgroundImage, setBackgroundImage ] = useState<any>();
	const [ backgroundImageUrl, setBackgroundImageUrl ] = useState<any>(profileBackground);

	const [ selectingImg, setSelectingImg ] = useState<boolean>(false);
	const [ selectingBackground, setSelectingBackground ] = useState<boolean>(false);

	profileBackground = typeof profileBackground === 'undefined' ? null : profileBackground;
	profile_img = typeof profile_img === 'undefined' ? null : profile_img;

	const renderBasedOnProfile = () => {
		return isLoggedState.id === id ? (
			<div
				className="profile-component__banner"
				style={{
					backgroundImage: `url(${profileImgBackgroundFunc(backgroundImageUrl, creatingBackgroundIMG)})`
				}}
			>
				<div className="profile-component__banner__button-change-imgs">
					{profileBackground !== backgroundImageUrl && selectingBackground ? (
						<button onClick={() => changeBackgroundImg()} className="save-profile-img-button" type="button">
							Save background picture
						</button>
					) : (
						''
					)}
					{profile_img !== imageURL && selectingImg ? (
						<button onClick={() => changeProfileImg()} className="save-profile-img-button" type="button">
							Save profile picture
						</button>
					) : (
						''
					)}
				</div>
				<div className="change-background-container">
					<button>
						<img className="img-camera" src={cameraBackground} alt="camera" />
					</button>
					<input type="file" onChange={(e) => selectBackgroundImg(e)} />
				</div>
				<div className="profile-component__banner__relative">
					<div className="icon loadFile-wrapper">
						<img src={profileImgFunc(imageURL, gender, creatingIMG)} alt="profile-pic" />
					</div>
				</div>
				<div className="update-profile-picture">
					<button type="button">
						<img className="img-camera-picture" src={cameraBackground} alt="camera" />
					</button>
					<input type="file" onChange={(e) => selectProfileImg(e)} />
				</div>
			</div>
		) : (
			<div
				className="profile-component__banner"
				style={{ backgroundImage: `url(${profileImgBackgroundFunc(profileBackground, false)})` }}
			>
				<div className="profile-component__banner__relative">
					<img src={profileImgFunc(profile_img, gender, false)} alt="profile-pic" />
				</div>
			</div>
		);
	};

	const changeProfileImg = async () => {
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${isLoggedState.accessToken}`,
					'Content-Type': 'multipart/form-data'
				}
			};
			const sendFormData = new FormData();

			sendFormData.append('profile-img', image);

			const response = await axios.put('http://localhost:8000/account/change/profile/img', sendFormData, config);

			const localStorageItem: any = localStorage.getItem('quack-app-id');

			if (localStorageItem) {
				const localStorageData: SystemState = JSON.parse(localStorageItem);

				const newObject: SystemState = localStorageData;

				newObject.profileImg = response.data.imagePath;

				localStorage.setItem('quack-app-id', JSON.stringify(newObject));

				dispatch({
					type: 'CHANGE_PROFILE_PIC',
					payload: {
						profileImg: response.data.imagePath
					}
				});
				setSelectingImg(false);
			}
		} catch (error) {
			setError(error.response.data.error);
			return;
		}
	};

	const changeBackgroundImg = async () => {
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${isLoggedState.accessToken}`,
					'Content-Type': 'multipart/form-data'
				}
			};
			const sendFormData = new FormData();

			sendFormData.append('profile-background', backgroundImage);

			await axios.put('http://localhost:8000/account/change/profile/background', sendFormData, config);
			setSelectingBackground(false);
		} catch (error) {
			setError(error.response.data.error);
			return;
		}
	};

	const selectProfileImg = async (e: any) => {
		try {
			setSelectingImg(true);
			const file = e.target.files[0];

			if (file) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setCreatingIMG(true);
					setImageURL(reader.result);
				};
				reader.readAsDataURL(file);
			}
			setImage(file);
		} catch (error) {
			setError('An Error ocurred while selecting image');
			return;
		}
	};

	const selectBackgroundImg = async (e: any) => {
		try {
			setSelectingBackground(true);
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setCreatingBackgroundIMG(true);
					setBackgroundImageUrl(reader.result);
				};
				reader.readAsDataURL(file);
			}
			setBackgroundImage(file);
		} catch (error) {
			setError('An Error ocurred while selecting image');
			return;
		}
	};

	return (
		<React.Fragment>
			<div className="profile-component">
				{renderBasedOnProfile()}
				{error && error}
				<div className="profile-component__name">
					<h2>{firstname + ' ' + lastname}</h2>
				</div>
			</div>
			<AboutProfileComponent key={'abutProfile ' + id} userID={id} friendshipStatus={friendshipStatus} />
		</React.Fragment>
	);
};

export default ProfileComponent;
