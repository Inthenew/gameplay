import React, {Component} from 'react';
import {HashRouter, Route} from 'react-router-dom';
import { Nav, Navbar, Form, FormControl, Button, Checkbox } from 'react-bootstrap';
import $ from 'jquery';
import axios from 'axios';
let ths, store;
class Home extends Component {
    constructor(props) {
        super(props);
        ths = this;
        document.body.addEventListener('click', () => {}, false)
        store = this.props.store;
    }
    submit() {
        if (localStorage.getItem('_id') !== null) {
                localStorage.removeItem('_id');
                localStorage.removeItem('Username');
                $('#result').text(`Logged Out!`);
                document.getElementById('info23').innerHTML = '<a id="Login2" href="/#/login/" style="position: absolute; right: 30px; top: 30px" class="s btn btn-outline-success">Login</a>';
        } else {
            $('#result').text(`You don't have an account!`);
        }
    }
    render() {
        return (
            <div style={{textAlign: 'center'}}>
                <h1>Logout:</h1>
                <hr style={{width: '30%',  display: 'inline-block'}}/>
                <br/>
                <Button variant="outline-success" style={{width: '40%'}} bsSize="lg" onClick={this.submit}>Logout</Button>
                <br/>
                <p id="result"></p>
            </div>
        )
    }
}
export default Home;