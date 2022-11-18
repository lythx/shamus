import { Circle } from "./Utils.js"
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

const renderRoomDebug = (): void => {

}

const renderUnits = (images: HTMLImageElement[]): void => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const e of images) {
    ctx.drawImage(e, e.x, e.y)
  }
}

const renderDebug = (hitboxes: Circle[]): void => {
  debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height)
  for (const e of hitboxes) {
    debugCtx.beginPath()
    debugCtx.arc(e.center.x, e.center.y, e.radius, 0, 2 * Math.PI)
    debugCtx.stroke()
  }
}



export { renderRoom, renderUnits, renderRoomDebug, renderDebug }
