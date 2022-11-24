import { Drawable } from "./utils/Geometry.js"
import { config } from "./config.js"

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
const bgCanvas = document.getElementById('backgroundCanvas') as HTMLCanvasElement
const bgCtx = bgCanvas.getContext('2d') as CanvasRenderingContext2D
const debugCanvas = document.getElementById('debugCanvas') as HTMLCanvasElement
const debugCtx = debugCanvas.getContext('2d') as CanvasRenderingContext2D
const bgDebugCanvas = document.getElementById('backgroundDebugCanvas') as HTMLCanvasElement
const bgDebugCtx = bgDebugCanvas.getContext('2d') as CanvasRenderingContext2D
debugCtx.strokeStyle = config.debugColor
bgDebugCtx.strokeStyle = config.debugColor

const renderRoom = (): void => {

}

const renderRoomDebug = (objects: Drawable[]): void => {
  const bgDebugCtx = bgDebugCanvas.getContext('2d') as CanvasRenderingContext2D
  for (let i = 0; i < objects.length; i++) {
    objects[i].draw(bgDebugCtx)
  }
}

const renderUnits = (units: Drawable[]): void => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < units.length; i++) {
    units[i].draw(ctx)
  }
}

const renderDebug = (objects: Drawable[]): void => {
  debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height)
  for (let i = 0; i < objects.length; i++) {
    objects[i].draw(debugCtx)
  }
}



export { renderRoom, renderUnits, renderRoomDebug, renderDebug }
