import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export interface AccountProps {}

const AccountComponent: React.FC<AccountProps> = () => {
	return (
		<div className="account-settings">
			<ul>
				<li>
					<NavLink activeClassName="active" to="/account/edit" exact>
						Profile
					</NavLink>
				</li>

				<li>
					<NavLink activeClassName="active" to="/account/edit/password" exact>
						Password
					</NavLink>
				</li>
				<li>
					<NavLink activeClassName="active" to="/account/edit/settings" exact>
						Settings
					</NavLink>
				</li>
			</ul>
		</div>
	);
};

export default AccountComponent;
