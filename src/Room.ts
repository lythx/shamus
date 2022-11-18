import { Circle, Point, Rectangle, Vector } from "./Utils.js";
import rooms from './rooms.js'

let wallRects: Rectangle[] = []

const loadRoom = (key: number) => {
  const data = rooms[key as keyof typeof rooms]
  if (data === undefined) { throw new Error(`Room ${key} doesn't exist`) }
  wallRects = data.map(a => new Rectangle(new Point(a[0], a[1]), a[2], a[3]))
}

const checkCollision = (c: Circle) => {
  for (let i = 0; i < wallRects.length; i++) {
    if (wallRects[i].circleCollision(c)) { return true }
  }
  return false
}

const getPolygons = () => {
  const polygons: Vector[] = []
  for (const e of wallRects) {
    polygons.push(...e.getPolygons())
  }
  return polygons;
}

export { checkCollision, loadRoom, getPolygons }