import React, {Component} from 'react';
import {HashRouter, Route} from 'react-router-dom';
import { Nav, Navbar, Form, FormControl, Button, Checkbox } from 'react-bootstrap';
import $ from 'jquery';
import axios from 'axios';
import TopBar from './TopBar.js';
import Home from './Home.js';
import Login from './Login.js';
import SignUp from './SignUp.js'
import Logout from './Logout.js';
import Create from './Create.js';
import HtU  from './HtU.js';
let ths;
let store;
class App extends Component {
    constructor(props) {
        super(props);
        ths = this;
        store = this.props.store;
    }
    render() {
        return (
            <div>
                <TopBar/>
                <HashRouter> <div>
                    <Route exact path="/"><Home /></Route>
                    <Route path="/signup"><SignUp store={this.props.store} /></Route>
                    <Route path="/login"><Login store={this.props.store} /></Route>
                    <Route path="/logout"><Logout store={this.props.store} /></Route>
                    <Route path="/create"><Create store={this.props.store}/></Route>
                    <Route path="/how2use"><HtU store={this.props.store}/></Route>
                </div> </HashRouter>
            </div>
        );
    }
}
export default App;
