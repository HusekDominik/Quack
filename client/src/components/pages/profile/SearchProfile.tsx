import React from 'react';
import SearchProfileComponent from '../../profile/SearchProfileComponent';

export interface Pepega {
	match?;
}

const SearchProfile: React.FC<Pepega> = (props) => {
	return <SearchProfileComponent key={'searchedProfile ' + props.match.params.username} {...props} />;
};

export default SearchProfile;
