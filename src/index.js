import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import axios from 'axios';
import { createStore } from 'redux';
import $ from 'jquery';
import './bootsrapcss/bootstrap.css';
import './bootsrapcss/bootstrap-theme.css';
import './index.css';
let info = {
    username: undefined,
    password: undefined,
    cookies: 0,
}
let startState = (state = info, action) => {
    switch (action.type) {
        case 'Login':
            return {
                username: action.username,
                password: action.password,
                cookies: action.cookies,
            }
            break;
        case 'Logout':
            return {
                username: undefined,
                password: undefined,
                cookies: 0,
            }
            break;
    }
}
let store = createStore(startState);
ReactDOM.render(<App store={store} />, document.getElementById('root'));