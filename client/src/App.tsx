import React from 'react';

// modules
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// css
import './style/css/main.css';
import 'react-slideshow-image/dist/styles.css';

// components
import Error404 from './components/pages/Error404';
import MainPage from './components/pages/main/Main';
import LoginPage from './components/pages/main/Login';
import SearchPage from './components/pages/profile/SearchProfile';
import ProtectedRoute from './protectedRoute';
import MainProfile from './components/pages/profile/Profile';
import EditPassword from './components/pages/profile/Password';
import ProfilePage from './components/pages/profile/Account';
import Relationship from './components/pages/relationships/Relationship';
import SearchUsers from './components/pages/SearchUsers';
import Settings from './components/pages/profile/Settings';
import FullChat from './components/chat/FullChat';

export interface AppProps {}

const App: React.FC<AppProps> = () => {
	return (
		<Router>
			<Switch>
				<ProtectedRoute chat={true} navbar={true} path="/" exact component={MainPage} />
				<ProtectedRoute chat={true} navbar={true} path="/profile/search/:username" exact component={SearchPage} />
				<ProtectedRoute chat={true} navbar={true} path="/user/profile/:username" exact component={MainProfile} />
				<ProtectedRoute chat={true} navbar={true} path="/search/all/:username" exact component={SearchUsers} />
				<ProtectedRoute chat={true} navbar={true} path="/account/edit" exact component={ProfilePage} />
				<ProtectedRoute chat={true} navbar={true} path="/account/edit/password" exact component={EditPassword} />
				<ProtectedRoute chat={true} navbar={true} path="/account/edit/settings" exact component={Settings} />
				<ProtectedRoute chat={true} navbar={true} path="/account/friend/requests" exact component={Relationship} />
				<ProtectedRoute chat={false} navbar={true} path="/chat" exact component={FullChat} />
				<Route path="/user/login" exact component={LoginPage} />
				<Route path="*" component={Error404} />
			</Switch>
		</Router>
	);
};

export default App;
