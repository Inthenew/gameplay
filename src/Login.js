import React, {Component} from 'react';
import {HashRouter, Route} from 'react-router-dom';
import { Nav, Navbar, Form, FormControl, Button, Checkbox } from 'react-bootstrap';
import $ from 'jquery';
import axios from 'axios';
import GoogleLogin from "react-google-login";
let ths, store;
class Login extends Component {
    constructor(props) {
        super(props);
        ths = this;
        store = this.props.store;
    }
    onKeyDown(e) {
        if (e.key === 'Enter') {
            ths.submit();
        }
    }
    submit() {
        let user = document.getElementById('username').value;
        let pass = document.getElementById('password').value;
        if (localStorage.getItem('_id') === null) {
            axios.post('https://gameplay2.glitch.me/api/sessions', {
                user: user,
                pass: pass,
                trusted: true,
                userID: undefined
            }).then(function (res) {
                if (res.data.state2 === 'Good') {
                    $('#errhandler').text('Logged in!');
                    localStorage.setItem('Username', user);
                    localStorage.setItem('_id', res.data.ID2);
                    localStorage.setItem('fromGoogle', false);<h9 style={{ position: 'absolute', right: '30px', top: '30px' }}>Your logged in as {localStorage.getItem('Username')}</h9>
                    document.getElementById('info23').innerHTML = `<h9 style="position: absolute; right: 30px; top: 30px">Your logged in as ${localStorage.getItem('Username')}</h9>`;
                    window.location = `${location.protocol}//${location.host}/#/create/`;
                } else if (res.data.state2 === 'Wrong Username or Password!') {
                    $('#errhandler').text('Wrong Username or Password!');
                } else {
                    $('#errhandler').text('There was an error, try again later :(');
                    console.log(res.data);
                }
            }).catch(err => {
                console.error(err);
                $('#errhandler').text('There was an error, try again later :(');
            })
        } else {
            $('#errhandler').text('Your already logged in!');
        }
    }
    responseGoogle(response) {
        if (localStorage.getItem('_id') === null) {
            axios.post('https://gameplay2.glitch.me/api/sessions', {
                user: response.profileObj.givenName,
                pass: null,
                trusted: true,
                userID: response.googleId
            }).then(function (res) {
                if (res.data === 'Good') {
                    $('#errhandler').text('Logged in!');
                    localStorage.setItem('Username', response.profileObj.givenName);
                    localStorage.setItem('_id', response.googleId);
                    localStorage.setItem('fromGoogle', true);
                    document.getElementById('info23').innerHTML = `<h9 style="position: absolute; right: 30px; top: 30px">Your logged in as ${localStorage.getItem('Username')}</h9>`;
                    window.location = `${location.protocol}//${location.host}/#/create/`;
                } else if (res.data === 'Wrong Username or Password!') {
                    $('#errhandler').text('Wrong Username or Password!');
                } else {
                    $('#errhandler').text('There was an error, try again later :(');
                    console.log(res.data);
                }
            }).catch(err => {
                console.error(err);
                $('#errhandler').text('There was an error, try again later :(');
            })
        } else {
            $('#errhandler').text('Your already logged in!');
        }
    }
    googleFail(response) {
        console.error(response);
        $('#errhandler').text('There was an error, try again later :(');
    }
    goToSignUp(e) {
        window.location='https://gameplay.netlify.app/#/signup';
    }
    render() {
        return (
            <div style={{textAlign: 'center'}}>
                <h1>Login:</h1>
                <hr style={{width: '30%',  display: 'inline-block'}}/>
                <br/>
                <FormControl style={{width: '25%',  display: 'inline-block'}} type="text" placeholder="username" className="username" id="username" />
                <br/>
                <br/>
                <FormControl style={{width: '25%',  display: 'inline-block'}} type="password" placeholder="password" className="password" id="password" onKeyDown={this.onKeyDown}/>
                <br/>
                <br/>
                <Button variant="outline-success" bsSize="lg" onClick={this.submit} onTouchEnd={this.submit} >Login</Button>
                <br/>
                <br/>
                <GoogleLogin
                    clientId="161290771874-e3lom8k028vmq8ktifj8aii8t69vh26b.apps.googleusercontent.com"
                    buttonText="Login With Google"
                    onSuccess={this.responseGoogle}
                    onFailure={this.googleFail}
                    cookiePolicy={'single_host_origin'}
                />
                <p id="errhandler"></p>
                <h9>Don't have an account? <br/><br/><Button variant="outline-success" bsSize="lg" onClick={this.goToSignUp} onTouchEnd={this.goToSignUp} >Sign Up</Button></h9>
            </div>
        )
    }
}
export default Login;
