import React, {Component} from 'react';
import $ from 'jquery';
import axios from 'axios';
import ejs from 'ejs';
let util = require('util');
let ths, store;
class Home extends Component {
    constructor(props) {
        super(props);
        ths = this;
        store = this.props.store;
    }
    getGames() {
        $(document).ready(function () {
            $('body').css({
                overflow: 'scroll'
            })
            axios.post('/api/getallgames', {}).then(res => {
                if (res.data.stat === 'Good') {
                    for (const game of res.data.games) {
                        let name = game.name;
                        let code = game.game;
                        let l = code.length;
                        let l2 = 0;
                        function gC() {
                            return code[l2++];
                        }
                        document.getElementById('games').innerHTML += `<a id="name${name}" class="games btn btn-outline-success"><h3>${name}</h3></a>`;
                        setTimeout(function () {
                            if (window.location.pathname === '/#/' || window.location.pathname === '/#' || window.location.pathname === '/') {
                                document.getElementById(`name${name}`).onclick = function () {
                                    window.location.href = `https://gamebuild.netlify.app/${name}`;
                                }
                            }
                        }, 200)
                    }
        }
        })
    })
}
render() {
    this.getGames();
    /** USE class .games For Styling every Game!!! **/
    return (
        <div style={{marginLeft: '13px'}}>
            <h1>Games for you:</h1>
            <div id="games">
            </div>
        </div>
    )
}
}
export default Home;
