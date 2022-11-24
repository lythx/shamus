import { Point, Vector } from './Geometry.js'

export class Rays {

  readonly size: number
  private _angle = 0
  private _pos: Point
  private sideTargets: [Point, Point]
  private midTarget: Point

  constructor(pos: Point, size: number) {
    this.size = size
    this._pos = this.midTarget = pos
    this.sideTargets = [pos, pos]
  }

  setTarget(target: Point, length: number): void {
    const v = Vector.from(new Vector(this._pos, target), length)
    this._angle = v.angle
    this.midTarget = v.b
    const sidePoints = this.getSidePoints()
    const v3 = new Vector(sidePoints[0], v.angle, length)
    const v4 = new Vector(sidePoints[1], v.angle, length)
    this.sideTargets[0] = v3.b
    this.sideTargets[1] = v4.b
  }

  set pos(pos: Point) {
    this._pos = pos
  }

  private getSidePoints(): [Point, Point] {
    const v1 = new Vector(new Vector(this._pos, this._angle - 90, this.size).b, this._angle, length)
    const v2 = new Vector(new Vector(this._pos, this._angle + 90, this.size).b, this._angle, length)
    return [v1.b, v2.b]
  }

  get(): Vector[] {
    const sidePoints = this.getSidePoints()
    return [new Vector(this._pos, this.midTarget),
    new Vector(this._pos, this.sideTargets[0]),
    new Vector(this._pos, this.sideTargets[1]),
    new Vector(this._pos, this.sideTargets[0]),
    new Vector(sidePoints[0], this.sideTargets[0]),
    new Vector(sidePoints[1], this.sideTargets[1])]
  }

}