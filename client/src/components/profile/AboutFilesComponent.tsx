import React, { useEffect, useState } from 'react';
import { RootState } from '../../allReducers';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { SystemState } from '../../store/system/types';
import mp4Icon from '../../images/mp4-video.png';
import mp3Icon from '../../images/mp3-audio-file.png';

export interface AboutPhotosComponentProps {
	userID: number;
}

const AboutPhotosComponent: React.FC<AboutPhotosComponentProps> = (props) => {
	const { userID } = props;
	const state: any = useSelector<SystemState>((state: any) => state.isLogged);
	const [ files, setFiles ] = useState([]);
	const [ loading, setLoading ] = useState(true);

	useEffect(
		() => {
			const source = axios.CancelToken.source();

			const fetchData = async () => {
				try {
					const config = {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${state.accessToken}`
						},
						cancelToken: source.token
					};

					const response = await axios.get(`http://localhost:8000/about/profile/files/${userID}`, config);

					setLoading(false);

					setFiles(response.data.photos);
				} catch (error) {
					if (axios.isCancel(error)) {
						return;
					}
				}
			};
			fetchData();

			return () => {
				source.cancel();
			};
		},
		[ userID, state.accessToken ]
	);

	return (
		<React.Fragment>
			<div className="about-photos-container">
				{files &&
					files.map((photoArray: any) => {
						return photoArray.image.map((photo, index) => {
							let photoPath = `http://localhost:8000/${photo}`;
							const sufix = photo.slice(photo.indexOf('.'));
							if (sufix === '.mp3') {
								photoPath = mp3Icon;
							} else if (sufix === '.mp4') {
								photoPath = mp4Icon;
							}
							return (
								<div
									className="about-photos-container__photo-container"
									key={'photo' + photoArray.post_id_main + index}
								>
									<a target="_blank" href={`http://localhost:8000/${photo}`} rel="noreferrer">
										<img src={photoPath} alt="file" />
									</a>
								</div>
							);
						});
					})}
			</div>
			{!loading && files.length < 1 && <div className="no-posts">No files have been uploaded</div>}
		</React.Fragment>
	);
};
export default AboutPhotosComponent;
