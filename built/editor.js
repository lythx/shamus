import { rooms } from "./room/rooms.js";
import { Point, Rectangle } from "./utils/Geometry.js";
import { WallEdge } from "./room/WallEdge.js";
import { WallInside } from "./room/WallInside.js";
const r = (a, b, c, d) => new Rectangle(new Point(a, b), new Point(c, d));
const possibleEdges = [
    r(0, 240, 290, 280), r(0, 240, 40, 560),
    r(0, 520, 290, 560),
    r(250, 0, 580, 40), r(250, 0, 290, 280),
    r(250, 240, 580, 280), r(250, 240, 290, 560),
    r(250, 520, 580, 560), r(250, 520, 290, 800),
    r(250, 760, 580, 800),
    r(540, 0, 860, 40), r(540, 0, 580, 280),
    r(540, 240, 860, 280), r(540, 240, 580, 560),
    r(540, 520, 860, 560), r(540, 520, 580, 800),
    r(540, 760, 860, 800),
    r(820, 0, 1150, 40), r(820, 0, 860, 280),
    r(820, 240, 1150, 280), r(820, 240, 860, 560),
    r(820, 520, 1150, 560), r(820, 520, 860, 800),
    r(820, 760, 1150, 800),
    r(1110, 0, 1150, 280),
    r(1110, 240, 1400, 280), r(1110, 240, 1150, 560),
    r(1110, 520, 1400, 560), r(1110, 520, 1150, 800),
    r(1360, 240, 1400, 560)
];
const themes = ['yellowCircle', 'greenBrick', 'purpleHex', 'yellowSolid'];
let themeIndex = 0;
let theme = 'yellowCircle';
let placementCorrection = true;
const defaultRoom = 0;
const content = document.getElementById('content');
const wrapper = document.getElementById('wrapper');
let isEnabled = false;
let startPoint;
let mode = 'edge';
let topPlacement = true;
let updateListener;
let edges = [];
let insides = rooms[defaultRoom].insides.map(a => new WallInside(new Point(a[0], a[1]), new Point(a[2], a[3]), theme));
let spawns = [];
const entrances = rooms[defaultRoom].entrances;
let itemPos = undefined; // defaultItem === undefined ? undefined : new Point(defaultItem.position[0], defaultItem.position[1])
const modeKeys = {
    '1': 'edge',
    '2': 'inside',
    '3': 'spawn',
    '4': 'item'
};
const helpers = [
    new Rectangle(new Point(0, 280), new Point(5, 520)),
    new Rectangle(new Point(1395, 280), new Point(1400, 520)),
    new Rectangle(new Point(580, 795), new Point(820, 800)),
    new Rectangle(new Point(580, 0), new Point(820, 5))
];
const helperPoints = [
    new Point(1400, 280),
    new Point(1400, 505),
    new Point(0, 280), new Point(0, 505),
    new Point(587, 800), new Point(812, 800),
    new Point(587, 0), new Point(812, 0)
];
const save = () => {
    document.write(JSON.stringify({
        item: {
            type: 'random'
        },
        units: {
            drone: 0,
            jumper: 0,
            droid: 0
        },
        entrances,
        theme,
        edges: edges.map(e => [e.a.x, e.a.y, e.c.x, e.c.y]),
        insides: insides.map(e => [e.a.x, e.a.y, e.c.x, e.c.y]),
        spawnAreas: spawns.map(e => [e.a.x, e.a.y, e.c.x, e.c.y])
    }, null, 2));
};
document.addEventListener('keydown', (e) => {
    if (isEnabled) {
        const m = modeKeys[e.key];
        if (m !== undefined) {
            mode = m;
        }
        else if (e.key === 't') {
            placementCorrection = !placementCorrection;
        }
        else if (e.key === 's') {
            save();
        }
        else if (e.key === 'q') {
            topPlacement = !topPlacement;
        }
        else if (e.key === 'z') {
            if (mode === 'edge') {
                edges.pop();
            }
            else if (mode === 'inside') {
                insides.pop();
            }
            else if (mode === 'spawn') {
                spawns.pop();
            }
            updateListener?.();
        }
        else if (e.key === 'd') {
            themeIndex++;
            themeIndex %= themes.length;
            theme = themes[themeIndex];
            const ins = [];
            for (const e of insides) {
                ins.push(new WallInside(e.a, e.c, theme));
            }
            insides = ins;
            updateListener?.();
        }
    }
});
content.addEventListener('contextmenu', (e) => {
    if (!isEnabled) {
        return;
    }
    const rect = e.target.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);
    e.preventDefault();
    for (const e of edges) {
        if (e.pointCollision(p)) {
            edges = edges.filter(a => a !== e);
            updateListener?.();
            return;
        }
    }
    for (const e of insides) {
        if (e.pointCollision(p)) {
            insides = insides.filter(a => a !== e);
            updateListener?.();
            return;
        }
    }
    for (const e of spawns) {
        if (e.pointCollision(p)) {
            spawns = spawns.filter(a => a !== e);
            updateListener?.();
            return;
        }
    }
});
const getPoint = (x, y) => {
    if (!placementCorrection) {
        return new Point(x, y);
    }
    if (x < 50) {
        x = 0;
    }
    if (y < 50) {
        y = 0;
    }
    if (x > 1350) {
        x = topPlacement ? 1360 : 1400;
    }
    if (y > 750) {
        y = topPlacement ? 760 : 800;
    }
    let point = new Point(x, y);
    for (const e of edges) {
        for (const p of [e.a, e.b, e.c, e.d]) {
            if (p.calculateDistance(point) < 20) {
                return p;
            }
        }
    }
    for (const e of insides) {
        for (const p of [e.a, e.b, e.c, e.d]) {
            if (p.calculateDistance(point) < 20) {
                return p;
            }
        }
    }
    for (const e of helperPoints) {
        if (e.calculateDistance(point) < 20) {
            return e;
        }
    }
    return new Point(x, y);
};
content.addEventListener('mousedown', (e) => {
    if (e.button !== 0) {
        return;
    }
    e.preventDefault();
    if (!isEnabled || mode === undefined) {
        return;
    }
    const rect = e.target.getBoundingClientRect();
    startPoint = getPoint(~~(e.clientX - rect.left), ~~(e.clientY - rect.top));
    if (mode === 'edge') {
        const edge = possibleEdges.find(a => a.pointCollision(new Point(e.clientX - rect.left, e.clientY - rect.top)));
        if (edge !== undefined) {
            if (!edges.some(a => a.equals(edge))) {
                edges.push(new WallEdge(edge.a, edge.c));
                updateListener?.();
            }
        }
    }
});
content.addEventListener('mouseup', (e) => {
    if (e.button !== 0) {
        return;
    }
    if (!isEnabled || startPoint === undefined) {
        return;
    }
    const rect = e.target.getBoundingClientRect();
    const p = getPoint(~~(e.clientX - rect.left), ~~(e.clientY - rect.top));
    if (mode === 'inside') {
        const w = new WallInside(startPoint, p, 'yellowCircle');
        startPoint = undefined;
        if (w.area < 300) {
            return;
        }
        insides.push(w);
    }
    else if (mode === 'spawn') {
        const r = new Rectangle(startPoint, p);
        startPoint = undefined;
        if (r.area < 300) {
            return;
        }
        spawns.push(r);
    }
    else if (mode === 'item') {
        itemPos = new Point(~~(e.clientX - rect.left), ~~(e.clientY - rect.top));
        startPoint = undefined;
    }
    updateListener?.();
});
const enable = () => {
    isEnabled = true;
    wrapper.style.background = 'gray';
    content.style.background = '#000';
    updateListener?.();
};
const disable = () => { isEnabled = false; };
const getObjects = () => [...possibleEdges, (itemPos ?? new Point(-1, -1)), ...spawns, ...insides, ...edges, ...helpers];
export const editor = {
    onUpdate: (callback) => {
        updateListener = callback;
    },
    enable,
    disable,
    isEnabled: () => isEnabled,
    getObjects
};
