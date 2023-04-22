export const angle8Directions = {
    0: 'right',
    45: 'downright',
    90: 'down',
    135: 'downleft',
    180: 'left',
    225: 'upleft',
    270: 'up',
    315: 'upright'
};
export const direction8Angles = {
    right: 0,
    downright: 45,
    down: 90,
    downleft: 135,
    left: 180,
    upleft: 225,
    up: 270,
    upright: 315
};
export const angle4Directions = {
    0: 'right',
    90: 'down',
    180: 'left',
    270: 'up',
};
export const direction4Angles = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
};
const swap4Obj = {
    left: 'right',
    right: 'left',
    up: 'down',
    down: 'up'
};
export const oppositeDirection4 = (direction) => swap4Obj[direction];
