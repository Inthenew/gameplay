import React, {Component} from 'react';
import {HashRouter, Route} from 'react-router-dom';
import {Nav, Navbar, Form, FormControl, Button, Checkbox} from 'react-bootstrap';
import $ from 'jquery';
import * as CANNON from 'cannon';
import OrbitControls from 'three-orbitcontrols';
import axios from 'axios';
import body2mesh from './body2mesh.js'
import body2meshes from './body2meshes.js';
import { threeToCannon } from './threetocannon.js';
/** Make sure when you do prompt('name?') it checks all names!!**/
let ShapeType = {
    BOX: 'Box',
    CYLINDER: 'Cylinder',
    SPHERE: 'Sphere',
    HULL: 'ConvexPolyhedron',
    MESH: 'Trimesh',
}
let ths, store;
class Create extends Component {
    constructor(props) {
        super(props);
        this.createType = 'none';
        this.left = false;
        this.lines = [];
        this.cg = false;
        this.game = [];
        //
        this.running = [];
        //
        this.playing = false;
        this.fullScreen = false;
        this.loaded = true;
        this.mode = 'move';
        this.sc = false;
        this.name = '';
        this.oldx = 0;
        this.updated = false;
        this.code = '';
        this.oldy = 0;
        this.hasSaved = false;
        this.mouseMoving = false;
        this.lastClicked = 'none';
        this.dls = false;
        this.ft = true;
        ths = this;
        store = this.props.store;
    }
    doUpdate() {
        setInterval(function () {
            if (!ths.cg) {
                ths.do2();
            }
        }, 1000)
    }
    do2() {
        for (let i = 0; i < ths.running.length; i++) {
            let info = ths.running[i];
            if (!info.del) {
                let shape = info.shape;
                let fB = new CANNON.Body({mass: 0});
                fB.addShape(shape);
                let mesh = body2mesh(fB, false);
                let type = shape.type;
                let newShape;
                let mesh2 = info.mesh;
                ths.updatePos(shape, new CANNON.Vec3(mesh2.position.x, mesh2.position.y, mesh2.position.z), new CANNON.Quaternion(mesh2.quaternion.x, mesh2.quaternion.y, mesh2.quaternion.z));
            }
        }
        ths.updated = true;
    }
    async createObject(e) {
        ths.createType = 'Object';
        window.vis2 = false;
        /**
         * This code will be a bunch CANNON.Shape(), to minimize as much glitching as possible.
         * **/
        ths.object = [new CANNON.Body({mass: 0})];
        $('#getObjects').css({
            visibility: 'hidden'
        })
        document.getElementById('pick').remove();
        ths.cg = false;
        await ths.setUpEverything(false);
    }
    removeShape (body, shape) {
        const index = body.shapes.indexOf(shape);

        if (index === -1) {
            console.warn('Shape does not belong to the body');
            return this;
        }

        body.shapes.splice(index, 1);
        body.shapeOffsets.splice(index, 1);
        body.shapeOrientations.splice(index, 1);
        body.updateMassProperties();
        body.updateBoundingRadius();

        body.aabbNeedsUpdate = true;

        shape.body = null;

        return this
    }
    async createObjectLine(mesh, name, scaleA, tst, color) {
        let box = new THREE.Box3().setFromObject( mesh );
        let line = new THREE.Mesh(new THREE.BoxGeometry(0.4, box.getSize().y + 3, 0.4), new THREE.MeshBasicMaterial({color: 'red'}));
        let line2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, box.getSize().z + 3, 0.4), new THREE.MeshBasicMaterial({color: 'red'}));
        line2.rotation.x = 90 * Math.PI / 180;
        let line3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, box.getSize().x + 3, 0.4), new THREE.MeshBasicMaterial({color: 'red'}));
        line2.rotation.x = 90 * Math.PI / 180;
        line3.rotation.z = 90 * Math.PI / 180;
        this.scene.add(line);
        this.scene.add(line2);
        this.scene.add(line3);
        let meshShape = {};
        if (Array.isArray(tst)) {
            meshShape = tst[0];
            meshShape.color = color;
        }
        if (name === 'Cube') {
            meshShape = new CANNON.Box(new CANNON.Vec3(scaleA[0], scaleA[1], scaleA[2]));
            meshShape.color = color;
            if (!Array.isArray(tst)) {
                ths.object[0].addShape(meshShape, new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z));
            }
        } else if (name === 'Sphere') {
            meshShape = new CANNON.Sphere(2);
            meshShape.color = color;
            if (!Array.isArray(tst)) {
                ths.object[0].addShape(meshShape, new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z));
            }
        }
        if (!Array.isArray(tst)) {
            this.running.push({mesh: mesh, shape: meshShape, del: false});
        }
        this.Listener('mousedown', line, function (e) {
            ths.mouseMoving = true;
            ths.controls.enabled = false;
            ths.lastClicked = {mesh: mesh, shape: meshShape, color: color, line: line,lines: [line, line2, line3], type: '|'};
        })
        this.Listener('mousedown', line2, function (e) {
            ths.mouseMoving = true;
            ths.controls.enabled = false;
            ths.lastClicked = {mesh: mesh, shape: meshShape, color: color, line: line2,lines: [line, line2, line3], type: '-'};
        })
        this.Listener('mousedown', line3, function (e) {
            ths.mouseMoving = true;
            ths.controls.enabled = false;
            ths.lastClicked = {mesh: mesh, shape: meshShape, color: color, line: line3,lines: [line, line2, line3], type: '_'};
        })
        this.Listener('mousedown', mesh, function (e) {
            e.preventDefault();
            if (e.which === 3) {
                ths.scene.remove(mesh);
                ths.scene.remove(line);
                ths.scene.remove(line2);
                ths.scene.remove(line3);
                console.log(ths.running.indexOf({mesh: mesh, shape: meshShape}));
                for (let i = 0; i < ths.running.length; i++) {
                    let info = ths.running[i];
                    if (info.mesh === mesh) {
                        meshShape = info.shape;
                        console.log('FOUND!');
                        ths.running[i].del = true;
                        ths.running.splice(i);
                    }
                }
                ths.lastClicked = 'none';
                /** RemoveShape does not exist, so copy what webstorm says :)  */
                ths.removeShape(ths.object[0], meshShape);
            }
        })
        this.lines.push({mesh: mesh, meshShape: meshShape, lines: [{line: line, type: '|', movingLine: false}, {line: line2, type: '-', movingLine: false}, {line: line3, type: '_', movingLine: false}]});
    }
    async createObjectLineGame(mesh, meshBody) {
        /**  **/
        let box = new THREE.Box3().setFromObject( mesh );
        let line = new THREE.Mesh(new THREE.BoxGeometry(0.4, box.getSize().y + 3, 0.4), new THREE.MeshBasicMaterial({color: 'red'}));
        let line2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, box.getSize().z + 3, 0.4), new THREE.MeshBasicMaterial({color: 'red'}));
        line2.rotation.x = 90 * Math.PI / 180;
        let line3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, box.getSize().x + 3, 0.4), new THREE.MeshBasicMaterial({color: 'red'}));
        line2.rotation.x = 90 * Math.PI / 180;
        line3.rotation.z = 90 * Math.PI / 180;
        this.scene.add(line);
        this.scene.add(line2);
        this.scene.add(line3);
        this.Listener('mousedown', line, function (e) {
            ths.mouseMoving = true;
            ths.controls.enabled = false;
            ths.lastClicked = {mesh: mesh, line: line,  lines: [line, line2, line3], type: '|'};
        })
        this.Listener('mousedown', line2, function (e) {
            ths.mouseMoving = true;
            ths.controls.enabled = false;
            ths.lastClicked = {mesh: mesh, line: line2, lines: [line, line2, line3], type: '-'};
        })
        this.Listener('mousedown', line3, function (e) {
            ths.mouseMoving = true;
            ths.controls.enabled = false;
            ths.lastClicked = {mesh: mesh, line: line3,lines: [line, line2, line3], type: '_'};
        })
        this.Listener('mousedown', mesh, function (e) {
            e.preventDefault();
            if (e.which === 3 && !ths.playing) {
                ths.scene.remove(mesh);
                ths.scene.remove(line);
                ths.scene.remove(line2);
                let ind = ths.running.indexOf({mesh: mesh, body: meshBody});
                ths.running.splice(ind);
                ths.scene.remove(line3);
                ths.lastClicked = 'none';
                ths.world.remove(meshBody);
            } else if (e.which === 1 && !ths.playing && ths.mode === 'coding') {
                document.getElementById('getObjects2').innerHTML = '';
                $('#getObjects2').css({
                    display: 'block',
                    zIndex: '1000',
                    position: 'absolute',
                    left: '30%',
                    visibility: 'visible',
                    top: '25%'
                })
                /** Create a thing called 'startVelocity' and when you play, the velocity is startVelocity**/
                document.getElementById('getObjects2').innerHTML += `<h1>Velocity: </h1><br/><br/> <input type="text" id="vel"/><br/><br/><p id="infoR">Do like this: 1;2;3</p>`;
                setTimeout(function () {
                    if (ths.loaded) {
                        document.getElementById('vel').value = `${String(meshBody.startVelocity.x)};${String(meshBody.startVelocity.y)};${String(meshBody.startVelocity.z)}`;
                        document.getElementById('vel').onkeydown = function (e) {
                            if (e.key === 'Enter') {
                                let velocityT = document.getElementById('vel').value;
                                let velocity = [];
                                let t = 0;
                                velocityT.split(';').map(vel => {
                                    velocity.push(Number(vel));
                                    t++;
                                })
                                if (t === 3) {
                                    for (let i = 0; i <  ths.running.length; i++) {
                                        let info = ths.running[i];
                                        let mesh2 = info.mesh;
                                        if (mesh2 === mesh) {
                                            ths.setVelocity(ths.running[i].body, {x: velocity[0], y: velocity[1], z: velocity[2]});
                                        }
                                    }
                                    ths.setVelocity(meshBody, {x: velocity[0], y: velocity[1], z: velocity[2]});
                                }
                            }
                        }
                    }
                }, 200)
                ths.renderer.domElement.onclick = function (e) {
                }
                setTimeout(function () {
                ths.renderer.domElement.onmouseup = function (e) {
                    $('#getObjects2').css({
                        display: 'none',
                        zIndex: '1000',
                        position: 'absolute',
                        left: '30%',
                        visibility: 'hidden',
                        top: '25%'
                    })
                    ths.renderer.domElement.onclick = function (e) {
                    }
                    ths.renderer.domElement.onmouseup = function (e) {
                    }
                }
                }, 1000)
            }
        })
        this.lines.push({mesh: mesh, lines: [{line: line, type: '|', movingLine: false}, {line: line2, type: '-', movingLine: false}, {line: line3, type: '_', movingLine: false}]});
    }
    setVelocity(body, velocity) {
        body.startVelocity = {x: velocity.x, y: velocity.y, z: velocity.z};
    }
    async save(e) {
        console.log(ths.object[0]);
        if (!ths.hasSaved) {
            function gN () {
                ths.name = prompt('Give your Object a Name!');
                //
                axios.post('https://gameplay2.glitch.me/api/getoname', {
                    name: ths.name
                }).then(async function (res) {
                    if (res.data === 'Good') {
                        if (ths.name !== null && ths.name.length < 4) {
                            alert('Your name is not long enough!');
                            gN();
                        } else {
                            if (ths.name !== null) {
                                if (ths.updated) {
                                    g();
                                } else {
                                   await ths.do2();
                                   g();
                                }
                            }
                        }
                    } else {
                        alert('Name used!');
                        gN();
                    }
                }).catch(err => {

                    throw err;
                })
                //
            }
            gN();
        } else {
            g();
        }
        function g() {
            ths.object[0].shapes = [];
            for (let i = 0; i < ths.running.length; i++) {
                let info = ths.running[i];
                let mesh2 = info.mesh;
                ths.object[0].addShape(info.shape, new CANNON.Vec3(mesh2.position.x, mesh2.position.y, mesh2.position.z), new CANNON.Quaternion(mesh2.quaternion.x, mesh2.quaternion.y, mesh2.quaternion.z));
            }
            if (!ths.hasSaved) {
                console.log('has1')
                if (localStorage.getItem('Username') !== null) {
                    axios.post('https://gameplay2.glitch.me/api/saveobject', {
                        object: ths.decycle(ths.object[0]),
                        fromGoogle: localStorage.getItem('fromGoogle'),
                        hasSaved: false,
                        name: ths.name,
                        user: localStorage.getItem('Username'),
                        ID: localStorage.getItem('_id')
                    }).then(function (res) {
                        if (res.data === 'Good') {
                            alert('Should be saved!');
                            ths.hasSaved = true;
                        } else {
                            alert('Failed!');
                        }
                    }).catch(err => {
                        console.error(err);
                    })
                } else {
                    alert(`You don't have an account!`)
                }
            } else if (ths.hasSaved) {
                console.log('has2')
                if (localStorage.getItem('Username') !== null) {
                    axios.post('https://gameplay2.glitch.me/api/saveobject', {
                        object: ths.decycle(ths.object[0]),
                        fromGoogle: localStorage.getItem('fromGoogle'),
                        user: localStorage.getItem('Username'),
                        name: ths.name,
                        hasSaved: true,
                        ID: localStorage.getItem('_id')
                    }).then(function (res) {
                        if (res.data === 'Good') {
                            alert('Should be saved!');
                        } else {
                            alert('Failed!');
                        }
                    }).catch(err => {
                        console.error(err);
                    })
                } else {
                    alert(`You don't have an account!`)
                }
            }
        }
    }
    async SaveGame(e) {
        if (!ths.hasSaved) {
            function gN () {
                ths.name = prompt('Give your Object a Name!');
                //
                axios.post('https://gameplay2.glitch.me/api/getgname', {
                    name: ths.name
                }).then(function (res) {
                    if (res.data === 'Good') {
                        if (ths.name !== null && ths.name.length < 4) {
                            alert('Your name is not long enough!');
                            gN();
                        } else {
                            if (ths.name !== null) {
                                if (ths.updated) {
                                    g();
                                } else {
                                    setTimeout(function () {
                                        g();
                                    }, 1000)
                                }
                            }
                        }
                    } else {
                        alert('Name used!');
                        gN();
                    }
                }).catch(err => {
                    throw err;
                })
                //
            }
            gN();
        } else {
            g();
        }
        function g() {
            for (const running of ths.running) {
                let mesh = running.mesh;
                let body = running.body;
                body.position.copy(mesh.position);
                body.quaternion.copy(mesh.quaternion);
            }
            if (!ths.hasSaved) {
                if (localStorage.getItem('Username') !== null) {
                    axios.post('https://gameplay2.glitch.me/api/savegame', {
                        game: ths.running,
                        fromGoogle: localStorage.getItem('fromGoogle'),
                        hasSaved: false,
                        name: ths.name,
                        user: localStorage.getItem('Username'),
                        ID: localStorage.getItem('_id')
                    }).then(function (res) {
                        if (res.data === 'Good') {
                            alert('Should be saved!');
                            axios.post('https://gameplay2.glitch.me/api/createsite', {
                                user: localStorage.getItem('Username'),
                                ID: localStorage.getItem('_id'),
                                name: ths.name,
                                code: ths.running
                            }).then(res => {
                            })
                            ths.hasSaved = true;
                        } else {
                            alert('Failed!');
                        }
                    }).catch(err => {
                        console.error(err);
                    })
                } else {
                    alert(`You don't have an account!`)
                }
            } else if (ths.hasSaved) {
                if (localStorage.getItem('Username') !== null) {
                    axios.post('https://gameplay2.glitch.me/api/savegame', {
                        game: ths.running,
                        fromGoogle: localStorage.getItem('fromGoogle'),
                        hasSaved: true,
                        name: ths.name,
                        user: localStorage.getItem('Username'),
                        ID: localStorage.getItem('_id')
                    }).then(function (res) {
                        if (res.data === 'Good') {
                            alert('Should be saved!');
                            axios.post('https://gameplay2.glitch.me/api/createsite', {
                                user: localStorage.getItem('Username'),
                                ID: localStorage.getItem('_id'),
                                name: ths.name,
                                code: ths.running
                            }).then(res => {
                            })
                            ths.hasSaved = true;
                        } else {
                            alert('Failed!');
                        }
                    }).catch(err => {
                        console.error(err);
                    })
                } else {
                    alert(`You don't have an account!`)
                }
            }
        }
    }

    async onGetSavesOnClick(child) {
        let name = child.name;
        let object = child.object;
        let body = ths.object[0];
        /*
        for (let i = 0; i < object.shapes.length; i++) {
            let shape = object.shapes[i];
            let pos = object.shapeOffsets[i];
            if (object.shapes.length) {
                shape.id = object.shapes[object.shapes.length - 1].id;
            }
            shape.calculateWorldAABB = ths.getCalculateWorldAABB(shape);
            body.addShape(shape, new CANNON.Vec3(pos.x, pos.y, pos.z));
        }
        */
        let meshes = body2meshes(object);
        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];
            let type = mesh.geometry.type;
            let shape;
            if (type === 'BoxGeometry') {
                shape = threeToCannon(mesh, {type: ShapeType.BOX});
            } else if (type === 'SphereGeometry') {
                shape = threeToCannon(mesh, {type: ShapeType.SPHERE});
            }
            shape.color = object.shapes[i].color;
            let pos = object.shapeOffsets[i];
            let quat = object.shapeOrientations[i];
            mesh.quaternion.x = quat.x;
            mesh.quaternion.y = quat.y;
            mesh.quaternion.z = quat.z;
            mesh.quaternion.w = quat.w;
            body.addShape(shape, new CANNON.Vec3(pos.x, pos.y, pos.z), new CANNON.Quaternion(quat.x, quat.y, quat.z, quat.w));
            ths.running.push({mesh: mesh, shape: shape, del: false});
            ths.createObjectLine(mesh, mesh.name, [mesh.scale.x, mesh.scale.y, mesh.scale.z], [shape], shape.color);
            ths.scene.add(mesh);
        }
        $('#getObjects2').css({
            display: 'none',
            zIndex: '1000',
            position: 'absolute',
            left: '30%',
            visibility: 'hidden',
            top: '25%'
        })
    }
    async onGetSavesOnClick2(object2, pos, isGet, mesh230) {
        let name = object2.name;
        let object;
        let mass;
        if (!isGet) {
            object = object2.object;
            mass = prompt('Whats the mass?');
            if (mass === null) {
                mass = 10;
            } else {
                mass = Number(mass);
            }
        } else {
            object = object2;
            mass = object.mass;
        }
        let meshes = body2meshes(object);
        console.log('s')
        /** crippled_cannon -> three -> uncripled_cannon -> all_together_three **/
        let body = new CANNON.Body({mass: mass});
        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];
            let type = mesh.geometry.type;
            let shape;
            if (type === 'BoxGeometry') {
                shape = threeToCannon(mesh, {type: ShapeType.BOX});
            } else if (type === 'SphereGeometry') {
                shape = threeToCannon(mesh, {type: ShapeType.SPHERE});
            }
            shape.color = object.shapes[i].color;
            let pos = object.shapeOffsets[i];
            let quat;
            mesh.material.color = shape.color;
                quat = object.shapeOrientations[i];
                mesh.quaternion.x = quat.x;
                mesh.quaternion.y = quat.y;
                mesh.quaternion.z = quat.z;
                mesh.quaternion.w = quat.w;
            body.addShape(shape, new CANNON.Vec3(pos.x, pos.y, pos.z), new CANNON.Quaternion(quat.x, quat.y, quat.z, quat.w));
        }
        if (isGet) {
            console.log(object.quaternion)
            body.quaternion.x = object.quaternion.x;
            body.quaternion.y = object.quaternion.y;
            body.quaternion.z = object.quaternion.z;
            body.quaternion.w = object.quaternion.w;
        }
        let finObj = body2mesh(body);
        finObj.position.set(pos.x, pos.y, pos.z);
        if (isGet) {
            finObj.quaternion.copy(body.quaternion)
        }
        ths.scene.add(finObj);
        if (typeof object.startVelocity !== 'object') {
            body.startVelocity = {x: 0, y: 0, z: 0};
        } else {
            body.startVelocity = object.startVelocity;
        }
        this.running.push({mesh: finObj, body: body});
        await ths.createObjectLineGame(finObj, body);
    }
    async getSaves(e) {
        let objects = [];
        if (localStorage.getItem('Username') !== null) {
            await axios.post('https://gameplay2.glitch.me/api/objects', {
                fromGoogle: localStorage.getItem('fromGoogle'),
                user: localStorage.getItem('Username'),
                ID: localStorage.getItem('_id')
            }).then(function (res) {
                if (res.data.stat === 'Good') {
                    document.getElementById('getObjects2').innerHTML = '';
                    for (const objectD of res.data.objects) {
                        let name = objectD.name;
                        let object2 = objectD.object;
                        objects.push({name: name, object: object2})
                        document.getElementById('getObjects2').innerHTML += `<a id="name${name}" class="s2 btn btn-outline-success">${name}</a>&nbsp;&nbsp;`;
                        $('#getObjects2').css({
                            display: 'block',
                            zIndex: '1000',
                            position: 'absolute',
                            left: '30%',
                            visibility: 'visible',
                            overflowY: 'scroll',
                            top: '25%'
                        })
                        ths.renderer.domElement.onclick = function (e) {
                            $('#getObjects2').css({
                                display: 'none',
                                zIndex: '1000',
                                position: 'absolute',
                                left: '30%',
                                visibility: 'hidden',
                                top: '25%'
                            })
                        }
                    }
                } else {
                    alert('Failed!');
                }
                for (const child of document.getElementById('getObjects2').children) {
                    function getThing() {
                        for (const object23 of objects) {
                            if (object23.name === child.innerHTML && !ths.hasSaved) {
                                child.onclick = e => {
                                    ths.onGetSavesOnClick(object23);
                                    ths.hasSaved = true;
                                    ths.name = object23.name;
                                };
                                return;
                            }
                        }
                    }
                    getThing();
                }
            }).catch(err => {
                console.error(err);
            })
        } else {
            alert("You don't have an account!")
        }
    }
    async loadSimpleObjects() {
        document.getElementById('createBar').innerHTML += `<a id="getSaves" class="s btn btn-outline-success">Get Saves</a>`;
        document.getElementById('createBar').innerHTML += `<a id="save" class="s btn btn-outline-success">Save</a>&nbsp;&nbsp;`;
        let simpleObjects = [{name: 'Cube', obj: new THREE.CubeGeometry(2, 2, 2), width: 50, height: 50}, {name: 'Sphere', obj: new THREE.SphereGeometry(2, 100, 100), width: 50, height: 50}];
        await simpleObjects.forEach(object => {
            document.getElementById('createBar').innerHTML += `<a id="${object.name}" class="s btn btn-outline-success">${object.name}</a>&nbsp;&nbsp;`;
            setTimeout(function () {
                if (ths.loaded) {
                    document.getElementById('save').onclick = function (e) {
                        ths.save(e);
                    }
                    document.getElementById('getSaves').onclick = function (e) {
                        ths.getSaves(e);
                    }
                    document.getElementById(object.name).onclick = async function (e) {
                        var scaleA = [];
                        var t = 0;
                        let color = prompt('Tell me your color.');
                        if (object.name === 'Cube') {
                            let scale = prompt('Tell me your scale, like this: 1;2;3. (Automatic is 1;1;1) (Width;Height;Length)');
                            if (scale !== null) {
                                await scale.split(';').map(scale => {
                                    scaleA.push(Number(scale));
                                    t++;
                                })
                            } else {
                                scaleA = [1, 1, 1];
                            }
                            if (t === 3) {
                                var mesh = new THREE.Mesh(new THREE.CubeGeometry(Math.abs(scaleA[0] * 2), Math.abs(scaleA[1] * 2), Math.abs(scaleA[2] * 2)), new THREE.MeshBasicMaterial({color: color}));
                                ths.scene.add(mesh);
                                ths.createObjectLine(mesh, object.name, scaleA, null, color);
                            } else {
                                var mesh = new THREE.Mesh(object.obj, new THREE.MeshBasicMaterial({color: color}));
                                ths.scene.add(mesh);
                                ths.createObjectLine(mesh, object.name, [1, 1, 1], null, color);
                            }
                        } else {
                            var mesh = new THREE.Mesh(object.obj, new THREE.MeshBasicMaterial({color: color}));
                            ths.scene.add(mesh);
                            ths.createObjectLine(mesh, object.name, [], null, color);
                        }
                    }
                }
            }, 100)
        })
    }
    decycle(obj, stack = []) {
        if (!obj || typeof obj !== 'object')
            return obj;

        if (stack.includes(obj))
            return null;

        let s = stack.concat([obj]);

        return Array.isArray(obj)
            ? obj.map(x => ths.decycle(x, s))
            : Object.fromEntries(
                Object.entries(obj)
                    .map(([k, v]) => [k, ths.decycle(v, s)]));
    }

    async setUpEverything(floor) {
        await this.setUpScene(400, 400, floor);
        await this.createLines();
        $('body').css({
            overflow: 'hidden'
        })
        await this.setUpCannon();
        if (floor) {
            await this.createFloor(200, 0.5, 200, false);
        } else {
            await this.doUpdate();
        }

        function animate() {
            if (!ths.left) {
                requestAnimationFrame(animate);
                ths.renderScene(floor);
            } else {
                ths.left = false;
            }
        }

        animate();
    }
    Listener(listener, mesh, callback) {
        let objects = [mesh];
        let raycaster = new THREE.Raycaster();
        let mouse = {x: 0, y: 0};
        this.renderer.domElement.addEventListener(listener, raycast, false);
        function raycast(e) {
            mouse.x = (e.clientX / ths.renderer.domElement.clientWidth) * 2 - 1;
            mouse.y = -(e.clientY / ths.renderer.domElement.clientHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, ths.camera);
            let intersects = raycaster.intersectObjects(objects, true);
            let intersect = intersects[0];
            if (typeof intersect !== "undefined") {
                callback(e);
            }
        }
    }
    async createLines() {
        this.scene.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 0.1), new THREE.MeshBasicMaterial({color: 'red'})));
    }

    async createGame(e) {
        ths.createType = 'Game';
        window.vis2 = true;
        ths.code = [];
        document.getElementById('getObjects').innerHTML += `<div id="fakeObjects"></div>`;
        document.getElementById('getObjects').innerHTML += `<div id="Objects"><input id="osearch" style="width: 150px; display: inline-block;" placeholder="Search" type="text" id="search" class="form-control"><hr/><div id="Objects2"></div><hr/><a id="Play" class="s btn btn-outline-success">Play</a><br/><br/><a id="Save2" class="s btn btn-outline-success">Save</a><br/><br/><a id="Games" class="s btn btn-outline-success">Get Games</a></div>`;
        $('#getObjects').css({
            visibility: 'visible'
        })
        ths.cg = true;
        document.getElementById('pick').remove();
        ths.setUpEverything(true);

    }
    destroyALLlines() {
        for (const obj23 of this.lines) {
            for (const line of obj23.lines) {
                ths.scene.remove(line.line);
            }
        }
        ths.lastClicked = 'none';
        this.lines = [];
    }
    play() {
            this.playing = true;
            this.destroyALLlines();
    }
    createFloor(width, height, depth, lop) {
        let floorB = new CANNON.Body({mass: 0});
        let s = new CANNON.Box(new CANNON.Vec3(width, height, depth));
        s.color = 'green';
        floorB.addShape(s);
        this.world.add(floorB);
        let floor = body2mesh(floorB, false);
        this.scene.add(floor);
        if (!lop) {
            document.getElementById('Play').onclick = function (e) {
                ths.play();
            }
            document.getElementById('Save2').onclick = function (e) {
                ths.SaveGame(e);
            }
            document.getElementById('Games').onclick = function (e) {
                ths.GetGames(e);
            }
            document.getElementById('osearch').onkeydown = function (e) {
                ths.osearchkd(e);
            }
        }
    }
    async GetGames(e) {
        if (!ths.playing) {
            document.getElementById('getObjects2').innerHTML = '';
            /** do axios to get the games! **/
            axios.post('https://gameplay2.glitch.me/api/getgames', {
                user: localStorage.getItem('Username'),
                ID: localStorage.getItem('_id'),
                fromGoogle: localStorage.getItem('fromGoogle')
            }).then(function (res) {
                if (res.data.stat === 'Good') {
                    for (const objectD of res.data.games) {
                        let name = objectD.name;
                        let game = objectD.game;
                        document.getElementById('getObjects2').innerHTML += `<a id="name${name}" class="s2 btn btn-outline-success">${name}</a>&nbsp;&nbsp;`;
                        setTimeout(function () {
                            if (ths.loaded) {
                                document.getElementById(`name${name}`).onclick = function (e) {
                                    if (!ths.playing) {
                                        for (const body of game) {
                                            ths.onGetSavesOnClick2(body.body,{
                                                x: body.body.position.x,
                                                y: body.body.position.y,
                                                z: body.body.position.z
                                            }, true, body.mesh);
                                            $('#getObjects2').css({
                                                display: 'none',
                                                zIndex: '1000',
                                                position: 'absolute',
                                                left: '30%',
                                                visibility: 'hidden',
                                                top: '25%'
                                            })
                                            /**
                                             * To make a user edit a game after they leave, do this:
                                             * ths.hasSaved = true;
                                             * ths.name = (whatevername);
                                             * **/
                                            ths.hasSaved = true;
                                            ths.name = name;
                                        }
                                    }
                                }
                            }
                        }, 200)
                        $('#getObjects2').css({
                            display: 'block',
                            zIndex: '1000',
                            position: 'absolute',
                            left: '30%',
                            visibility: 'visible',
                            overflowY: 'scroll',
                            top: '25%'
                        })
                        ths.renderer.domElement.onclick = function (e) {
                            $('#getObjects2').css({
                                display: 'none',
                                zIndex: '1000',
                                position: 'absolute',
                                left: '30%',
                                visibility: 'hidden',
                                top: '25%'
                            })
                        }
                    }
                }
            })
        }
    }
    osearchkd(e) {
        if (e.key === 'Enter') {
            /** search for object **/
            let search = document.getElementById('osearch').value;
            axios.post('https://gameplay2.glitch.me/api/objects2', {
                search: search
            }).then(function (res) {
                if (res.data.stat === 'Good') {
                    let objects = res.data.objects;
                    document.getElementById('Objects2').innerHTML = '';
                    for (const object of objects) {
                        document.getElementById('Objects2').innerHTML += `<a id="name${object.name}" class="s btn btn-outline-success">${object.name}</a><br/><br/>`;
                        setTimeout(function () {
                            if (ths.loaded) {
                                document.getElementById(`name${object.name}`).onclick = function (e) {
                                    if (!ths.playing) {
                                        ths.onGetSavesOnClick2(object, {x: 0, y: 0, z: 0}, false);
                                    }
                                }
                            }
                        }, 200)
                    }
                }
            })
            ths.dls = true;
            setTimeout(function () {
                ths.dls = false;
            }, 500)
        }
    }
    changeSize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    destroyBar() {
        document.getElementById('createBar1').innerHTML = '';
    }

    async createBar() {
        document.getElementById('createBar1').innerHTML += `<div id="createBar"></div>`;
        $('#createBar').css({
            position: 'absolute',
            top: window.innerHeight - (ths.amount * 2 + (ths.amount / 2))
        })
        await ths.loadSimpleObjects();
        this.loaded = true;
    }

    updateBar() {
        $('#createBar').css({
            position: 'absolute',
            top: window.innerHeight - (ths.amount * 2 + (ths.amount / 2))
        })
    }
    updatePos(shape, pos, rot) {
        ths.removeShape(ths.object[0], shape);
        ths.object[0].addShape(shape, pos, rot);
    }
    setUpScene(width, height, floor) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.width = width;
        this.height = height;
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 10000);
        this.renderer.setSize(this.width, this.height);
        document.getElementById('canvas').appendChild(this.renderer.domElement);
        this.renderer.domElement.style.position = 'absolute'; /* or absolute */
        this.renderer.domElement.style.top = '300px';
        this.renderer.domElement.style.left = '35%';
        this.renderer.domElement.onclick = function (e) {
            if (!ths.fullScreen) {
                ths.fullScreen = true;
                if (floor) {
                    ths.changeSize(window.innerWidth, window.innerHeight);
                    ths.renderer.domElement.style.top = '0';
                    ths.loaded = true;
                } else {
                    ths.amount = 40;
                    ths.changeSize(window.innerWidth, window.innerHeight - ths.amount);
                    ths.createBar();
                }
                ths.renderer.domElement.style.left = '0';
                ths.renderer.domElement.style.top = '0';
            }
        }
        window.onresize = function () {
            if (!ths.left && ths.fullScreen && floor) {
                ths.changeSize(window.innerWidth, window.innerHeight);
            } else if (!ths.left && ths.fullScreen) {
                ths.changeSize(window.innerWidth, window.innerHeight - ths.amount);
                ths.updateBar();
            }
        }
        this.renderer.domElement.onkeydown = function (e) {
            if (e.key === 'Escape') {
                if (ths.fullScreen) {
                    ths.fullScreen = false;
                    ths.changeSize(ths.width, ths.height);
                    ths.renderer.domElement.style.top = '300px';
                    ths.renderer.domElement.style.left = '35%';
                    ths.destroyBar();
                    ths.loaded = false;
                }
            } else if (e.key === 'r' && !ths.playing) {
                if (ths.mode !== 'rotate') {
                    ths.mode = 'rotate';
                } else {
                    ths.mode = 'move';
                }
            } else if (e.key === 'p' && ths.cg && !ths.playing) {
                ths.mode = 'coding';
            }
        }
        this.renderer.domElement.addEventListener('mouseup', function (e) {
            ths.mouseMoving = false;
            ths.controls.enabled = true;
        })
        this.renderer.domElement.addEventListener('mousemove', function (e) {
            if (ths.mouseMoving && !ths.playing && ths.mode === 'move') {
                let amount = 0.2;
                let vector = ths.camera.getWorldDirection();
                let angle = THREE.Math.radToDeg( Math.atan2(vector.x,vector.z) );
                let line = ths.lastClicked.line;
                let mesh = ths.lastClicked.mesh;
                let type = ths.lastClicked.type;
                if (e.pageX > ths.oldx) {
                    // going right
                    /** format: {mesh: mesh, line: line, type: '_' or '|' or '-'} **/
                    if (type === '-') {
                        if (Math.abs(angle) < 90) {
                            mesh.position.z -= amount;
                            line.position.z -= amount;
                        } else {
                            mesh.position.z += amount;
                            line.position.z += amount;
                        }
                    } else if (type === '_') {
                        if (Math.abs(angle) < 90) {
                            mesh.position.x -= amount;
                            line.position.x -= amount;
                        } else {
                            mesh.position.x += amount;
                            line.position.x += amount;
                        }
                    }
                }
                else if (e.pageY > ths.oldy) {
                    // going down
                    if (type === '|') {
                        mesh.position.y -= amount;
                        line.position.y -= amount;
                    }
                }
                else if (e.pageY < ths.oldy) {
                    // going up
                    if (type === '|') {
                        mesh.position.y += amount;
                        line.position.y += amount;
                    }
                }
                else if (e.pageX < ths.oldx) {
                    // going left
                    if (type === '-') {
                        if (Math.abs(angle) < 90) {
                            mesh.position.z += amount;
                            line.position.z += amount;
                        } else {
                            mesh.position.z -= amount;
                            line.position.z -= amount;
                        }
                    } else if (type === '_') {
                        if (Math.abs(angle) < 90) {
                            mesh.position.x += amount;
                            line.position.x += amount;
                        } else {
                            mesh.position.x -= amount;
                            line.position.x -= amount;
                        }
                    }
                }
                ths.updated = false;
                ths.oldx = e.pageX;
                ths.oldy = e.pageY;
            } else if (ths.mouseMoving && !ths.playing && ths.mode === 'rotate') {
                let amount = 0.2;
                let vector = ths.camera.getWorldDirection();
                let angle = THREE.Math.radToDeg( Math.atan2(vector.x,vector.z) );
                let line = ths.lastClicked.line;
                let lines = ths.lastClicked.lines;
                let mesh = ths.lastClicked.mesh;
                let type = ths.lastClicked.type;
                if (e.pageY > ths.oldy) {
                    // going right
                    /** format: {mesh: mesh, line: line, type: '_' or '|' or '-'} **/
                    if (type === '-') {
                        if (Math.abs(angle) < 90) {
                            mesh.rotation.z -= amount;
                            line.rotation.z -= amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        } else {
                            mesh.rotation.z += amount;
                            line.rotation.z += amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        }
                    } else if (type === '_') {
                        if (Math.abs(angle) < 90) {
                            mesh.rotation.x -= amount;
                            line.rotation.x -= amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        } else {
                            mesh.rotation.x += amount;
                            line.rotation.x += amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        }
                    }
                }
                else if (e.pageX > ths.oldx) {
                    // going down
                    if (type === '|') {
                        mesh.rotation.y -= amount;
                        line.rotation.y -= amount;
                        for (let line2 of lines) {
                            line2.rotation.copy(line);
                        }
                    }
                }
                else if (e.pageX < ths.oldx) {
                    // going up
                    if (type === '|') {
                        mesh.rotation.y += amount;
                        line.rotation.y += amount;
                        for (let line2 of lines) {
                            line2.rotation.copy(line);
                        }
                    }
                }
                else if (e.pageY < ths.oldy) {
                    // going left
                    if (type === '-') {
                        if (Math.abs(angle) < 90) {
                            mesh.rotation.z += amount;
                            line.rotation.z += amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        } else {
                            mesh.rotation.z -= amount;
                            line.rotation.z -= amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        }
                    } else if (type === '_') {
                        if (Math.abs(angle) < 90) {
                            mesh.rotation.x += amount;
                            line.rotation.x += amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        } else {
                            mesh.rotation.x -= amount;
                            line.rotation.x -= amount;
                            for (let line2 of lines) {
                                line2.rotation.copy(line);
                            }
                        }
                    }
                }
                ths.updated = false;
                console.clear();
                ths.oldx = e.pageX;
                ths.oldy = e.pageY;
            }
        })
        this.renderer.setClearColor(new THREE.Color('skyblue'), 1);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();
        this.camera.position.set(0, 10, -20);
        this.camera.lookAt(0, 0, 0);
        ths = this;
    }

    renderScene(floor) {
        if (typeof this.controls !== "undefined") {
            if (ths.sc) {
                ths.ft = false;
            }
            this.controls.update();
            if (Array.isArray(this.lines) && this.lines.length) {
                for (const lines of this.lines) {
                    let mesh = lines.mesh;
                    for (const line of lines.lines) {
                        if (line.type === '|') {
                            line.line.position.set(mesh.position.x, mesh.position.y + 3, mesh.position.z);
                        } else if (line.type === '-') {
                            line.line.position.set(mesh.position.x, mesh.position.y, mesh.position.z + 3);
                        } else {
                            line.line.position.set(mesh.position.x + 3, mesh.position.y, mesh.position.z);
                        }
                    }
                }
            }
            if (Array.isArray(this.running) && this.running.length && floor) {
                for (const running of this.running) {
                    let mesh = running.mesh;
                    let body = running.body;
                    if (!ths.playing) {
                    } else if (ths.ft) {
                        ths.world.add(body);
                        this.sc = true;
                        body.position.copy(mesh.position);
                        body.quaternion.copy(mesh.quaternion);
                        body.velocity.set(body.startVelocity.x, body.startVelocity.y, body.startVelocity.z);
                    } else {
                        mesh.position.copy(body.position);
                        mesh.quaternion.copy(body.quaternion);
                    }
                }
            }
            this.world.step(1 / 60);
            this.renderer.render(this.scene, this.camera);
        } else {
            this.left = true;
        }
    }

    setUpCannon() {
        this.world = new CANNON.World();
        this.world.quatNormalizeSkip = 0;
        this.world.quatNormalizeFast = false;

        var solver = new CANNON.GSSolver();

        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4;

        solver.iterations = 7;
        solver.tolerance = 0.1;
        this.world.solver = new CANNON.SplitSolver(solver);
        this.world.gravity.set(0, -20, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();

        // Create a slippery material (friction coefficient = 0.0)
        this.physicsMaterial = new CANNON.Material("slipperyMaterial");
        let physicsContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial,
            this.physicsMaterial,
            0.0, // friction coefficient
            0.3  // restitution
        );


        // We must add the contact materials to the world
        this.world.addContactMaterial(physicsContactMaterial);
    }
    signup(e) {
        window.location='https://gamebuild.netlify.app/#/signup';
    }
    login(e) {
        window.location='https://gamebuild.netlify.app/#/login';
    }
    render() {
        if (localStorage.getItem('Username') !== null) {
            return (
                <div id="div" style={{textAlign: 'center'}}>
                    <div id="getObjects">
                    </div>
                    <div id="canvas">

                    </div>

                    <div id="pick">
                        <h1>Pick One:</h1>
                        <Button variant="outline-success" bsSize="lg" onClick={this.createGame}>Create Game</Button>
                        <h2>or</h2>
                        <Button variant="outline-success" bsSize="lg" onClick={this.createObject}>Create Object</Button>
                    </div>
                    <div id="getObjects2">
                    </div>
                    <div id="createBar1">

                    </div>
                </div>
            )
        } else {
            return (
                <div style={{textAlign: 'center'}}>
                    <h1>Create an Account to build awesome games!</h1>
                    <hr/>
                    <Button variant="outline-success" bsSize="lg" onClick={this.signup}>Sign up</Button>&nbsp;&nbsp;&nbsp;
                    <Button variant="outline-success" bsSize="lg" onClick={this.login}>login</Button>
                </div>
            )
        }
    }
}

export default Create;

