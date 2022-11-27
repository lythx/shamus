import { RoomEntrance } from "./RoomEntrance.js"
import { Point, Rectangle, Vector } from "./utils/Geometry.js"
import { WallEdge } from "./WallEdge.js"
import { WallInside } from "./WallInside.js"

const content = document.getElementById('content') as HTMLCanvasElement
const wrapper = document.getElementById('wrapper') as HTMLElement
let isEnabled = false
let startPoint: Point | undefined
let mode: 'edge' | 'inside'
let updateListener: (() => void) | undefined
const edgeWidth = 40
let edges: WallEdge[] = []
let insides: WallInside[] = []
const modeKeys = {
  '1': 'edge',
  '2': 'inside'
} as const
const helpers: Rectangle[] = [
  new Rectangle(new Point(1395, 280), new Point(1400, 505)),
  new Rectangle(new Point(0, 280), new Point(5, 505)),
  new Rectangle(new Point(587, 795), new Point(812, 800)),
  new Rectangle(new Point(587, 0), new Point(812, 5))
]

console.log(helpers[0].a, helpers[0].b, helpers[0].height, helpers[0].width)

const save = () => {
  document.write(JSON.stringify({
    theme: 'yellowCircle',
    edges: edges.map(e => [e.a.x, e.a.y, e.c.x, e.c.y]),
    insides: insides.map(e => [e.a.x, e.a.y, e.c.x, e.c.y]),
    entrances: []
  }))
}

document.addEventListener('keydown', (e) => {
  if (isEnabled) {
    const m = modeKeys[e.key as keyof typeof modeKeys]
    if (m !== undefined) {
      mode = m
    }
    if (e.key === 's') {
      save()
    }
    if (e.key === 'z') {
      if (mode === 'edge') {
        edges.pop()
      } else if (mode === 'inside') {
        insides.pop()
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
    console.log(p)
    console.log(e)
    if (e.pointCollision(p)) {
      insides = insides.filter(a => a !== e)
      updateListener?.()
      return
    }
  }
})

const getPoint = (x: number, y: number): Point => {
  if (x < 50) { x = 0 }
  if (y < 50) { y = 0 }
  if (x > 1350) { x = 1360 }
  if (y > 750) { y = 760 }
  let point = new Point(x, y)
  for (const e of helpers) {
    for (const p of [e.a, e.b, e.c, e.d]) {
      if (p.calculateDistance(point) < 20) {
        return p
      }
    }
  }
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
  return new Point(x, y)
}

content.addEventListener('mousedown', (e) => {
  e.preventDefault()
  if (!isEnabled || mode === undefined) { return }
  const rect = (e as any).target.getBoundingClientRect();
  startPoint = getPoint(~~(e.clientX - rect.left), ~~(e.clientY - rect.top))
})

content.addEventListener('mouseup', (e) => {
  if (!isEnabled || startPoint === undefined) { return }
  const rect = (e as any).target.getBoundingClientRect();
  const p = getPoint(~~(e.clientX - rect.left), ~~(e.clientY - rect.top))
  const edge = new WallEdge(startPoint, p)
  if (mode === 'edge') {
    if (edge.orientation === 'vertical') {
      edges.push(new WallEdge(edge.a, new Point(edge.a.x + edgeWidth, edge.c.y)))
    } else {
      edges.push(new WallEdge(edge.a, new Point(edge.c.x, edge.a.y + edgeWidth)))
    }
  } else if (mode === 'inside') {
    insides.push(new WallInside(startPoint, p, 'yellowCircle'))
  }
  updateListener?.()
  startPoint = undefined
})

const enable = (): Rectangle[] => {
  isEnabled = true
  wrapper.style.background = 'gray'
  content.style.background = '#000'
  return helpers
}
const disable = () => { isEnabled = false }
const getObjects = () => [...insides, ...edges, ...helpers]

export const editor = {
  onUpdate: (callback: () => void) => {
    updateListener = callback
  },
  enable,
  disable,
  isEnabled: () => isEnabled,
  getObjects
}