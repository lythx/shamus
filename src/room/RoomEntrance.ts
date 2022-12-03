import { Point, Rectangle } from "../utils/Geometry.js";
import { rooms } from "../rooms.js";
import { Direction4 } from "../utils/Directions.js";

export class RoomEntrance extends Rectangle {

  readonly orientation: 'vertical' | 'horizontal'
  readonly entryCoord: number
  readonly nextRoom: number
  readonly spawnPoint: Point
  static entranceType = {
    left: () => [new Point(0, 280), new Point(5, 520)],
    right: () => [new Point(1395, 280), new Point(1400, 520)],
    down: () => [new Point(580, 795), new Point(820, 800)],
    up: () => [new Point(580, 0), new Point(820, 5)],
  } as const
  static entryCoords = {
    left: 1350,
    right: 50,
    down: 50,
    up: 750
  }
  static spawnPoints = {
    left: new Point(80, 400),
    right: new Point(1320, 400),
    down: new Point(700, 720),
    up: new Point(700, 80)
  }
  readonly position: Direction4

  constructor(pos: Direction4, nextRoom: number) {
    const points = RoomEntrance.entranceType[pos]()
    super(points[0], points[1])
    this.entryCoord = RoomEntrance.entryCoords[pos]
    this.position = pos
    this.orientation = this.width < this.height ? 'vertical' : 'horizontal'
    this.nextRoom = nextRoom
    this.spawnPoint = RoomEntrance.spawnPoints[pos]
  }

  getEntryPosition = (playerPos: Point): Point =>
    this.orientation === 'vertical' ? new Point(this.entryCoord, playerPos.y) :
      new Point(playerPos.x, this.entryCoord)


}