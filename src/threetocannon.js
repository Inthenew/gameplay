import {
    Sphere as e,
    Box as t,
    Vec3 as n,
    ConvexPolyhedron as i,
    Cylinder as r,
    Shape as s,
    Quaternion as a,
    Trimesh as o
} from "cannon-es";
let u = THREE.Vector3;
let h = THREE.Line3;
let l = THREE.Plane;
let c = THREE.Triangle;
let d = THREE.Box3;
let m = THREE.Mesh;
let f = THREE.Math;
let p = THREE.Geometry;
let v = THREE.Quaternion;
let g = THREE.Matrix4;
let x = THREE.BufferGeometry;
var y = function () {
        var e, t, n, i, r = new u;

        function s() {
            this.tolerance = -1, this.faces = [], this.newFaces = [], this.assigned = new m, this.unassigned = new m, this.vertices = []
        }

        function a() {
            this.normal = new u, this.midpoint = new u, this.area = 0, this.constant = 0, this.outside = null, this.mark = 0, this.edge = null
        }

        function o(e, t) {
            this.vertex = e, this.prev = null, this.next = null, this.twin = null, this.face = t
        }

        function d(e) {
            this.point = e, this.prev = null, this.next = null, this.face = null
        }

        function m() {
            this.head = null, this.tail = null
        }

        return Object.assign(s.prototype, {
            setFromPoints: function (e) {
                !0 !== Array.isArray(e) && console.error("THREE.ConvexHull: Points parameter is not an array."), e.length < 4 && console.error("THREE.ConvexHull: The algorithm needs at least four points."), this.makeEmpty();
                for (var t = 0, n = e.length; t < n; t++) this.vertices.push(new d(e[t]));
                return this.compute(), this
            }, setFromObject: function (e) {
                var t = [];
                return e.updateMatrixWorld(!0), e.traverse(function (e) {
                    var n, i, r, s = e.geometry;
                    if (void 0 !== s) if (s.isGeometry) {
                        var a = s.vertices;
                        for (n = 0, i = a.length; n < i; n++) (r = a[n].clone()).applyMatrix4(e.matrixWorld), t.push(r)
                    } else if (s.isBufferGeometry) {
                        var o = s.attributes.position;
                        if (void 0 !== o) for (n = 0, i = o.count; n < i; n++) (r = new u).fromBufferAttribute(o, n).applyMatrix4(e.matrixWorld), t.push(r)
                    }
                }), this.setFromPoints(t)
            }, containsPoint: function (e) {
                for (var t = this.faces, n = 0, i = t.length; n < i; n++) if (t[n].distanceToPoint(e) > this.tolerance) return !1;
                return !0
            }, intersectRay: function (e, t) {
                for (var n = this.faces, i = -Infinity, r = Infinity, s = 0, a = n.length; s < a; s++) {
                    var o = n[s], u = o.distanceToPoint(e.origin), h = o.normal.dot(e.direction);
                    if (u > 0 && h >= 0) return null;
                    var l = 0 !== h ? -u / h : 0;
                    if (!(l <= 0) && (h > 0 ? r = Math.min(l, r) : i = Math.max(l, i), i > r)) return null
                }
                return e.at(-Infinity !== i ? i : r, t), t
            }, intersectsRay: function (e) {
                return null !== this.intersectRay(e, r)
            }, makeEmpty: function () {
                return this.faces = [], this.vertices = [], this
            }, addVertexToFace: function (e, t) {
                return e.face = t, null === t.outside ? this.assigned.append(e) : this.assigned.insertBefore(t.outside, e), t.outside = e, this
            }, removeVertexFromFace: function (e, t) {
                return e === t.outside && (t.outside = null !== e.next && e.next.face === t ? e.next : null), this.assigned.remove(e), this
            }, removeAllVerticesFromFace: function (e) {
                if (null !== e.outside) {
                    for (var t = e.outside, n = e.outside; null !== n.next && n.next.face === e;) n = n.next;
                    return this.assigned.removeSubList(t, n), t.prev = n.next = null, e.outside = null, t
                }
            }, deleteFaceVertices: function (e, t) {
                var n = this.removeAllVerticesFromFace(e);
                if (void 0 !== n) if (void 0 === t) this.unassigned.appendChain(n); else {
                    var i = n;
                    do {
                        var r = i.next;
                        t.distanceToPoint(i.point) > this.tolerance ? this.addVertexToFace(i, t) : this.unassigned.append(i), i = r
                    } while (null !== i)
                }
                return this
            }, resolveUnassignedPoints: function (e) {
                if (!1 === this.unassigned.isEmpty()) {
                    var t = this.unassigned.first();
                    do {
                        for (var n = t.next, i = this.tolerance, r = null, s = 0; s < e.length; s++) {
                            var a = e[s];
                            if (0 === a.mark) {
                                var o = a.distanceToPoint(t.point);
                                if (o > i && (i = o, r = a), i > 1e3 * this.tolerance) break
                            }
                        }
                        null !== r && this.addVertexToFace(t, r), t = n
                    } while (null !== t)
                }
                return this
            }, computeExtremes: function () {
                var e, t, n, i = new u, r = new u, s = [], a = [];
                for (e = 0; e < 3; e++) s[e] = a[e] = this.vertices[0];
                for (i.copy(this.vertices[0].point), r.copy(this.vertices[0].point), e = 0, t = this.vertices.length; e < t; e++) {
                    var o = this.vertices[e], h = o.point;
                    for (n = 0; n < 3; n++) h.getComponent(n) < i.getComponent(n) && (i.setComponent(n, h.getComponent(n)), s[n] = o);
                    for (n = 0; n < 3; n++) h.getComponent(n) > r.getComponent(n) && (r.setComponent(n, h.getComponent(n)), a[n] = o)
                }
                return this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(i.x), Math.abs(r.x)) + Math.max(Math.abs(i.y), Math.abs(r.y)) + Math.max(Math.abs(i.z), Math.abs(r.z))), {
                    min: s,
                    max: a
                }
            }, computeInitialHull: function () {
                void 0 === e && (e = new h, t = new l, n = new u);
                var i, r, s, o, c, d, m, f, p, v = this.vertices, g = this.computeExtremes(), x = g.min, y = g.max, w = 0,
                    T = 0;
                for (d = 0; d < 3; d++) (p = y[d].point.getComponent(d) - x[d].point.getComponent(d)) > w && (w = p, T = d);
                for (w = 0, e.set((r = x[T]).point, (s = y[T]).point), d = 0, m = this.vertices.length; d < m; d++) (i = v[d]) !== r && i !== s && (e.closestPointToPoint(i.point, !0, n), (p = n.distanceToSquared(i.point)) > w && (w = p, o = i));
                for (w = -1, t.setFromCoplanarPoints(r.point, s.point, o.point), d = 0, m = this.vertices.length; d < m; d++) (i = v[d]) !== r && i !== s && i !== o && (p = Math.abs(t.distanceToPoint(i.point))) > w && (w = p, c = i);
                var E = [];
                if (t.distanceToPoint(c.point) < 0) for (E.push(a.create(r, s, o), a.create(c, s, r), a.create(c, o, s), a.create(c, r, o)), d = 0; d < 3; d++) f = (d + 1) % 3, E[d + 1].getEdge(2).setTwin(E[0].getEdge(f)), E[d + 1].getEdge(1).setTwin(E[f + 1].getEdge(0)); else for (E.push(a.create(r, o, s), a.create(c, r, s), a.create(c, s, o), a.create(c, o, r)), d = 0; d < 3; d++) f = (d + 1) % 3, E[d + 1].getEdge(2).setTwin(E[0].getEdge((3 - d) % 3)), E[d + 1].getEdge(0).setTwin(E[f + 1].getEdge(1));
                for (d = 0; d < 4; d++) this.faces.push(E[d]);
                for (d = 0, m = v.length; d < m; d++) if ((i = v[d]) !== r && i !== s && i !== o && i !== c) {
                    w = this.tolerance;
                    var b = null;
                    for (f = 0; f < 4; f++) (p = this.faces[f].distanceToPoint(i.point)) > w && (w = p, b = this.faces[f]);
                    null !== b && this.addVertexToFace(i, b)
                }
                return this
            }, reindexFaces: function () {
                for (var e = [], t = 0; t < this.faces.length; t++) {
                    var n = this.faces[t];
                    0 === n.mark && e.push(n)
                }
                return this.faces = e, this
            }, nextVertexToAdd: function () {
                if (!1 === this.assigned.isEmpty()) {
                    var e, t = 0, n = this.assigned.first().face, i = n.outside;
                    do {
                        var r = n.distanceToPoint(i.point);
                        r > t && (t = r, e = i), i = i.next
                    } while (null !== i && i.face === n);
                    return e
                }
            }, computeHorizon: function (e, t, n, i) {
                var r;
                this.deleteFaceVertices(n), n.mark = 1, r = null === t ? t = n.getEdge(0) : t.next;
                do {
                    var s = r.twin, a = s.face;
                    0 === a.mark && (a.distanceToPoint(e) > this.tolerance ? this.computeHorizon(e, s, a, i) : i.push(r)), r = r.next
                } while (r !== t);
                return this
            }, addAdjoiningFace: function (e, t) {
                var n = a.create(e, t.tail(), t.head());
                return this.faces.push(n), n.getEdge(-1).setTwin(t.twin), n.getEdge(0)
            }, addNewFaces: function (e, t) {
                this.newFaces = [];
                for (var n = null, i = null, r = 0; r < t.length; r++) {
                    var s = this.addAdjoiningFace(e, t[r]);
                    null === n ? n = s : s.next.setTwin(i), this.newFaces.push(s.face), i = s
                }
                return n.next.setTwin(i), this
            }, addVertexToHull: function (e) {
                var t = [];
                return this.unassigned.clear(), this.removeVertexFromFace(e, e.face), this.computeHorizon(e.point, null, e.face, t), this.addNewFaces(e, t), this.resolveUnassignedPoints(this.newFaces), this
            }, cleanup: function () {
                return this.assigned.clear(), this.unassigned.clear(), this.newFaces = [], this
            }, compute: function () {
                var e;
                for (this.computeInitialHull(); void 0 !== (e = this.nextVertexToAdd());) this.addVertexToHull(e);
                return this.reindexFaces(), this.cleanup(), this
            }
        }), Object.assign(a, {
            create: function (e, t, n) {
                var i = new a, r = new o(e, i), s = new o(t, i), u = new o(n, i);
                return r.next = u.prev = s, s.next = r.prev = u, u.next = s.prev = r, i.edge = r, i.compute()
            }
        }), Object.assign(a.prototype, {
            getEdge: function (e) {
                for (var t = this.edge; e > 0;) t = t.next, e--;
                for (; e < 0;) t = t.prev, e++;
                return t
            }, compute: function () {
                void 0 === i && (i = new c);
                var e = this.edge.tail(), t = this.edge.head(), n = this.edge.next.head();
                return i.set(e.point, t.point, n.point), i.getNormal(this.normal), i.getMidpoint(this.midpoint), this.area = i.getArea(), this.constant = this.normal.dot(this.midpoint), this
            }, distanceToPoint: function (e) {
                return this.normal.dot(e) - this.constant
            }
        }), Object.assign(o.prototype, {
            head: function () {
                return this.vertex
            }, tail: function () {
                return this.prev ? this.prev.vertex : null
            }, length: function () {
                var e = this.head(), t = this.tail();
                return null !== t ? t.point.distanceTo(e.point) : -1
            }, lengthSquared: function () {
                var e = this.head(), t = this.tail();
                return null !== t ? t.point.distanceToSquared(e.point) : -1
            }, setTwin: function (e) {
                return this.twin = e, e.twin = this, this
            }
        }), Object.assign(m.prototype, {
            first: function () {
                return this.head
            }, last: function () {
                return this.tail
            }, clear: function () {
                return this.head = this.tail = null, this
            }, insertBefore: function (e, t) {
                return t.prev = e.prev, t.next = e, null === t.prev ? this.head = t : t.prev.next = t, e.prev = t, this
            }, insertAfter: function (e, t) {
                return t.prev = e, t.next = e.next, null === t.next ? this.tail = t : t.next.prev = t, e.next = t, this
            }, append: function (e) {
                return null === this.head ? this.head = e : this.tail.next = e, e.prev = this.tail, e.next = null, this.tail = e, this
            }, appendChain: function (e) {
                for (null === this.head ? this.head = e : this.tail.next = e, e.prev = this.tail; null !== e.next;) e = e.next;
                return this.tail = e, this
            }, remove: function (e) {
                return null === e.prev ? this.head = e.next : e.prev.next = e.next, null === e.next ? this.tail = e.prev : e.next.prev = e.prev, this
            }, removeSubList: function (e, t) {
                return null === e.prev ? this.head = t.next : e.prev.next = t.next, null === t.next ? this.tail = e.prev : t.next.prev = e.prev, this
            }, isEmpty: function () {
                return null === this.head
            }
        }), s
    }(), w = Math.PI / 2,
    T = {BOX: "Box", CYLINDER: "Cylinder", SPHERE: "Sphere", HULL: "ConvexPolyhedron", MESH: "Trimesh"},
    E = function (u, h) {
        var l;
        if ((h = h || {}).type === T.BOX) return F(u);
        if (h.type === T.CYLINDER) return function (e, t) {
            var n = ["x", "y", "z"], i = t.cylinderAxis || "y", o = n.splice(n.indexOf(i), 1) && n,
                u = (new d).setFromObject(e);
            if (!isFinite(u.min.lengthSq())) return null;
            var h = u.max[i] - u.min[i], l = .5 * Math.max(u.max[o[0]] - u.min[o[0]], u.max[o[1]] - u.min[o[1]]),
                c = new r(l, l, h, 12);
            return c._type = s.types.CYLINDER, c.radiusTop = l, c.radiusBottom = l, c.height = h, c.numSegments = 12, c.orientation = new a, c.orientation.setFromEuler("y" === i ? w : 0, "z" === i ? w : 0, 0, "XYZ").normalize(), c
        }(u, h);
        if (h.type === T.SPHERE) return function (t, n) {
            if (n.sphereRadius) return new e(n.sphereRadius);
            var i = B(t);
            return i ? (i.computeBoundingSphere(), new e(i.boundingSphere.radius)) : null
        }(u, h);
        if (h.type === T.HULL) return function (e) {
            var t = B(e);
            if (!t || !t.vertices.length) return null;
            for (var r = 0; r < t.vertices.length; r++) t.vertices[r].x += 1e-4 * (Math.random() - .5), t.vertices[r].y += 1e-4 * (Math.random() - .5), t.vertices[r].z += 1e-4 * (Math.random() - .5);
            var s = (new y).setFromObject(new m(t)).faces, a = [], o = [];
            for (r = 0; r < s.length; r++) {
                var u = s[r], h = u.edge;
                do {
                    var l = h.head().point;
                    a.push(new n(l.x, l.y, l.z)), o.push(new n(u.normal.x, u.normal.y, u.normal.z)), h = h.next
                } while (h !== u.edge)
            }
            return new i({vertices: a, normals: o})
        }(u);
        if (h.type === T.MESH) return (l = B(u)) ? function (e) {
            var t = M(e);
            if (!t.length) return null;
            var n = Object.keys(t).map(Number);
            return new o(t, n)
        }(l) : null;
        if (h.type) throw new Error('[CANNON.threeToCannon] Invalid type "%s".', h.type);
        if (!(l = B(u))) return null;
        switch (l.metadata ? l.metadata.type : l.type) {
            case"BoxGeometry":
            case"BoxBufferGeometry":
                return b(l);
            case"CylinderGeometry":
            case"CylinderBufferGeometry":
                return function (e) {
                    var t = e.metadata ? e.metadata.parameters : e.parameters,
                        n = new r(t.radiusTop, t.radiusBottom, t.height, t.radialSegments);
                    return n._type = s.types.CYLINDER, n.radiusTop = t.radiusTop, n.radiusBottom = t.radiusBottom, n.height = t.height, n.numSegments = t.radialSegments, n.orientation = new a, n.orientation.setFromEuler(f.degToRad(-90), 0, 0, "XYZ").normalize(), n
                }(l);
            case"PlaneGeometry":
            case"PlaneBufferGeometry":
                return function (e) {
                    e.computeBoundingBox();
                    var i = e.boundingBox;
                    return new t(new n((i.max.x - i.min.x) / 2 || .1, (i.max.y - i.min.y) / 2 || .1, (i.max.z - i.min.z) / 2 || .1))
                }(l);
            case"SphereGeometry":
            case"SphereBufferGeometry":
                return function (t) {
                    return new e((t.metadata ? t.metadata.parameters : t.parameters).radius)
                }(l);
            case"TubeGeometry":
            case"Geometry":
            case"BufferGeometry":
                return F(u);
            default:
                return console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', l.type), b(l)
        }
    };

function b(e) {
    if (!M(e).length) return null;
    e.computeBoundingBox();
    var i = e.boundingBox;
    return new t(new n((i.max.x - i.min.x) / 2, (i.max.y - i.min.y) / 2, (i.max.z - i.min.z) / 2))
}

function F(e) {
    var i = e.clone();
    i.quaternion.set(0, 0, 0, 1), i.updateMatrixWorld();
    var r = (new d).setFromObject(i);
    if (!isFinite(r.min.lengthSq())) return null;
    var s = new t(new n((r.max.x - r.min.x) / 2, (r.max.y - r.min.y) / 2, (r.max.z - r.min.z) / 2)),
        a = r.translate(i.position.negate()).getCenter(new u);
    return a.lengthSq() && (s.offset = a), s
}

function B(e) {
    var t, n = function (e) {
        var t = [];
        return e.traverse(function (e) {
            "Mesh" === e.type && t.push(e)
        }), t
    }(e), i = new p, r = new p;
    if (0 === n.length) return null;
    if (1 === n.length) {
        var s = new u, a = new v, o = new u;
        return n[0].geometry.isBufferGeometry ? n[0].geometry.attributes.position && n[0].geometry.attributes.position.itemSize > 2 && i.fromBufferGeometry(n[0].geometry) : i = n[0].geometry.clone(), i.metadata = n[0].geometry.metadata, n[0].updateMatrixWorld(), n[0].matrixWorld.decompose(s, a, o), i.scale(o.x, o.y, o.z)
    }
    for (; t = n.pop();) if (t.updateMatrixWorld(), t.geometry.isBufferGeometry) {
        if (t.geometry.attributes.position && t.geometry.attributes.position.itemSize > 2) {
            var h = new p;
            h.fromBufferGeometry(t.geometry), r.merge(h, t.matrixWorld), h.dispose()
        }
    } else r.merge(t.geometry, t.matrixWorld);
    var l = new g;
    return l.scale(e.scale), r.applyMatrix(l), r
}

function M(e) {
    return e.attributes || (e = (new x).fromGeometry(e)), (e.attributes.position || {}).array || []
}

E.Type = T;
export {E as threeToCannon};
//# sourceMappingURL=three-to-cannon.module.js.map
