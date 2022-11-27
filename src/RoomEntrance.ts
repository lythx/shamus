import { Point, Rectangle } from "./utils/Geometry.js";
import { rooms } from "./rooms.js";

export class RoomEntrance extends Rectangle {

  readonly orientation: 'vertical' | 'horizontal'
  readonly entryCoord: number
  readonly nextRoom: number
  static entranceType = {
    left: () => [new Point(0, 280), new Point(5, 505)],
    right: () => [new Point(1395, 280), new Point(1400, 505)],
    down: () => [new Point(587, 795), new Point(812, 800)],
    up: () => [new Point(587, 0), new Point(812, 5)],
  } as const
  static entryCoords = {
    left: 1350,
    right: 50,
    down: 50,
    up: 750
  }

  constructor(pos: 'left' | 'right' | 'down' | 'up', nextRoom: number) {
    const points = RoomEntrance.entranceType[pos]()
    super(points[0], points[1])
    this.entryCoord = RoomEntrance.entryCoords[pos]
    this.orientation = this.width < this.height ? 'vertical' : 'horizontal'
    this.nextRoom = nextRoom
  }

  getEntryPosition = (playerPos: Point): Point =>
    this.orientation === 'vertical' ? new Point(this.entryCoord, playerPos.y) :
      new Point(playerPos.x, this.entryCoord)


}