import React, { Component } from 'react';
import { Nav, Navbar, Form, FormControl, Button, Collapse } from 'react-bootstrap';
import { HashRouter, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import $ from 'jquery';
let ths;
let ths2;
let fixed = false;
class TopBar extends Component {
    constructor(props) {
        super(props);
        ths2 = this;
    }
    pop(e) {
        if (!window.vis) {
            window.vis = true;
            document.getElementById('sidebarloc').innerHTML = `<div id="sidebar"><a id="s1" href="/#" class="s btn btn-outline-success">Home</a><br/><br/><a id="s2" href="/#/signup" class="s btn btn-outline-success">Sign Up</a><br/><br/><a id="s3" href="/#/login" class="s btn btn-outline-success">login</a><br/><br/> <a id="s3" href="/#/logout" class="s btn btn-outline-success">Log Out</a><br/><br/> <a id="s4" href="/#/create" class="s btn btn-outline-success">Create</a><br/><br/><a id="s5" href="/#/how2use" class="s btn btn-outline-success">Docs</a><br/><br/></div>`;
            $('#fakesidebar').css({
                visibility: 'visible'
            })
        } else if (window.vis) {
            window.vis = false;
            $('#fakesidebar').css({
                visibility: 'hidden'
            })
            if (document.getElementById('sidebar') !== null && typeof document.getElementById('sidebar') !== 'undefined') {
                document.getElementById('sidebar').remove();
            }
        }
    }
    onkeyDown(e) {
        /*
        if (e.key === 'Enter') {
            let search = document.getElementById('search');
            let text = search.value;
            setTimeout(function () {
                location.reload();
            }, 200)
            window.location.pathname = `/#/search/${text}`;
        }
        */

    }
    render() {
        window.vis = false;
        if (localStorage.getItem('Username') !== null) {
            return (
                <div>
                    <ul id="nav">
                        <br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<Button variant="outline-success" onClick={this.pop} id="options"><img width="40" height="40" src="https://cdn.glitch.me/bf9f93cf-3c4b-42bf-871f-45289c6ff471/more.png?v=1640205361426"/></Button>&nbsp;&nbsp;&nbsp;
                        <FormControl style={{width: '30%', selfAlign: 'center', display: 'inline-block',   position: 'absolute', left: '35%'}} type="text" onKeyDown={this.onkeyDown} placeholder="Search" className="" id="search"/>
                        <br/>
                        <br/>
                    </ul>
                    <div id="info23">
                        <h9 style={{ position: 'absolute', right: '30px', top: '30px' }}>Your logged in as {localStorage.getItem('Username')}</h9>
                    </div>
                    <div id="sidebarloc">
                    </div>
                    <div id="fakesidebar"></div>
                </div>
            );
        } else {
            return (
                <div>
                    <ul id="nav">
                        <br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<Button variant="outline-success" onClick={this.pop} id="options"><img width="40" height="40" src="https://cdn.glitch.me/bf9f93cf-3c4b-42bf-871f-45289c6ff471/more.png?v=1640205361426"/></Button>&nbsp;&nbsp;&nbsp;
                        <FormControl style={{width: '30%', selfAlign: 'center', display: 'inline-block',   position: 'absolute', left: '35%'}} type="text" onKeyDown={this.onkeyDown} placeholder="Search" className="" id="search"/>
                        <br/>
                        <br/>
                        <div id="info23">
                            <Button variant="outline-success" href="/#/login/" style={{ position: 'absolute', right: '30px', top: '30px' }} id="Login2">Login</Button>
                        </div>
                    </ul>
                    <div id="sidebarloc">
                    </div>
                    <div id="fakesidebar"></div>
                </div>
            );
        }
    }
}
export default TopBar;
