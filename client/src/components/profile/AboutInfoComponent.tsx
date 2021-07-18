import React, { useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../allReducers';
import { SystemState } from '../../store/system/types';

export interface AboutInfoComponentProps {
	userID: string;
}

const AboutInfoComponent: React.FC<AboutInfoComponentProps> = (props: AboutInfoComponentProps) => {
	const isLoggedState: any = useSelector<RootState>((state: RootState) => state.isLogged);

	useEffect(
		() => {
			const source = axios.CancelToken.source();

			const fetchData = async () => {
				try {
					const config = {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${isLoggedState.accessToken}`
						},
						token: source.token
					};

					const response = await axios.get(
						`http://localhost:8000/about/profile/about/${props.userID}`,
						config
					);
				} catch (error) {
					if (axios.isCancel(error)) {
						console.log(error);
						return;
					}
				}
			};
			fetchData();

			return () => {
				source.cancel();
			};
		},
		[ props, isLoggedState.accessToken ]
	);

	return <div className="no-posts">No information was entered</div>;
};

export default AboutInfoComponent;
