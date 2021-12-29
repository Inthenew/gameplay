let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
let axios = require('axios');
let cookieParser = require('cookie-parser');
let cookie = require('cookie');
let app = express();
const {networkInterfaces} = require('os');
var cors = require('cors');
app.use(cors());
const nets = networkInterfaces();
const results = Object.create(null);
let ejs = require('ejs');
app.use(cookieParser());
function sleep(secs) {
    let before = Date.now()
    while (Date.now() < before + (secs * 1000)) {}
}
let vers = [];
let server = require('http').createServer(app).listen(8080, function () {
    console.log('listening');
})
let users = [];
let sessions = [];
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/api/users', async function (req, res) {
    let user = req.body.user;
    let pass = req.body.pass;
    let trusted = req.body.trusted;
    let ID = req.body.userID;
    let fromGoogle = false;
    let good = false;
    let fins = false;
    if (typeof trusted === 'boolean') {
        if (typeof ID === 'string') {
            fromGoogle = true;
        }
        if (fromGoogle) {
            await app2.db.find({user: user, ID2: ID}).toArray((err, d) => {
                if (err) {
                    throw err;
                }
                if (d[0] !== null && typeof d[0] !== "undefined") {
                    fins = true;
                    fin(false);
                } else {
                    l23();
                }
            })
            function l23() {
                app2.db.insertOne({class: 'Google', user: user, objects: [], games: [], ID2: ID}, function (err, d) {
                    if (err) {
                        good = false;
                        throw err;
                    }
                    good = true;
                })
                users.push({fromGoogle: true, user: user, id: ID});
                res.cookie('_id', ID, {maxAge: 43200000, httpOnly: false});
                sessions.push({fromGoogle: true, user: user, id: ID});
                fin(true);
            }
        } else {
            await app2.db.find({user: user}).toArray((err, d) => {
                if (err) {
                    throw err;
                }
                if (d[0] !== null && typeof d[0] !== "undefined") {
                    fins = true;
                    fin2(false);
                } else {
                    SignUp();
                }
            })
            function SignUp() {
                app2.db.insertOne({class: 'User', user: user, pass: pass, objects: [], games: [], ID2: undefined}, function (err, d) {
                    if (err) {
                        good = false;
                        throw err;
                    }
                    good = true;
                    ID = d.insertedId;
                    app2.db.findOneAndUpdate({user: user}, {$set: {ID2: ID}});
                    users.push({fromGoogle: false, user: user, pass: pass, id: ID});
                    res.cookie('_id', ID, {maxAge: 43200000, httpOnly: false });
                    sessions.push({fromGoogle: false, user: user, pass: pass, id: ID});
                    fin2(true);
                })
            }
        }
    } else {
        return res.send('Hello!');
    }
    function fin2(good) {
        if (good) {
            res.send({
                state2: 'Good',
                ID2: ID
            });
            res.end()
        } else {
            res.send({state2: 'Account exists!'});
            res.end();
        }
    }
    function fin(good) {
        if (good) {
            res.send('Good');
            res.end()
        } else {
            res.send('Account exists!');
            res.end();
        }
    }
})
app.post('/api/objects', async function (req, res) {
    let user = req.body.user;
    let ID = req.body.ID;
    let fromGoogle = req.body.fromGoogle;
    let classID = null;
    if (fromGoogle) {
        classID = 'Google'
    } else {
        classID = 'User';
    }
    let objects23 = [];
    await app2.db.find().toArray(async (err, results) => {
        if (err) throw err;
        for (const result of results) {
            if (result.user === user) {
                for (const object of result.objects) {
                    objects23.push(object);
                }
                fin(true);
            }
        }
    })
    function fin(good) {
        if (good) {
            res.send({stat: 'Good', objects: objects23});
            res.end();
        } else {
            res.send({stat: 'Bad'});
            res.end();
        }
    }
})
app.post('/api/objects2', async function (req, res) {
    let search = req.body.search.toLowerCase();
    let objects23 = [];
    await app2.db.find().toArray(async (err, results) => {
        if (err) throw err;
        for (const result of results) {
            for (const object of result.objects) {
                let name = object.name.toLowerCase();
                let result = search2(search, name);
                if (result) {
                    objects23.push(object);
                }
            }
        }
        fin(true);
    })
    function search2(search, name) {
        let lc = 0;
        for (const nameL of name) {
            for (const searchL of search) {
                if (nameL === searchL) {
                    lc++;
                }
            }
        }
        return lc >= 4;
    }
    function fin(good) {
        if (good) {
            res.send({stat: 'Good', objects: objects23});
        } else {
            res.send({stat: 'Bad'})
        }
    }
})
app.post('/api/getgames', async function (req, res) {
    let user = req.body.user;
    let ID = req.body.ID;
    let fromGoogle = req.body.fromGoogle;
    let games23 = [];
    await app2.db.find().toArray(async (err, results) => {
        if (err) throw err;
        for (const result of results) {
            if (result.user === user) {
                for (const games of result.games) {
                    games23.push(games);
                }
                fin(true);
            }
        }
    })
    function fin(good) {
        if (good) {
            res.send({stat: 'Good', games: games23});
            res.end();
        } else {
            res.send({stat: 'Bad'});
            res.end();
        }
    }
})
app.post('/api/getallgames', async function (req, res) {
    let games23 = [];
    await app2.db.find().toArray(async (err, results) => {
        if (err) throw err;
        for (const result of results) {
            for (const game of result.games) {
                games23.push(game);
            }
        }
        fin(true);
    })
    function fin(good) {
        if (good) {
            res.send({stat: 'Good', games: games23});
            res.end();
        } else {
            res.send({stat: 'Bad'});
            res.end();
        }
    }
})
app.post('/api/savegame', async function (req, res) {
    let user = req.body.user;
    let ID = req.body.ID;
    let hasSaved = req.body.hasSaved;
    let game = req.body.game;
    let name = req.body.name;
    let fromGoogle = req.body.fromGoogle;
    async function dbStuff (hasSaved) {
        await app2.db.findOne({user: user}, async function (err, d) {
            if (err) throw err;
            let updatedGames = d.games;
            if (!hasSaved) {
                updatedGames.push({name: name, game: game});
            } else {
                /** updatedGames.length - 1 Will cause ERROR!!!! -1 is not always the right thing!!!!**/
                for (let i = 0; i < updatedGames.length; i++) {
                    if (updatedGames[i].name === name) {
                        updatedGames[i] = {name: name, game: game};
                    }
                }
            }
            await app2.db.findOneAndUpdate({user: user}, {$set: {games: updatedGames}}).catch(err => {
                console.error(`Savegame error: ${err}`);
            })

            po();
        })
    }
    await dbStuff(hasSaved);
    function po() {
        res.send('Good');
        res.end();
    }
})
app.post('/api/getoname', async function (req, res) {
    let name = req.body.name.toLowerCase();
    await app2.db.find().toArray(async (err, results) => {
        if (err) throw err;
        for (const result of results) {
            for (const object of result.objects) {
                let name2 = object.name.toLowerCase();
                if (name === name2) {
                    fin(false);
                    return;
                }
            }
        }
        fin(true);
    })
    function fin(good) {
        if (good) {
            res.send('Good');
            res.end();
        } else {
            res.send('Bad');
            res.end();
        }
    }
})
app.post('/api/getgname', async function (req, res) {
    let name = req.body.name.toLowerCase();
    await app2.db.find().toArray(async (err, results) => {
        if (err) throw err;
        for (const result of results) {
            for (const object of result.games) {
                let name2 = object.name.toLowerCase();
                if (name === name2) {
                    fin(false);
                    return;
                }
            }
        }
        fin(true);
    })
    function fin(good) {
        if (good) {
            res.send('Good');
            res.end();
        } else {
            res.send('Bad');
            res.end();
        }
    }
})
app.post('/api/saveobject', async function (req, res) {
    let user = req.body.user;
    let ID = req.body.ID;
    let hasSaved = req.body.hasSaved;
    let objects = req.body.object;
    let name = req.body.name;
    let fromGoogle = req.body.fromGoogle;
    async function dbStuff (fromGoogle, hasSaved) {
        await app2.db.findOne({user: user}, async function (err, d) {
            if (err) throw err;
            let updatedObjects = d.objects;
            if (!hasSaved) {
                updatedObjects.push({name: name, object: objects});
            } else {
                /** updatedObjects.length - 1 Will cause ERROR!!!! - 1 is not always the right thing!!!!**/
                for (let i = 0; i < updatedObjects.length; i++) {
                    if (updatedObjects[i].name === name) {
                        updatedObjects[i] = {name: name, object: objects};
                    }
                }
            }
            await app2.db.findOneAndUpdate({user: user}, {$set: {objects: updatedObjects}}).catch(err => {
                console.error(`Saveobject error: ${err}`);
            })
            po();
        })
    }
    async function finish(fromGoogle) {
        if (!hasSaved) {
            dbStuff(fromGoogle, false);
        } else {
            dbStuff(fromGoogle, true);
        }
    }
    if (fromGoogle) {
        finish(true)
    }  else {
        finish(false);
    }
    function po() {
        res.send('Good');
        res.end();
    }
})
/**
 * !!! To Update GameSite !!!
 * let vers = [];
 * // in createsite
 * for through everything
 * if cannot find name
 * .push with name and version
 * if can find name
 * vers[i] = {name: name, version: vers[i] + 1};
 * **/
app.post('/api/createsite', async function (req, res) {
    let user = req.body.user;
    let ID = req.body.ID;
    let name = req.body.name;
    let code = req.body.code;
    let codeP = {};
    let l2 = 0;
    let versi = 0;
    if (Array.isArray(vers) && vers.length) {
        let found = false;
        for (let k = 0; k < vers.length; k++) {
            let version = vers[k];
            if (version.name === name) {
                versi = version.version + 1;
                vers[k] = {name: name, code: code, version: version.version + 1};
                found = true;
            }
        }
        if (!found) {
            vers.push({name: name, code: code, version: 0});
            versi = 0;
        }
    } else {
        vers.push({name: name, code: code, version: 0});
        versi = 0;
    }
    app.get(`/${name}`, (req, res) => {
        /** !!!use the ejs code!!! **/
        let l2 = 0;
        let cd = {};
        for (let k = 0; k < vers.length; k++) {
            let version = vers[k];
            if (version.name === name) {
                let versi2 = version.version;
                cd = version.code;
            }
        }
        let l = cd.length;
        let gC = () => {
            return cd[l2++];
        }
        ejs.renderFile(__dirname + '/game.ejs', {code: cd, name: name, gC: gC, l: l}, {}, function (err, txt) {
            if (err) throw err;
            res.send(txt);
        })
    })
    return res.send(String(versi));
})
app.post('/api/sessions', async function (req, res) {
    var user = req.body.user;
    var pass = req.body.pass;
    var trusted = req.body.trusted;
    var ID = req.body.userID;
    var fromGoogle = false;
    var good = false;
    var fins = false;
    if (typeof trusted === 'boolean') {
        if (typeof ID === 'string') {
            fromGoogle = true;
        }
        if (fromGoogle) {
            await app2.db.findOne({class: 'Google', user: user, ID2: ID}, function (err, d) {
                if (err) {
                    throw err;
                }
                if (d === null) {
                    fin(false);
                } else {
                    l23();
                }
            })
            function l23() {
                users.push({fromGoogle: true, user: user, id: ID});
                res.cookie('_id', ID, {maxAge: 43200000, httpOnly: false});
                sessions.push({fromGoogle: true, user: user, id: ID});
                fin(true);
            }
        } else {
            await app2.db.findOne({class: 'User', user: user, pass: pass}, function (err, d) {
                if (err) {
                    throw err;
                }
                if (d === null) {
                    fin2(false);
                } else {
                    ID = d.ID2;
                    l24();
                }
            })
            function l24() {
                users.push({fromGoogle: false, user: user, pass: pass, id: ID});
                res.cookie('_id', ID, {maxAge: 43200000, httpOnly: false });
                sessions.push({fromGoogle: false, user: user, pass: pass, id: ID});
                fin2(true);
            }
        }
    } else {
        return res.send('Hello!');
    }
    function fin2(good) {
        if (good) {
            res.send({
                state2: 'Good',
                ID2: ID
            });
            res.end()
        } else {
            res.send({state2: 'Wrong Username or Password!'});
            res.end();
        }
    }
    function fin(good) {
        if (good) {
            res.send('Good');
            res.end();
        } else {
            res.send('Wrong Username or Password!');
            res.end();
        }
    }
})
class App {
    constructor() {
        this.MongoClient = require('mongodb').MongoClient;
        this.db = null;
        let ths = this;
        this.MongoClient.connect(`mongodb+srv://Jack:${process.env.password}@cluster238.mbgnw.mongodb.net/buck?retryWrites=true&w=majority`, function (err, client) {
            if (err) throw err;
            ths.db = client.db('data').collection('data');
            ths.runApp();
        })
    }



    runApp() {
        this.db.find().toArray((err, results) => {
            if (err) throw err;
            for (const doc of results) {
                if (Array.isArray(doc.games) && doc.games.length) {
                    for (const game of doc.games) {
                        axios.post('https://gameplay2.glitch.me/api/createsite', {
                            user: doc.user,
                            ID: doc.ID2,
                            name: game.name,
                            code: game.game
                        }).then(res => {
                        })
                    }
                }
            }
        })
    }
}

let app2 = new App();
