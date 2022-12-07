import { Circle, Point, Rectangle, Vector } from "../utils/Geometry.js";
import { rooms as roomData } from './rooms.js'
import { WallEdge } from "./WallEdge.js";
import { WallInside } from './WallInside.js'
import { RoomEntrance } from './RoomEntrance.js'
import { GameItem } from "../items/GameItem.js";
import { MysteryItem } from "../items/MysteryItem.js";
import { ExtraLife } from "../items/ExtraLife.js";
import { GameKey } from "../items/GameKey.js";
import { KeyHole } from "../items/KeyHole.js";
import { Room } from './Room.js'
import { MovingBarrier } from './MovingBarrier.js'
import { Direction4 } from "../utils/Directions.js";

const rooms: { [roomNumber: number]: Room } = {}
let room: Room

const initialize = () => {
  const possibleKeySpawns: { [key: string]: number[] } = {}
  for (const [roomNumber, roomObj] of Object.entries(roomData)) {
    const item: { type: string, position: [number, number], color: string } | undefined = (roomObj as any).item
    if (item?.type === 'key') {
      if (Array.isArray(possibleKeySpawns[item.color])) {
        possibleKeySpawns[item.color].push(Number(roomNumber))
      } else {
        possibleKeySpawns[item.color] = [Number(roomNumber)]
      }
    }
  }
  const keySpawns: { [roomNumber: number]: string } = {}
  for (const key in possibleKeySpawns) {
    const arr = possibleKeySpawns[key]
    keySpawns[arr[~~(Math.random() * arr.length)]] = key
  }
  for (const [roomNumberStr, roomObj] of Object.entries(roomData)) {
    let barriers: MovingBarrier[] | undefined
    if ((roomObj as any).barrier === true) {
      barriers = [new MovingBarrier(450, 'left'), new MovingBarrier(950, 'right')]
    }
    const roomNumber = Number(roomNumberStr)
    const edges = roomObj.edges.map(a => new WallEdge(new Point(a[0], a[1]), new Point(a[2], a[3])))
    const insides = roomObj.insides.map(a => new WallInside(new Point(a[0], a[1]), new Point(a[2], a[3]), roomObj.theme))
    const entrances = roomObj.entrances.map(a => new RoomEntrance(a.pos as any, a.nextRoom))
    const units = roomObj.units
    const spawnAreas = roomObj.spawnAreas.map(a => new Rectangle(new Point(a[0], a[1]), new Point(a[2], a[3])))
    const itemObj: {
      type: string, position: [number, number], color: string,
      edgeToDelete: [number, number, number, number]
    } | undefined = (roomObj as any).item
    let item: { obj: GameItem, pos?: Point } | undefined
    if (itemObj === undefined) {
      item = undefined
    } else {
      const keyType = keySpawns[roomNumber]
      const pos = itemObj.position !== undefined ? new Point(itemObj.position[0], itemObj.position[1]) : undefined
      if (itemObj.type === 'key') {
        if (keyType !== undefined) {
          item = { obj: new GameKey(keyType as any), pos }
        } else {
          itemObj.type = 'random'
        }
      }
      if (itemObj.type === 'random') {
        itemObj.type = ['mystery', 'extra life'][~~(Math.random() * 2)]
      }
      if (itemObj.type === 'mystery') {
        item = { obj: new MysteryItem(), pos }
      } else if (itemObj.type === 'extra life') {
        item = { obj: new ExtraLife(), pos }
      } else if (itemObj.type === 'keyhole') {
        const r = itemObj.edgeToDelete 
        const edgeToDelete = new Rectangle(new Point(r[0], r[1]), new Point(r[2], r[3]))
        item = {
          obj: new KeyHole(itemObj.color as any, edgeToDelete), pos
        }
      }
    }
    rooms[roomNumber] = new Room(roomNumber, edges, insides, entrances, spawnAreas, units, item, barriers)
  }
}

const loadRoom = (roomNumber: number, usedEntrance: Direction4): Room => {
  const newRoom = rooms[roomNumber]
  if (newRoom === undefined) { throw new Error(`Room ${roomNumber} doesn't exist`) }
  newRoom.load(usedEntrance)
  room = newRoom
  return newRoom
}

export const roomManager = {
  initialize,
  loadRoom,
  circleCollision: (c: Circle, checkInsides?: true) => room.circleCollision(c, checkInsides),
  vectorCollision: (v: Vector) => room.vectorCollision(v),
  checkIfOnEntrance: (playerHitbox: Circle) => room.checkIfOnEntrance(playerHitbox)
}
