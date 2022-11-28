import { Circle, Point, Rectangle, Vector } from "./utils/Geometry.js";
import { rooms } from './rooms.js'
import { WallEdge } from "./WallEdge.js";
import { WallInside } from './WallInside.js'
import { RoomEntrance } from './RoomEntrance.js'

let edges: WallEdge[] = []
let insides: WallInside[] = []
let entrances: RoomEntrance[] = []
let units: { drone?: number, jumper?: number }
let spawnAreas: Rectangle[] = []
let spawnPoint: Point

const loadRoom = (key: number) => {
  const data = rooms[key as keyof typeof rooms]
  if (data === undefined) { throw new Error(`Room ${key} doesn't exist`) }
  edges = data.edges.map(a => new WallEdge(new Point(a[0], a[1]), new Point(a[2], a[3])))
  insides = data.insides.map(a => new WallInside(new Point(a[0], a[1]), new Point(a[2], a[3]), data.theme))
  entrances = data.entrances.map(a => new RoomEntrance(a.pos as any, a.nextRoom))
  units = data.units
  spawnAreas = data.spawnAreas.map(a => new Rectangle(new Point(a[0], a[1]), new Point(a[2], a[3])))
  spawnPoint = new Point(data.spawnPoint[0], data.spawnPoint[1])
}

const circleCollision = (c: Circle, checkInsides?: true) => {
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].circleCollision(c)) { return true }
  }
  for (let i = 0; i < entrances.length; i++) {
    if (entrances[i].circleCollision(c)) { return true }
  }
  if (checkInsides === true) {
    for (let i = 0; i < entrances.length; i++) {
      if (insides[i].circleCollision(c)) { return true }
    }
  }
  return false
}

const vectorCollision = (v: Vector): Point | undefined => {
  let minDist = Infinity
  let minPoint: Point | undefined
  for (let i = 0; i < edges.length; i++) {
    const p = edges[i].vectorIntersection(v)
    if (p !== undefined) {
      const dist = p.calculateDistance(v.a)
      if (dist < minDist) {
        minDist = dist
        minPoint = p
      }
    }
  }
  for (let i = 0; i < entrances.length; i++) {
    const p = entrances[i].vectorIntersection(v)
    if (p !== undefined) {
      const dist = p.calculateDistance(v.a)
      if (dist < minDist) {
        minDist = dist
        minPoint = p
      }
    }
  }
  return minPoint
}

const checkIfOnEntrance = (playerHitbox: Circle): { pos: Point; room: number; } | false => {
  for (let i = 0; i < entrances.length; i++) {
    if (entrances[i].circleCollision(playerHitbox)) {
      return { pos: entrances[i].getEntryPosition(playerHitbox.center), room: entrances[i].nextRoom }
    }
  }
  return false
}

export const room = {
  circleCollision, vectorCollision, checkIfOnEntrance, loadRoom,
  get edges() {
    return edges
  },
  get insides(){
    return insides
  },
  get units() {
    return units
  },
  get spawnAreas() {
    return spawnAreas
  },
  get spawnPoint() {
    return spawnPoint
  }
}
