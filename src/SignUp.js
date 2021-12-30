import React, {Component} from 'react';
import {HashRouter, Route} from 'react-router-dom';
import { Nav, Navbar, Form, FormControl, Button, Checkbox } from 'react-bootstrap';
import $ from 'jquery';
import axios from 'axios';
import GoogleLogin from "react-google-login";
let ths, store;
let parseDocumentCookie = () => {
    let finObj = {};
    document.cookie.split(';').map(function (c) {
        return c.trim().split('=').map(decodeURIComponent);
    }).reduce(function (a, b) {
        try {
            a[b[0]] = JSON.parse(b[1]);
        } catch (e) {
            a[b[0]] = b[1];
        }
        finObj = a;
        return a;
    }, {});
    return finObj;
}

class SignUp extends Component {
    constructor(props) {
        super(props);
        ths = this;
        document.body.addEventListener('click', () => {}, false)
        store = this.props.store;
    }
    onKeyDown(e) {
        if (e.key === 'Enter') {
            ths.sumbit();
        }
    }
    sumbit(e) {
        let user = document.getElementById('username').value;
        let pass = document.getElementById('password').value;
        if (localStorage.getItem('_id') === null) {
            axios.post('https://gameplay2.glitch.me/api/users', {
                user: user,
                pass: pass,
                trusted: true,
                userID: undefined
            }).then(function (res) {
                if (res.data.state2 === 'Good') {
                    $('#errhandler').text('Signed up!');
                    localStorage.setItem('Username', user);
                    localStorage.setItem('_id', res.data.ID2);
                    localStorage.setItem('fromGoogle', false);
                    document.getElementById('info23').innerHTML = `<h9 style="position: absolute; right: 30px; top: 30px">Your logged in as ${localStorage.getItem('Username')}</h9>`;
                    window.location = `${location.protocol}//${location.host}/#/create/`;
                } else if (res.data.state2 === 'Account exists!') {
                    $('#errhandler').text('Account exists!');
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
        console.log(response);
        if (localStorage.getItem('_id') === null) {
            axios.post('https://gameplay2.glitch.me/api/users', {
                user: response.profileObj.givenName,
                pass: null,
                trusted: true,
                userID: response.googleId
            }).then(function (res) {
                if (res.data === 'Good') {
                    $('#errhandler').text('Signed up!');
                    localStorage.setItem('Username', response.profileObj.givenName);
                    localStorage.setItem('_id', response.googleId);
                    localStorage.setItem('fromGoogle', true);
                    document.getElementById('info23').innerHTML = `<h9 style="position: absolute; right: 30px; top: 30px">Your logged in as ${localStorage.getItem('Username')}</h9>`;
                    window.location = `${location.protocol}//${location.host}/#/create/`;
                } else if (res.data === 'Account exists!') {
                    $('#errhandler').text('Account exists!');
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
    goToLogin(e) {
        window.location='https://gameplay.netlify.app/#/login';
    }
    render() {
        return (
            <div style={{textAlign: 'center'}}>
                <h1>Sign up:</h1>
                <hr style={{width: '30%',  display: 'inline-block'}}/>
                <br/>
                <FormControl style={{width: '25%',  display: 'inline-block'}} type="text" placeholder="username" className="username" id="username" />
                <br/>
                <br/>
                <FormControl style={{width: '25%',  display: 'inline-block'}} type="password" placeholder="password" className="password" id="password" onKeyDown={this.onKeyDown}/>
                <br/>
                <br/>
                <Button variant="outline-success" bsSize="lg" onClick={this.sumbit} onTouchEnd={this.sumbit} >Sign up</Button>
                <br/>
                <br/>
                <GoogleLogin
                    clientId="161290771874-q842frbpe9dbj8gck45p81q01p0965l5.apps.googleusercontent.com"
                    buttonText="Sign Up With Google"
                    onSuccess={this.responseGoogle}
                    onFailure={this.googleFail}
                    cookiePolicy={'single_host_origin'}
                />
                <br/>
                <p id="errhandler"></p>
                <h5>Have an account? <br/><br/><Button variant="outline-success" bsSize="lg" onClick={this.goToLogin} onTouchEnd={this.goToLogin} >Login</Button></h5>
            </div>
        )
    }
}
export default SignUp;
