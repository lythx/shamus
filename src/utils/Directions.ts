export type Direction8 = 'right' | 'downright' | 'down' | 'downleft' | 'left' | 'upleft' | 'up' | 'upright'
export const angle8Directions: { [angle: number]: Direction8 } = {
  0: 'right',
  45: 'downright',
  90: 'down',
  135: 'downleft',
  180: 'left',
  225: 'upleft',
  270: 'up',
  315: 'upright'
}
export const direction8Angles: { [direction in Direction8]: number } = {
  right: 0,
  downright: 45,
  down: 90,
  downleft: 135,
  left: 180,
  upleft: 225,
  up: 270,
  upright: 315
}
export type Direction4 = 'right' | 'down' | 'left' | 'up'
export const angle4Directions: { [angle: number]: Direction4 } = {
  0: 'right',
  90: 'down',
  180: 'left',
  270: 'up',
}
export const direction4Angles: { [direction in Direction4]: number } = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
}

