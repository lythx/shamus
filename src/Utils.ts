const math = {
  sin: (x: number) => Math.sin(Number(x.toFixed(4))),
  cos: (x: number) => Math.cos(Number(x.toFixed(4)))
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
    ctx.strokeStyle = '#FF0000'
    ctx.beginPath()
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI)
    ctx.fillStyle = '#FF0000'
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
  }

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
      const radians = arg * Math.PI / 180
      this.b = new Point(length * math.cos(radians) + a.x,
        length * math.sin(radians) + a.y)
    } else {
      this.a = a
      this.b = arg
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    ctx.moveTo(this.a.x, this.a.y)
    ctx.lineTo(this.b.x, this.b.y)
    ctx.stroke()
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
    const degrees = 180 * angle / Math.PI;
    return (360 + Math.round(degrees)) % 360
  }

  intersection(v: Vector): Point | undefined {
    // Check if none of the lines are of length 0
    if ((this.a.x === this.b.x && this.a.y === this.b.y)
      || (v.a.x === v.b.x && v.a.y === v.b.y)) { return }
    const denominator = ((v.b.y - v.a.y) * (this.b.x - this.a.x) - (v.b.x - v.a.x) * (this.b.y - this.a.y))
    // Lines are parallel
    if (denominator === 0) { return }
    let ua = ((v.b.x - v.a.x) * (this.a.y - v.a.y) - (v.b.y - v.a.y) * (this.a.x - v.a.x)) / denominator
    let ub = ((this.b.x - this.a.x) * (this.a.y - v.a.y) - (this.b.y - this.a.y) * (this.a.x - v.a.x)) / denominator
    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) { return }
    let x = this.a.x + ua * (this.b.x - this.a.x)
    let y = this.a.y + ua * (this.b.y - this.a.y)
    return new Point(x, y)
  }

  distanceToPoint(p: Point) {
    if (this.length === 0) return p.calculateDistance(this.a);
    let t = ((p.x - this.a.x) * (this.b.x - this.a.x) + (p.y - this.a.y) * (this.b.y - this.a.y)) / this.length;
    t = Math.max(0, Math.min(1, t));
    const closest = new Point(this.a.x + t * (this.b.x - this.a.x), this.a.y + t * (this.b.y - this.a.y))
    return p.calculateDistance(closest)
  }

  isIntersecting(v: Vector): boolean {
    const det = (this.b.x - this.a.x) * (v.b.x - v.a.x) - (this.b.y - this.a.y) * (v.b.y - v.a.y)
    if (det === 0) {
      return false
    } else {
      const lambda = ((v.b.y - v.a.y) * (v.b.x - this.a.x) + (v.a.x - v.b.x) * (v.b.y - this.a.y)) / det
      const gamma = ((this.a.y - this.b.y) * (v.b.x - this.a.x) + (this.b.x - this.a.x) * (v.b.y - this.a.y)) / det
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
    }
  }

  set length(length: number) {
    this.b = new Point(length * Math.cos(this.angle) + this.a.x,
      length * Math.sin(this.angle) + this.a.y)
  }

  set angle(angle: number) {
    const radians = angle * Math.PI / 180
    this.b = new Point(this.length * Math.cos(radians) + this.a.x,
      this.length * Math.sin(radians) + this.a.y)
  }

}

class Rectangle implements Drawable {

  readonly width: number
  readonly height: number
  readonly a: Point
  readonly b: Point

  constructor(a: Point, width: number, height: number) {
    this.a = a
    this.b = new Point(a.x - height, a.y + width)
    this.width = width
    this.height = height
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath()
    ctx.rect(this.a.x, this.a.y, this.width, this.height)
    ctx.stroke()
  }

  static isRectangle = (arg: any): arg is Rectangle => arg.constructor.name === 'Rectangle'

  pointCollision = (p: Point): boolean =>
    (p.x >= this.a.x && p.x <= this.b.x) &&
    (p.y <= this.a.y && p.y >= this.b.y)

  rectangleCollision = (r: Rectangle): boolean =>
    (r.b.x >= this.a.x || r.a.x <= this.b.x) &&
    (r.b.y <= this.a.y || r.a.y >= this.b.y)

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

  getPolygons(): [Vector, Vector, Vector, Vector] {
    const rt = new Point(this.a.x, this.b.y)
    const lb = new Point(this.a.y, this.b.x)
    return [new Vector(this.a, rt),
    new Vector(rt, this.b),
    new Vector(lb, this.b),
    new Vector(this.a, lb)]
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
    ctx.beginPath()
    ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI)
    ctx.stroke()
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

