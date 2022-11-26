import { Point, Rectangle } from "./utils/Geometry.js";
import { rooms } from "./rooms.js";

export class RoomEntrance extends Rectangle {

  readonly orientation: 'vertical' | 'horizontal'
  readonly entryCoord: number
  readonly nextRoom: number

  constructor(a: Point, b: Point, currentRoom: number, nextRoom: number) {
    super(a, b)
    this.entryCoord = rooms[nextRoom as keyof typeof rooms].entrances.find(a => a.room === currentRoom)?.entryCoord as number
    this.orientation = this.width < this.height ? 'vertical' : 'horizontal'
    this.nextRoom = nextRoom
  }

  getEntryPosition = (playerPos: Point): Point =>
    this.orientation === 'vertical' ? new Point(this.entryCoord, playerPos.y) :
      new Point(playerPos.x, this.entryCoord)


}