import { Point, Vector } from './Geometry.js'

export class Rays {

  readonly size: number
  private _angle = 0
  private _pos: Point
  private sideTargets: [Point, Point, Point, Point]
  private midTarget: Point
  private isDisabled = false

  constructor(pos: Point, size: number) {
    this.size = size
    this._pos = this.midTarget = pos
    this.sideTargets = [pos, pos, pos, pos]
  }

  disable() {
    this.isDisabled = true
  }

  setTarget(target: Point, length: number): void {
    const v = Vector.from(new Vector(this._pos, target), length)
    this._angle = v.angle
    this.midTarget = v.b
    const sidePoints = this.getSidePoints()
    const v1 = new Vector(sidePoints[0], v.angle, length)
    const v2 = new Vector(sidePoints[1], v.angle, length)
    const v3 = new Vector(sidePoints[2], v.angle, length)
    const v4 = new Vector(sidePoints[3], v.angle, length)
    this.sideTargets[0] = v1.b
    this.sideTargets[1] = v2.b
    this.sideTargets[2] = v3.b
    this.sideTargets[3] = v4.b
  }

  set pos(pos: Point) {
    this._pos = pos
  }

  private getSidePoints(): [Point, Point, Point, Point] {
    const v1 = new Vector(new Vector(this._pos, this._angle - 90, this.size).b, this._angle, length)
    const v2 = new Vector(new Vector(this._pos, this._angle + 90, this.size).b, this._angle, length)
    const v3 = new Vector(new Vector(this._pos, this._angle - 90, this.size * 1.5).b, this._angle, length)
    const v4 = new Vector(new Vector(this._pos, this._angle + 90, this.size * 1.5).b, this._angle, length)
    return [v1.b, v2.b, v3.b, v4.b]
  }

  get(): Vector[] {
    if (this.isDisabled) { return [] }
    const sidePoints = this.getSidePoints()
    return [new Vector(this._pos, this.midTarget),
    new Vector(this._pos, this.sideTargets[2]),
    new Vector(this._pos, this.sideTargets[3]),
    new Vector(sidePoints[0], this.sideTargets[2]),
    new Vector(sidePoints[1], this.sideTargets[3])]
  }

}