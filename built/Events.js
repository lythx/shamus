import { Point, Vector } from "./utils/Geometry.js";
import { direction4Angles, direction8Angles } from './utils/Directions.js';
import { config } from "./config.js";
const movementListeners = [];
const movementKeys = config.controls.keyboard.movement;
const actionKeys = config.controls.keyboard.actions;
const actionListeners = [];
const pressedKeys = [];
let lastAngle;
let lastDevice;
let anyKeydownListener;
let blurListener;
let lastKeyboardUse = 0;
const onMoveChange = () => {
    lastDevice = 'keyboard';
    lastKeyboardUse = Date.now();
    let angle = direction4Angles[pressedKeys[0]];
    if (angle === undefined) {
        lastAngle = undefined;
        for (const e of movementListeners) {
            e(false);
        }
        return;
    }
    let angle2 = direction4Angles[pressedKeys[1]];
    if (angle2 !== undefined && Math.abs(angle - angle2) !== 180) {
        if (angle > angle2) {
            let temp = angle;
            angle = angle2;
            angle2 = temp;
        }
        if (angle2 - angle > 180) {
            angle2 -= 360;
        }
        angle = (((angle + angle2) / 2) + 360) % 360;
    }
    lastAngle = angle;
    for (const e of movementListeners) {
        e(true, angle);
    }
};
const emitActionEvent = (action) => {
    for (const listener of actionListeners) {
        if (listener.action === action) {
            listener.callback();
        }
    }
};
document.addEventListener('keydown', (e) => {
    const listener = anyKeydownListener;
    anyKeydownListener = undefined;
    listener?.(e.key);
    for (const action in actionKeys) {
        if (actionKeys[action].includes(e.key)) {
            emitActionEvent(action);
        }
    }
    for (const direction in movementKeys) {
        if (movementKeys[direction].includes(e.key)) {
            if (!pressedKeys.includes(direction)) {
                pressedKeys.push(direction);
                onMoveChange();
            }
        }
    }
});
document.addEventListener('blur', () => {
    blurListener?.();
});
document.addEventListener('keyup', (e) => {
    for (const action in movementKeys) {
        if (movementKeys[action].includes(e.key)) {
            const index = pressedKeys.indexOf(action);
            if (index !== -1) {
                pressedKeys.splice(index, 1);
                onMoveChange();
            }
        }
    }
});
let gamepad;
const padAngles = Object.values(direction8Angles);
const maxAngleDiff = Math.abs(padAngles[1] - padAngles[0]) / 2; // assume differences are even
const movementAxis = config.gamepad.axes[config.controls.gamepad.movementAxis];
const minMovementDetection = config.gamepad.minMovementDetection;
const padActionButtons = config.controls.gamepad.actions;
// https://codepedia.info/detect-browser-in-javascript
const osPadSupport = () => {
    if (navigator.userAgent.match(/chrome|chromium|crios/i)) {
        return false;
    }
    if (navigator.userAgent.match(/firefox|fxios/i)) {
        return true;
    }
    if (navigator.userAgent.match(/safari/i)) {
        return true;
    }
    if (navigator.userAgent.match(/opr\//i)) {
        return false;
    }
    if (navigator.userAgent.match(/edg/i)) {
        return false;
    }
    return false;
};
window.addEventListener("gamepadconnected", () => {
    if (!osPadSupport()) {
        return;
    }
    if (gamepad === undefined) {
        gamepad = navigator.getGamepads()[0] ?? undefined;
        requestAnimationFrame(padPoll);
    }
});
window.addEventListener("gamepaddisconnected", () => {
    if (!osPadSupport()) {
        return;
    }
    gamepad = navigator.getGamepads()[0] ?? undefined;
});
const buttonState = Object.fromEntries(Object.keys(padActionButtons).map(a => [a, false]));
const lastButtonState = [];
const padPoll = () => {
    if (gamepad === undefined) {
        return;
    }
    requestAnimationFrame(padPoll);
    if (lastKeyboardUse + 1000 > Date.now()) {
        return;
    }
    for (let i = 0; i < gamepad.buttons.length; i++) {
        if (gamepad.buttons[i].pressed && !lastButtonState[i]) {
            const listener = anyKeydownListener;
            anyKeydownListener = undefined;
            listener?.(String(i));
        }
        lastButtonState[i] = gamepad.buttons[i].pressed;
    }
    for (const action in padActionButtons) {
        let isPressed = false;
        for (let i = 0; i < padActionButtons[action].length; i++) {
            if (gamepad.buttons[padActionButtons[action][i]].pressed === true) {
                isPressed = true;
                break;
            }
        }
        if (buttonState[action] !== isPressed) {
            buttonState[action] = isPressed;
            if (buttonState[action]) {
                emitActionEvent(action);
            }
        }
    }
    if (lastDevice === 'pad' && Math.abs(gamepad.axes[movementAxis.x]) < minMovementDetection &&
        Math.abs(gamepad.axes[movementAxis.y]) < minMovementDetection) {
        lastAngle = undefined;
        pressedKeys.length = 0;
        for (let i = 0; i < movementListeners.length; i++) {
            movementListeners[i](false);
        }
    }
    else {
        const angle = new Vector(new Point(0, 0), new Point(gamepad.axes[movementAxis.x], gamepad.axes[movementAxis.y])).angle;
        let trimmedAngle = 0;
        for (let i = 0; i < padAngles.length; i++) {
            if (Math.abs(padAngles[i] - angle) <= maxAngleDiff) {
                trimmedAngle = padAngles[i];
            }
        }
        if (lastAngle !== trimmedAngle) {
            lastAngle = trimmedAngle;
            pressedKeys.length = 0;
            lastDevice = 'pad';
            for (let i = 0; i < movementListeners.length; i++) {
                movementListeners[i](true, trimmedAngle);
            }
        }
    }
};
export const events = {
    onMovementChange(callback) {
        movementListeners.push(callback);
    },
    onAction(action, callback) {
        actionListeners.push({ action, callback });
    },
    /** Deletes listener after it executes */
    onAnyKeydown(callback) {
        anyKeydownListener = callback;
    },
    onBlur(callback) {
        blurListener = callback;
    }
};
