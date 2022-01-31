import React, {Component} from 'react';
import {HashRouter, Route} from 'react-router-dom';
import { Nav, Navbar, Form, FormControl, Button, Checkbox } from 'react-bootstrap';
import $ from 'jquery';
import axios from 'axios';
let ths, store;
export default class HtU extends Component {
    constructor(props) {
        super(props);
        ths = this;
        store = this.props.store;
    }
    enableScrolling() {
        $('body').css({
            overflow: 'visible'
        })
    }
    render() {
        this.enableScrolling();
        return (
            <div style={{textAlign: 'center'}}>
                <h1>Docs:</h1>
                <hr/>
                <h1>How to Create Objects:</h1>
                <br/>
                <h3>1. Click on the menu button on the top left of the screen.</h3>
                <br/>
                <h3>2. Click on Create.</h3>
                <br/>
                <h3>3. Click Create Object.</h3>
                <br/>
                <h3>4. Click on the thing in the middle of the screen.</h3>
                <br/>
                <h3>5. Create a Cube or a Sphere</h3>
                <hr/>
                <h1>How to Create a Game:</h1>
                <br/>
                <h3>1. Click on the menu button on the top left of the screen.</h3>
                <br/>
                <h3>2. Click on Create.</h3>
                <br/>
                <h3>3. Click Create Game.</h3>
                <br/>
                <h3>4. Click on the thing in the middle of the screen.</h3>
                <br/>
                <h3>5. Search for Objects to add.</h3>
                <hr/>
                <h1>How to Control a Shape/Object:</h1>
                <h2>How to Move a Shape/Object:</h2>
                <br/>
                <h3>Click on the red lines and drag your mouse to move the shape.</h3>
                <h4>(Press r to switch to rotating and/or moving)</h4>
                <h4>(Press s to switch to changing size/or moving)/h4>
                <br/>
            </div>
        )
    }
}
