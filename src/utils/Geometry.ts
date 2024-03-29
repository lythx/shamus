import { config } from "../config.js"

const debugCfg = config.debug

const math = {
  fixedSin: (x: number) => Math.sin(Number(x.toFixed(4))),
  fixedCos: (x: number) => Math.cos(Number(x.toFixed(4))),
  degToRad: (deg: number) => deg * (Math.PI / 180),
  radToDeg: (rad: number) => rad * (180 / Math.PI)
}

interface Drawable {
  draw(ctx: CanvasRenderingContext2D): void
}

class Point implements Drawable {

  private _x: number
  private _y: number

  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const initialFillStyle = ctx.fillStyle
    ctx.fillStyle = debugCfg.colours.point
    ctx.beginPath()
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = initialFillStyle
  }

  equals = (p: Point): boolean => p.x === this._x && p.y === this._y

  static isPoint = (arg: any): arg is Point => arg.constructor.name === 'Point'

  calculateDistance = (p: Point): number =>
    Math.hypot(p.x - this.x, p.y - this.y)

  get x(): number {
    return this._x
  }

  get y(): number {
    return this._y
  }

}

class Vector implements Drawable {

  a: Point
  b: Point

  /**
   * @param a Starting point
   * @param angle Angle in degrees
   */
  constructor(a: Point, angle: number, length: number)
  constructor(a: Point, b: Point)
  constructor(a: Point, arg: Point | number, length?: number) {
    if (typeof arg === 'number') {
      if (typeof length !== 'number') {
        throw new Error('Length is undefined or not a number in vector')
      }
      this.a = a
      const radians = math.degToRad(arg)
      this.b = new Point(length * math.fixedCos(radians) + a.x,
        length * math.fixedSin(radians) + a.y)
    } else {
      this.a = a
      this.b = arg
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const initialStrokeStyle = ctx.strokeStyle
    ctx.strokeStyle = debugCfg.colours.vector
    ctx.beginPath()
    ctx.moveTo(this.a.x, this.a.y)
    ctx.lineTo(this.b.x, this.b.y)
    ctx.stroke()
    ctx.strokeStyle = initialStrokeStyle
  }

  static isVector = (arg: any): arg is Vector => arg.constructor.name === 'Vector'

  static from(vector: Vector, length: number): Vector
  static from(vector: Vector, angle: number, fromAngle?: true): Vector
  static from(vector: Vector, arg: number, fromAngle?: true): Vector {
    if (fromAngle) {
      return new Vector(vector.a, arg, vector.length)
    }
    return new Vector(vector.a, vector.angle, arg)
  }

  get length(): number {
    return Math.hypot(this.b.x - this.a.x, this.b.y - this.a.y)
  }

  get angle(): number {
    const angle = Math.atan2(this.b.y - this.a.y, this.b.x - this.a.x)
    const degrees = math.radToDeg(angle)
    return (360 + Math.round(degrees)) % 360
  }

  containsPoint(v: Vector, p: Point, vectorThickness: number = 1): boolean {
    const d2 = (v.b.x - v.a.x) * (v.b.x - v.a.x) + (v.b.y - v.a.y) * (v.b.y - v.a.y)
    if (d2 === 0) { return false }
    const r = (((p.x - v.a.x) * (v.b.x - v.a.x)) + ((p.y - v.a.y) * (v.b.y - v.a.y))) / d2
    if (r < 0) {
      return (Math.sqrt(((v.a.x - p.x) * (v.a.x - p.x)) + ((v.a.y - p.y) * (v.a.y - p.y))) <= vectorThickness)
    } else if ((0 <= r) && (r <= 1)) {
      const s = (((v.a.y - p.y) * (v.b.x - v.a.x)) - ((v.a.x - p.x) * (v.b.y - v.a.y))) / d2
      return (Math.abs(s) * Math.sqrt(d2) <= vectorThickness)
    } else {
      return (Math.sqrt(((v.b.x - p.x) * (v.b.x - p.x)) + ((v.b.y - p.y) * (v.b.y - p.y))) <= vectorThickness)
    }
  }

  intersection(v: Vector): Point | undefined {
    const c2x = v.a.x - v.b.x
    const c3x = this.a.x - this.b.x
    const c2y = v.a.y - v.b.y
    const c3y = this.a.y - this.b.y
    const d = c3x * c2y - c3y * c2x;
    if (d === 0) { return }
    const u1 = this.a.x * this.b.y - this.a.y * this.b.x
    const u4 = v.a.x * v.b.y - v.a.y * v.b.x
    const px = (u1 * c2x - c3x * u4) / d
    const py = (u1 * c2y - c3y * u4) / d
    const p = new Point(px, py)
    if (this.containsPoint(v, p) && this.containsPoint(this, p)) {
      return new Point(px, py);
    }
  }

  distanceToPoint(p: Point) {
    if (this.length === 0) return p.calculateDistance(this.a);
    let t = ((p.x - this.a.x) * (this.b.x - this.a.x) + (p.y - this.a.y) * (this.b.y - this.a.y)) / this.length;
    t = Math.max(0, Math.min(1, t));
    const closest = new Point(this.a.x + t * (this.b.x - this.a.x), this.a.y + t * (this.b.y - this.a.y))
    return p.calculateDistance(closest)
  }

  set length(length: number) {
    this.b = new Point(length * Math.cos(this.angle) + this.a.x,
      length * Math.sin(this.angle) + this.a.y)
  }

  set angle(angle: number) {
    const radians = math.degToRad(angle)
    this.b = new Point(this.length * Math.cos(radians) + this.a.x,
      this.length * Math.sin(radians) + this.a.y)
  }

}

class Rectangle implements Drawable {

  readonly width: number
  readonly height: number
  readonly a: Point
  readonly b: Point
  readonly c: Point
  readonly d: Point
  readonly vecs: Vector[]

  constructor(a: Point, c: Point)
  constructor(a: Point, width: number, height: number)
  constructor(a: Point, arg: number | Point, height?: number) {
    let w: number
    let h: number
    if (typeof arg === 'number') {
      w = arg
      h = height as number
    } else {
      const c = arg
      w = Math.abs(c.x - a.x)
      h = Math.abs(c.y - a.y)
      a = new Point(Math.min(c.x, a.x), Math.min(c.y, a.y))
    }
    this.a = a
    this.b = new Point(a.x, a.y + h)
    this.c = new Point(a.x + w, a.y + h)
    this.d = new Point(a.x + w, a.y)
    this.vecs = [new Vector(this.a, this.b),
    new Vector(this.b, this.c),
    new Vector(this.c, this.d),
    new Vector(this.d, this.a)]
    this.width = w
    this.height = h
  }

  equals = (r: Rectangle) => r.a.equals(this.a) && r.c.equals(this.c)

  draw(ctx: CanvasRenderingContext2D): void {
    const initialStrokeStyle = ctx.strokeStyle
    ctx.strokeStyle = debugCfg.colours.rectangle
    ctx.beginPath()
    ctx.rect(this.a.x, this.a.y, this.width, this.height)
    ctx.stroke()
    ctx.strokeStyle = initialStrokeStyle
  }

  static isRectangle = (arg: any): arg is Rectangle => arg.constructor.name === 'Rectangle'

  get area(): number { return this.width * this.height }

  pointCollision = (p: Point): boolean =>
    (p.x >= this.a.x && p.x <= this.c.x) &&
    (p.y >= this.a.y && p.y <= this.c.y)

  rectangleCollision = (r: Rectangle): boolean =>
    (r.c.x >= this.a.x || r.a.x <= this.c.x) &&
    (r.c.y >= this.a.y || r.a.y <= this.c.y)

  circleCollision(circle: Circle): boolean {
    const c = circle.center
    const distX = Math.abs(c.x - this.a.x - this.width / 2)
    const distY = Math.abs(c.y - this.a.y - this.height / 2)
    if (distX > (this.width / 2 + circle.radius) ||
      distY > (this.height / 2 + circle.radius)) { return false }
    if (distX <= (this.width / 2) ||
      distY <= (this.height / 2)) { return true }
    const dx = distX - this.width / 2
    const dy = distY - this.height / 2
    return dx ** 2 + dy ** 2 <= circle.radius ** 2;
  }

  vectorIntersection(v: Vector): undefined | Point {
    let minDistance = Infinity
    let minPoint: Point | undefined
    for (let i = 0; i < this.vecs.length; i++) {
      const p = this.vecs[i].intersection(v)
      if (p !== undefined) {
        const dist = p.calculateDistance(v.a)
        if (minDistance > dist) {
          minDistance = dist
          minPoint = p
        }
      }
    }
    return minPoint
  }

}

class Circle implements Drawable {

  center: Point
  readonly radius: number

  constructor(center: Point, radius: number) {
    this.radius = radius
    this.center = center
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const initialStrokeStyle = ctx.strokeStyle
    ctx.strokeStyle = debugCfg.colours.circle
    ctx.beginPath()
    ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.strokeStyle = initialStrokeStyle
  }

  static isCircle = (arg: any): arg is Circle => arg.constructor.name === 'Circle'

  circleCollision = (c: Circle): boolean =>
    this.center.calculateDistance(c.center) <= this.radius + c.radius

  pointCollision = (p: Point): boolean =>
    this.center.calculateDistance(p) <= this.radius

  vectorCollision = (v: Vector): boolean =>
    v.distanceToPoint(this.center) <= this.radius

}

export {
  Point,
  Vector,
  Rectangle,
  Circle,
  Drawable,
  math
}

