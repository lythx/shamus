import { rooms } from "./rooms.js"
import { Point, Rectangle } from "./utils/Geometry.js"
import { WallEdge } from "./room/WallEdge.js"
import { WallInside } from "./room/WallInside.js"

let placementCorrection = true
const defaultRoom = 37
const content = document.getElementById('content') as HTMLCanvasElement
const wrapper = document.getElementById('wrapper') as HTMLElement
let isEnabled = false
let startPoint: Point | undefined
let mode: 'edge' | 'inside' | 'spawn' | 'spawnPoint' | 'item'
let topPlacement = true
let updateListener: (() => void) | undefined
const edgeWidth = 40
let edges = rooms[defaultRoom].edges.map(a => new WallEdge(new Point(a[0], a[1]), new Point(a[2], a[3])))
let insides = rooms[defaultRoom].insides.map(a => new WallInside(new Point(a[0], a[1]), new Point(a[2], a[3]), 'yellowCircle'))
let spawns = rooms[defaultRoom].spawnAreas.map(a => new Rectangle(new Point(a[0], a[1]), new Point(a[2], a[3])))
const entrances = rooms[defaultRoom].entrances
let spawnPoint = new Point(rooms[defaultRoom].spawnPoint[0], rooms[defaultRoom].spawnPoint[1])
const defaultItem: {
  type: string,
  position: [number, number],
  color: string
} | undefined = (rooms[defaultRoom] as any).item
let itemPos = defaultItem === undefined ? undefined : new Point(defaultItem.position[0], defaultItem.position[1])


const modeKeys = {
  '1': 'edge',
  '2': 'inside',
  '3': 'spawn',
  '4': 'spawnPoint',
  '5': 'item'
} as const
const helpers: Rectangle[] = [
  new Rectangle(new Point(1395, 280), new Point(1400, 505)),
  new Rectangle(new Point(0, 280), new Point(5, 505)),
  new Rectangle(new Point(587, 795), new Point(812, 800)),
  new Rectangle(new Point(587, 0), new Point(812, 5))
]
const helperPoints: Point[] = [
  new Point(1400, 280),
  new Point(1400, 505),
  new Point(0, 280), new Point(0, 505),
  new Point(587, 800), new Point(812, 800),
  new Point(587, 0), new Point(812, 0)
]

const save = () => {
  document.write(JSON.stringify({
    item: {
      type: 'key',
      position: itemPos === undefined ? [] : [itemPos.x, itemPos.y],
      color: 'purple'
    },
    units: {
      drone: 0,
      jumper: 0,
      droid: 0
    },
    entrances,
    theme: 'yellowCircle',
    edges: edges.map(e => [e.a.x, e.a.y, e.c.x, e.c.y]),
    insides: insides.map(e => [e.a.x, e.a.y, e.c.x, e.c.y]),
    spawnAreas: spawns.map(e => [e.a.x, e.a.y, e.c.x, e.c.y]),
    spawnPoint: [spawnPoint.x, spawnPoint.y]
  }, null, 2))
}

document.addEventListener('keydown', (e) => {
  if (isEnabled) {
    const m = modeKeys[e.key as keyof typeof modeKeys]
    if (m !== undefined) {
      mode = m
    } else if (e.key === 't') {
      placementCorrection = !placementCorrection
    } else if (e.key === 's') {
      save()
    } else if (e.key === 'q') {
      topPlacement = !topPlacement
    } else if (e.key === 'z') {
      if (mode === 'edge') {
        edges.pop()
      } else if (mode === 'inside') {
        insides.pop()
      } else if (mode === 'spawn') {
        spawns.pop()
      }
      updateListener?.()
    }
  }
})

content.addEventListener('contextmenu', (e) => {
  if (!isEnabled) { return }
  const rect = (e as any).target.getBoundingClientRect();
  const p = new Point(e.clientX - rect.left, e.clientY - rect.top)
  e.preventDefault()
  for (const e of edges) {
    if (e.pointCollision(p)) {
      edges = edges.filter(a => a !== e)
      updateListener?.()
      return
    }
  }
  for (const e of insides) {
    if (e.pointCollision(p)) {
      insides = insides.filter(a => a !== e)
      updateListener?.()
      return
    }
  }
  for (const e of spawns) {
    if (e.pointCollision(p)) {
      spawns = spawns.filter(a => a !== e)
      updateListener?.()
      return
    }
  }
})

const getPoint = (x: number, y: number): Point => {
  if (!placementCorrection) { return new Point(x, y) }
  if (x < 50) { x = 0 }
  if (y < 50) { y = 0 }
  if (x > 1350) { x = topPlacement ? 1360 : 1400 }
  if (y > 750) { y = topPlacement ? 760 : 800 }
  let point = new Point(x, y)
  for (const e of edges) {
    for (const p of [e.a, e.b, e.c, e.d]) {
      if (p.calculateDistance(point) < 20) {
        return p
      }
    }
  }
  for (const e of insides) {
    for (const p of [e.a, e.b, e.c, e.d]) {
      if (p.calculateDistance(point) < 20) {
        return p
      }
    }
  }
  for (const e of helperPoints) {
    if (e.calculateDistance(point) < 20) {
      return e
    }
  }
  return new Point(x, y)
}

const adjustEdge = (w: WallEdge): WallEdge => {
  let minDiff = Infinity
  let closest = w.a
  let target = w.a
  if (w.orientation === 'vertical') {
    for (const e of [w.a, w.b, w.c, w.d]) {
      const p = getPoint(e.x, e.y)
      const dist = e.calculateDistance(p)
      if (dist !== 0 && minDiff > dist) {
        minDiff = dist
        closest = e
        target = p
      }
    }
    if (closest === w.a) {
      w = new WallEdge(target, new Point(target.x + edgeWidth, getPoint(target.x + edgeWidth, w.c.y).y))
    } else if (closest === w.b) {
      w = new WallEdge(new Point(target.x - edgeWidth, target.y), new Point(target.x, getPoint(target.x, w.c.y).y))
    } else if (closest === w.c) {
      w = new WallEdge(new Point(target.x - edgeWidth, getPoint(target.x - edgeWidth, w.a.y).y), new Point(target.x, target.y))
    } else if (closest === w.d) {
      w = new WallEdge(new Point(target.x, getPoint(target.x, w.a.y).y), new Point(target.x + edgeWidth, target.y))
    }
    return w
  } else {
    return w
  }
}

content.addEventListener('mousedown', (e) => {
  if (e.button !== 0) { return }
  e.preventDefault()
  if (!isEnabled || mode === undefined) { return }
  const rect = (e as any).target.getBoundingClientRect();
  startPoint = getPoint(~~(e.clientX - rect.left), ~~(e.clientY - rect.top))
})

content.addEventListener('mouseup', (e) => {
  if (e.button !== 0) { return }
  if (!isEnabled || startPoint === undefined) { return }
  const rect = (e as any).target.getBoundingClientRect();
  const p = getPoint(~~(e.clientX - rect.left), ~~(e.clientY - rect.top))
  const edge = new WallEdge(startPoint, p)
  if (mode === 'edge') {
    let w: WallEdge
    if (edge.orientation === 'vertical') {
      w = adjustEdge(new WallEdge(edge.a, new Point(edge.a.x + edgeWidth, edge.c.y)))
    } else {
      w = adjustEdge(new WallEdge(edge.a, new Point(edge.c.x, edge.a.y + edgeWidth)))
    }
    startPoint = undefined
    if (w.area < 300) { return }
    edges.push(w)
  } else if (mode === 'inside') {
    const w = new WallInside(startPoint, p, 'yellowCircle')
    startPoint = undefined
    if (w.area < 300) { return }
    insides.push(w)
  } else if (mode === 'spawn') {
    const r = new Rectangle(startPoint, p)
    startPoint = undefined
    if (r.area < 300) { return }
    spawns.push(r)
  } else if (mode === 'spawnPoint') {
    spawnPoint = new Point(~~(e.clientX - rect.left), ~~(e.clientY - rect.top))
    startPoint = undefined
  } else if (mode === 'item') {
    itemPos = new Point(~~(e.clientX - rect.left), ~~(e.clientY - rect.top))
    startPoint = undefined
  }
  updateListener?.()
})

const enable = (): void => {
  isEnabled = true
  wrapper.style.background = 'gray'
  content.style.background = '#000'
  updateListener?.()
}
const disable = () => { isEnabled = false }
const getObjects = () => [spawnPoint, (itemPos ?? new Point(-1, -1)), ...spawns, ...insides, ...edges, ...helpers]

export const editor = {
  onUpdate: (callback: () => void) => {
    updateListener = callback
  },
  enable,
  disable,
  isEnabled: () => isEnabled,
  getObjects
}