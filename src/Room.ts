import { Circle, Point, Rectangle, Vector } from "./utils/Geometry.js";
import rooms from './rooms.js'

let wallRects: Rectangle[] = []

const loadRoom = (key: number) => {
  const data = rooms[key as keyof typeof rooms]
  if (data === undefined) { throw new Error(`Room ${key} doesn't exist`) }
  wallRects = data.map(a => new Rectangle(new Point(a[0], a[1]), a[2], a[3]))
}

const circleCollision = (c: Circle) => {
  for (let i = 0; i < wallRects.length; i++) {
    if (wallRects[i].circleCollision(c)) { return true }
  }
  return false
}

const vectorCollision = (v: Vector): Point | undefined => {
  let minDist = Infinity
  let minPoint: Point | undefined
  for (let i = 0; i < wallRects.length; i++) {
    const p = wallRects[i].vectorIntersection(v)
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

const getRectangles = () => {
  return wallRects
}

export const room = { circleCollision, vectorCollision, loadRoom, getRectangles }