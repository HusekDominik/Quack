import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import allReducers from './allReducers';

const store = createStore(allReducers);

const body = document.querySelector('#root');

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	body
);
