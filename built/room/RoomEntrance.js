import { Point, Rectangle } from "../utils/Geometry.js";
export class RoomEntrance extends Rectangle {
    orientation;
    entryCoord;
    nextRoom;
    spawnPoint;
    static entranceType = {
        left: () => [new Point(0, 280), new Point(5, 520)],
        right: () => [new Point(1395, 280), new Point(1400, 520)],
        down: () => [new Point(580, 795), new Point(820, 800)],
        up: () => [new Point(580, 0), new Point(820, 5)],
    };
    static entryCoords = {
        left: 1350,
        right: 50,
        down: 50,
        up: 750
    };
    static spawnPoints = {
        left: new Point(80, 400),
        right: new Point(1320, 400),
        down: new Point(700, 720),
        up: new Point(700, 80)
    };
    position;
    constructor(pos, nextRoom) {
        const points = RoomEntrance.entranceType[pos]();
        super(points[0], points[1]);
        this.entryCoord = RoomEntrance.entryCoords[pos];
        this.position = pos;
        this.orientation = this.width < this.height ? 'vertical' : 'horizontal';
        this.nextRoom = nextRoom;
        this.spawnPoint = RoomEntrance.spawnPoints[pos]; //todo change key color
    }
    getEntryPosition = (playerPos) => this.orientation === 'vertical' ? new Point(this.entryCoord, playerPos.y) :
        new Point(playerPos.x, this.entryCoord);
}
