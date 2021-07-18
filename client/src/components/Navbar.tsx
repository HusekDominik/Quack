import React, { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Link, NavLink, Redirect } from 'react-router-dom';
import Search from './Search';
import { SystemState } from '../store/system/types';
import { RootState } from '../allReducers';
import Logo from '../images/logo.png';

import { formatCommentDateFunc } from '../formatDate';
import onClickOutside from './onClickOutside';

// FUNCTIONS
import { profileImgFunc } from '../ProfileImg';

// ICONS
import bellIcon from '../images/bell.png';
import profileIcon from '../images/user.png';
import chatIcon from '../images/paper-plane.png';
import homeIcon from '../images/home.png';
import searchIcon from '../images/search.png';
import InvitesC from './relationships/InvitesC';

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
	const state: any = useSelector((state: RootState) => state.isLogged);

	const [ isMenuOpen, setMenuOpen ] = useState<boolean>(false);
	const [ redirect, setRedirect ] = useState<boolean>(false);
	const [ error, setError ] = useState<string | boolean>('');
	const [ loading, setLoading ] = useState<boolean>(false);
	const [ notificationLoading, setNotificationLoading ] = useState<boolean>(false);
	const [ friendRequestsLoading, setFriendRequestsLoading ] = useState<boolean>(false);
	const [ searchValue, setSearchValue ] = useState<string>('');
	const [ foundUsers, setFoundUsers ] = useState<any>([]);

	const [ notificationsAmount, setNotificationsAmount ] = useState<number>(0);
	const [ friendRequestsAmount, setFriendRequestsAmount ] = useState<number>(0);

	const dispatch = useDispatch();
	const menuRef: any = React.createRef();
	let delayTimer;

	const [ notifications, setNotifications ] = useState<any>([]);
	const [ requestedUsers, setRequestedUsers ] = useState<any>([]);

	const imageRef: any = React.createRef();
	const bellMenuRef: any = React.createRef();
	const bellIconRef: any = React.createRef();

	const requestMenuRef: any = React.createRef();
	const requestIconRef: any = React.createRef();

	useEffect(
		() => {
			const callAsyncFunc = async () => {
				try {
					if (searchValue.length !== 0 && state.accessToken) {
						const config = {
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${state.accessToken}`
							}
						};
						const response = await axios.get(`http://localhost:8000/user/profile/${searchValue}`, config);
						if (response.data.user.length === 0) {
							setError('No user was found');
						}

						setFoundUsers(response.data.user);
					}
					setLoading(false);
				} catch (error) {
					setError(false);
					return;
				}
			};
			callAsyncFunc();
			return () => {
				setError('');
			};
		},
		[ searchValue, state.accessToken ]
	);

	useEffect(
		() => {
			const callAsyncFunc = async () => {
				try {
					if (state.accessToken) {
						const config = {
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${state.accessToken}`
							}
						};
						const response = await axios.get(
							`http://localhost:8000/user/get/notifications/requests`,
							config
						);

						setNotificationsAmount(response.data.notificationsAmount);
						setFriendRequestsAmount(response.data.friendRequestsAmount);
					}
					setLoading(false);
				} catch (error) {
					setError(false);
					return;
				}
			};
			callAsyncFunc();
		},
		[ state.accessToken, notificationsAmount, friendRequestsAmount ]
	);

	onClickOutside(menuRef, () => setMenuOpen(false));

	const logoutFunc = () => {
		localStorage.removeItem('quack-app-id');
		dispatch({ type: 'LOGGED_OUT' });
		setRedirect(true);
	};

	const searchValueSetFunc = (value: string) => {
		clearTimeout(delayTimer);
		setLoading(true);
		delayTimer = setTimeout(function() {
			setSearchValue(value);
		}, 1000);
	};

	const notificationBellFunc = async () => {
		bellIconRef.current.classList.toggle('active');
		bellMenuRef.current.classList.toggle('active');

		if (bellIconRef.current.classList.contains('active') && requestMenuRef.current.classList.contains('active')) {
			requestMenuRef.current.classList.toggle('active');
			requestIconRef.current.classList.toggle('active');
		}

		if (bellIconRef.current.classList.contains('active') && notificationsAmount > 0) {
			try {
				if (state.accessToken) {
					const config = {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${state.accessToken}`
						}
					};
					setNotificationLoading(true);
					const response = await axios.get(`http://localhost:8000/user/get/notifications`, config);

					const data = response.data.notifications;

					const sortedNotifications = data.sort(function(a, b) {
						let c: any = new Date(a.notification_created_at);
						let d: any = new Date(b.notification_created_at);
						return d - c;
					});

					setNotifications(sortedNotifications);
				}
				setNotificationLoading(false);
			} catch (error) {
				setError(false);
				return;
			}
		}
	};

	useEffect(
		() => {
			if (state.darkMode) {
				document.body.classList.add('darkMode');
			}

			return () => {
				document.body.classList.remove('darkMode');
			};
		},
		[ state.darkMode ]
	);

	const friendRequestsFunc = async () => {
		requestMenuRef.current.classList.toggle('active');
		requestIconRef.current.classList.toggle('active');

		if (bellIconRef.current.classList.contains('active') && requestMenuRef.current.classList.contains('active')) {
			bellMenuRef.current.classList.toggle('active');
			bellIconRef.current.classList.toggle('active');
		}

		if (requestIconRef.current.classList.contains('active') && friendRequestsAmount > 0) {
			try {
				if (state.accessToken) {
					const config = {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${state.accessToken}`
						}
					};
					setFriendRequestsLoading(true);
					const response = await axios.get(`http://localhost:8000/user/friends/get/requested/${4}`, config);

					const data = response.data.users;

					setRequestedUsers(data);
				}
				setFriendRequestsLoading(false);
			} catch (error) {
				console.log(error);
				setError(false);
				return;
			}
		}
	};

	const checkNotificatioNStatus = (status) => {
		let answer: string;

		switch (status) {
			case 1:
				answer = "want's to add you";
				break;
			case 2:
				answer = 'accepted your friend request';
				break;
			case 3:
				answer = 'declined your friend request';
				break;
			default:
				answer = 'an error occurred';
		}

		return answer;
	};

	const deleteNotifications = async () => {
		try {
			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};
			await axios.delete(`http://localhost:8000/user/delete/notifications`, config);

			setNotifications([]);
			setNotificationsAmount(0);
		} catch (error) {
			console.log(error);
			return;
		}
	};

	const changeModeFunc = async () => {
		try {
			const config = {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${state.accessToken}`
				}
			};

			const data = {
				darkMode: !state.darkMode
			};

			const response = await axios.put('http://localhost:8000/account/change/mode', data, config);

			const localStorageItem: any = localStorage.getItem('quack-app-id');

			if (localStorageItem) {
				const localStorageData: SystemState = JSON.parse(localStorageItem);

				const newObject: SystemState = localStorageData;

				newObject.darkMode = response.data.darkMode;

				localStorage.setItem('quack-app-id', JSON.stringify(newObject));

				dispatch({ type: 'CHANGE_MODE', payload: response.data.darkMode });
			}
		} catch (error) {
			console.log(error);
			return;
		}
	};

	return (
		<nav className="navbar">
			<div className="logo">
				<Link to="/">
					<img src={Logo} alt="logo" />
				</Link>
			</div>
			<div className="navbar__center-content middle-container">
				{redirect && <Redirect to="/user/login" />}
				<NavLink activeClassName="active-navbar" to="/" exact>
					<div className="navbar__center-content__home-icon">
						<img ref={imageRef} src={homeIcon} alt="home" />
					</div>
				</NavLink>
				<div className="navbar__center-content__input-container">
					<div className="navbar__center-content__input-container__input">
						<img src={searchIcon} alt="search" />
						<input
							type="search"
							placeholder="search..."
							onChange={(e) => searchValueSetFunc(e.target.value)}
						/>
					</div>
					<ul className="search-menu-input">
						{error && !loading ? (
							<li className="searchbar-status">User was not found</li>
						) : !error && !loading ? (
							''
						) : (
							<li className="searchbar-status">Loading...</li>
						)}
						{foundUsers && searchValue ? (
							foundUsers.map((data: any): JSX.Element => {
								return <Search key={'foundUsers' + data.id} {...data} />;
							})
						) : (
							''
						)}
						{/* {foundUsers && !error && foundUsers.length >= 4 && searchValue ? (
							<Link to={`/search/all/${searchValue}`}>
								<li className="show-all-users">Show all users</li>
							</Link>
						) : (
							''
						)} */}
					</ul>
				</div>
				<div className="navbar__center-content__settings">
					<div className="navbar__center-content__settings__bell">
						{notificationsAmount > 0 && (
							<div
								className="navbar__center-content__settings__bell__number"
								onClick={() => notificationBellFunc()}
							>
								{notificationsAmount}
							</div>
						)}
						<img
							className="whiteIcon"
							ref={bellIconRef}
							src={bellIcon}
							alt="bell"
							onClick={() => notificationBellFunc()}
						/>
						<ul ref={bellMenuRef} className="bell-menu-navbar">
							<h2>Notifications</h2>
							{notifications.length === 0 && !notificationLoading ? (
								<h6>You have 0 new notifications</h6>
							) : (
								''
							)}

							{notificationLoading && notifications.length === 0 ? (
								<div className="no-posts">Loading...</div>
							) : (
								''
							)}

							<div className="notifications-content">
								{notifications &&
									notifications.map((notification) => {
										if (notification.notification_status === 0) {
											return (
												<li key={'notificationID' + notification.notification_main_id}>
													<div className="global-notification">
														<p>{notification.notification_description}</p>
														<h4>
															{formatCommentDateFunc(
																notification.notification_created_at
															)}
														</h4>
													</div>
												</li>
											);
										} else {
											return (
												<li key={'notificationID' + notification.notification_main_id}>
													<div className="notification-left">
														<div className="notification-left__notification-img">
															<Link to={`/profile/search/${notification.username}`}>
																<img
																	src={profileImgFunc(
																		notification.profile_img,
																		notification.gender,
																		false
																	)}
																	alt="profileimg"
																/>
															</Link>
														</div>
														<p>
															{formatCommentDateFunc(
																notification.notification_created_at
															)}
														</p>
													</div>

													<p className="notification-text">
														<span>
															{notification.firstname + ' ' + notification.lastname + ' '}
														</span>
														{checkNotificatioNStatus(notification.notification_status)}
													</p>
												</li>
											);
										}
									})}
							</div>
							{notifications.length > 0 && !notificationLoading ? (
								<button
									className="delete-bell-button"
									type="button"
									onClick={() => deleteNotifications()}
								>
									Delete notifications
								</button>
							) : (
								''
							)}
						</ul>
					</div>
					<div className="navbar__center-content__settings__requests">
						{friendRequestsAmount > 0 && (
							<div
								className="navbar__center-content__settings__bell__number"
								onClick={() => friendRequestsFunc()}
							>
								{friendRequestsAmount}
							</div>
						)}

						<img
							ref={requestIconRef}
							onClick={() => friendRequestsFunc()}
							className="whiteIcon"
							src={chatIcon}
							alt="chat"
						/>
						<ul ref={requestMenuRef} className="request-menu-navbar">
							<h2>Friend requests</h2>
							{requestedUsers.length === 0 && !friendRequestsLoading ? (
								<h6>You have 0 friend requests</h6>
							) : (
								''
							)}

							{friendRequestsLoading && requestedUsers.length === 0 ? (
								<div className="no-posts">Loading...</div>
							) : (
								''
							)}

							{requestedUsers &&
								requestedUsers.map((user) => {
									return <InvitesC key={'requestedUsers' + user.user_main_id} {...user} />;
								})}

							{friendRequestsAmount > 4 && !friendRequestsLoading ? (
								<Link to="/account/friend/requests" className="delete-bell-button">
									Show All
								</Link>
							) : (
								''
							)}
						</ul>
					</div>
					<div>
						<NavLink activeClassName="active-navbar" to={`/user/profile/${state.username}`} exact>
							<img className="whiteIcon" src={profileIcon} alt="profile" />
						</NavLink>
					</div>
				</div>
			</div>
			<React.Fragment>
				{(state.gender || state.profileImg) && (
					<div className="navbar-menu">
						<div className="profile-img" onClick={() => setMenuOpen(true)}>
							<img src={profileImgFunc(state.profileImg, state.gender, false)} alt="profileImg" />
						</div>
						{isMenuOpen && (
							<ul ref={menuRef} className="navbar-menu__profile-menu">
								<li className="logged-as">
									Logged in as <b>{state.firstname + ' ' + state.lastname}</b>
								</li>
								<Link to={`/user/profile/${state.username}`}>
									<li>
										Profile
										<span> &gt; </span>
									</li>
								</Link>
								<Link to="/account/edit">
									<li>
										Settings
										<span> &gt; </span>
									</li>
								</Link>
								<Link to="/chat">
									<li>
										Quackenger
										<span> &gt; </span>
									</li>
								</Link>
								
								<li>
									<button type="button" onClick={() => changeModeFunc()}>
										<span>Dark Mode</span>
										<span> &gt; </span>
									</button>
								</li>
								<li>
									<button type="button" onClick={() => logoutFunc()}>
										<span>Logout</span>
										<span> &gt; </span>
									</button>
								</li>
							</ul>
						)}
					</div>
				)}
			</React.Fragment>
		</nav>
	);
};

export default Navbar;
