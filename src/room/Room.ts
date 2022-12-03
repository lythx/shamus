import { WallInside } from './WallInside.js'
import { WallEdge } from './WallEdge.js'
import { RoomEntrance } from './RoomEntrance.js'
import { GameItem } from '../items/GameItem.js'
import { Circle, Drawable, Point, Rectangle, Vector } from '../utils/Geometry.js'
import { Direction4 } from '../utils/Directions.js'
import { config } from '../config.js'

interface EnemyUnits {
  droid: number
  drone: number
  jumper: number
}
export class Room implements Drawable {

  edges: WallEdge[]
  readonly insides: WallInside[]
  readonly entrances: RoomEntrance[]
  readonly spawnAreas: Rectangle[]
  readonly roomNumber: number
  item: GameItem | undefined
  readonly itemPos: Point | undefined
  enemies: EnemyUnits
  private _spawnPoint: Point
  private _spawnSide: Direction4
  static randomItemPositions: Point[] = config.room.randomItemPositions.map(a => new Point(a[0], a[1]))
  readonly randomItemPositions: Point[] = []
  private readonly baseEnemies: Partial<EnemyUnits>

  constructor(roomNumber: number, edges: WallEdge[], insides: WallInside[], entrances: RoomEntrance[],
    spawnAreas: Rectangle[], enemies: Partial<EnemyUnits>, item?: { obj: GameItem, pos?: Point }) {
    this.edges = edges
    this.insides = insides
    this.entrances = entrances
    this.spawnAreas = spawnAreas
    this.roomNumber = roomNumber
    this.item = item?.obj
    this.itemPos = item?.pos
    if (this.item !== undefined && this.itemPos !== undefined) {
      this.item.pos = this.itemPos
    }
    this._spawnPoint = this.entrances[0].spawnPoint
    this._spawnSide = this.entrances[0].position
    this.randomItemPositions = Room.randomItemPositions
      .filter(a => this.circleCollision(new Circle(a, config.items.size)))
    this.baseEnemies = enemies
    this.enemies = this.randomizeUnitCount(this.baseEnemies)
  }

  load(usedEntrance: Direction4): void {
    if (this.item !== undefined) {
      if (this.itemPos === undefined) {
        this.item.pos =
          this.randomItemPositions[~~(Math.random() * this.randomItemPositions.length)]
      }
    }
    for (const e of this.entrances) {
      if (e.position === usedEntrance) {
        this._spawnPoint = e.spawnPoint
        this._spawnSide = e.position
      }
    }
    this.enemies = this.randomizeUnitCount(this.baseEnemies)
  }

  randomizeUnitCount(units: Partial<EnemyUnits>): EnemyUnits {
    const obj: EnemyUnits = {
      drone: 0,
      droid: 0,
      jumper: 0
    }
    for (const unitType in units) {
      const amount = units[unitType as keyof EnemyUnits] as number
      const maxOffset = amount * config.room.enemyCountOffset
      const offset = ~~(Math.random() * maxOffset)
      obj[unitType as keyof EnemyUnits] = amount - maxOffset / 2 + offset
    }
    return obj
  }

  deleteEdge(r: Rectangle) {
    this.edges = this.edges.filter(a => !r.equals(a))
  }

  get spawnPoint() {
    return this._spawnPoint
  }

  get spawnSide() {
    return this._spawnSide
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.edges.length; i++) {
      this.edges[i].draw(ctx)
    }
    for (let i = 0; i < this.insides.length; i++) {
      this.insides[i].draw(ctx)
    }
    if (this.item !== undefined) {
      this.item.draw(ctx)
    }
  }

  circleCollision(c: Circle, checkInsides?: true) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].circleCollision(c)) { return true }
    }
    for (let i = 0; i < this.entrances.length; i++) {
      if (this.entrances[i].circleCollision(c)) { return true }
    }
    if (checkInsides === true) {
      for (let i = 0; i < this.entrances.length; i++) {
        if (this.insides[i].circleCollision(c)) { return true }
      }
    }
    return false
  }

  vectorCollision(v: Vector): Point | undefined {
    let minDist = Infinity
    let minPoint: Point | undefined
    for (let i = 0; i < this.edges.length; i++) {
      const p = this.edges[i].vectorIntersection(v)
      if (p !== undefined) {
        const dist = p.calculateDistance(v.a)
        if (dist < minDist) {
          minDist = dist
          minPoint = p
        }
      }
    }
    for (let i = 0; i < this.entrances.length; i++) {
      const p = this.entrances[i].vectorIntersection(v)
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

  checkIfOnEntrance(playerHitbox: Circle): { pos: Point; room: number; side: Direction4 } | false {
    for (let i = 0; i < this.entrances.length; i++) {
      if (this.entrances[i].circleCollision(playerHitbox)) {
        return {
          pos: this.entrances[i].getEntryPosition(playerHitbox.center),
          room: this.entrances[i].nextRoom,
          side: this.entrances[i].position
        }
      }
    }
    return false
  }

}