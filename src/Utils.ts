interface Point {
  x: number
  y: number
}

const math = {
  sin: (x: number) => Math.sin(Number(x.toFixed(4))),
  cos: (x: number) => Math.cos(Number(x.toFixed(4)))
}

class Vector {

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
      this.b = {
        x: length * math.cos(radians) + a.x,
        y: length * math.sin(radians) + a.y
      }
    } else {
      this.a = a
      this.b = arg
    }
  }

  static from(vector: Vector, length: number): Vector
  static from(vector: Vector, angle: number, fromAngle?: true): Vector
  static from(vector: Vector, arg: number, fromAngle?: true): Vector {
    if (fromAngle) {
      return new Vector(vector.a, arg, vector.length)
    }
    return new Vector(vector.a, vector.angle, arg)
  }

  static isVector(arg: any): arg is Vector {
    return ![arg.length, arg.angle, arg.copy, arg.a, arg.b].includes(undefined)
  }

  get length(): number {
    return Math.sqrt((this.b.x - this.a.x) ** 2 + (this.b.y - this.a.y) ** 2)
  }

  get angle(): number {
    const angle = Math.atan2(this.b.y - this.a.y, this.b.x - this.a.x)
    const degrees = 180 * angle / Math.PI;
    return (360 + Math.round(degrees)) % 360
  }

  copy(): Vector {
    return new Vector(this.a, this.b)
  }

  set length(length: number) {
    this.b = {
      x: length * Math.cos(this.angle) + this.a.x,
      y: length * Math.sin(this.angle) + this.a.y
    }
  }

  set angle(angle: number) {
    this.b = {
      x: this.length * Math.cos(angle) + this.a.x,
      y: this.length * Math.sin(angle) + this.a.y
    }
  }

}

export {
  Point,
  Vector,
  math
}

